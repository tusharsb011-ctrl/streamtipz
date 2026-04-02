require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// ── Razorpay Instance ────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const COMMISSION_PERCENT = parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory data store ─────────────────────────────────────────────
const sessions = {};   // sessionId → { createdAt, streamerName, creatorAccountId }
const payments = {};   // paymentId → { sessionId, amount, commission, creatorEarnings, name, message, status, razorpayOrderId, razorpayPaymentId, createdAt }

// ── Expose Razorpay Key ID to frontend ───────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    currency: 'INR',
    commissionPercent: COMMISSION_PERCENT
  });
});

// ── API Routes ───────────────────────────────────────────────────────

// Create a new tipping session (streamer side)
app.post('/api/create-session', (req, res) => {
  const { streamerName, creatorAccountId } = req.body;
  const sessionId = uuidv4().slice(0, 8);
  sessions[sessionId] = {
    createdAt: new Date().toISOString(),
    streamerName: streamerName || 'Streamer',
    // Placeholder: creator's bank/account details for future payout
    // This would come from their database profile in production
    creatorAccountId: creatorAccountId || 'CREATOR_ACCOUNT_PLACEHOLDER'
  };
  res.json({ sessionId });
});

// Get session info
app.get('/api/session/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ sessionId: req.params.sessionId, ...session });
});

// Generate QR code for a tipping session
app.get('/api/qr/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  if (!sessions[sessionId]) return res.status(404).json({ error: 'Session not found' });

  const tipUrl = `${req.protocol}://${req.get('host')}/tip.html?session=${sessionId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(tipUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#c084fc', light: '#0f0a1e' }
    });
    res.json({ qrDataUrl, tipUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// ── Create Razorpay Order (viewer initiates payment) ─────────────────
app.post('/api/pay', async (req, res) => {
  const { sessionId, amount, name, message } = req.body;

  if (!sessions[sessionId]) return res.status(404).json({ error: 'Session not found' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const amountInPaise = Math.round(parseFloat(amount) * 100);
  const commission = Math.round(amountInPaise * COMMISSION_PERCENT / 100);
  const creatorEarnings = amountInPaise - commission;

  try {
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: uuidv4().slice(0, 12),
      notes: {
        sessionId,
        tipperName: name || 'Anonymous',
        message: message || ''
      }
    });

    // Store payment record
    const paymentId = order.receipt;
    payments[paymentId] = {
      sessionId,
      amount: parseFloat(amount),
      amountInPaise,
      commission: commission / 100,         // Store as rupees
      creatorEarnings: creatorEarnings / 100, // Store as rupees
      name: name || 'Anonymous',
      message: message || '',
      status: 'pending',
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      createdAt: new Date().toISOString()
    };

    res.json({
      paymentId,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      commission: commission / 100,
      creatorEarnings: creatorEarnings / 100
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// ── Verify Razorpay Payment Signature ────────────────────────────────
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature', verified: false });
  }

  // Update payment record
  if (payments[paymentId]) {
    payments[paymentId].status = 'verified';
    payments[paymentId].razorpayPaymentId = razorpay_payment_id;
  }

  res.json({
    verified: true,
    paymentId,
    message: 'Payment verified successfully'
  });
});

// Check payment status
app.get('/api/payment/:paymentId', (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json({
    paymentId: req.params.paymentId,
    status: payment.status,
    amount: payment.amount,
    commission: payment.commission,
    creatorEarnings: payment.creatorEarnings,
    name: payment.name
  });
});

// Get all tips for a session (streamer dashboard)
app.get('/api/tips/:sessionId', (req, res) => {
  if (!sessions[req.params.sessionId]) return res.status(404).json({ error: 'Session not found' });

  const tips = Object.entries(payments)
    .filter(([_, p]) => p.sessionId === req.params.sessionId)
    .map(([id, p]) => ({ paymentId: id, ...p }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const verifiedTips = tips.filter(t => t.status === 'verified');
  const total = verifiedTips.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = verifiedTips.reduce((sum, t) => sum + t.commission, 0);
  const totalCreatorEarnings = verifiedTips.reduce((sum, t) => sum + t.creatorEarnings, 0);

  res.json({
    tips,
    total,
    totalCommission,
    totalCreatorEarnings,
    commissionPercent: COMMISSION_PERCENT,
    streamerName: sessions[req.params.sessionId].streamerName
  });
});

// ── Start Server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ⚡ StreamTip Gateway running at http://localhost:${PORT}`);
  console.log(`  💳 Razorpay Key: ${process.env.RAZORPAY_KEY_ID ? '✓ Loaded' : '✗ Missing!'}`);
  console.log(`  📊 Commission: ${COMMISSION_PERCENT}%\n`);
});
