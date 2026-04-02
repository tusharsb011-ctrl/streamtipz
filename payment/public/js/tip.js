// ── Tip Page Logic — Razorpay Integration ─────────────────────────────
(function () {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');

  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmountInput = document.getElementById('custom-amount');
  const tipName = document.getElementById('tip-name');
  const tipMessage = document.getElementById('tip-message');
  const payBtn = document.getElementById('pay-btn');
  const streamerTitle = document.getElementById('streamer-title');
  const streamerSubtitle = document.getElementById('streamer-subtitle');

  let selectedAmount = 100;
  let appConfig = {};

  // Redirect if no session
  if (!sessionId) {
    window.location.href = 'index.html';
    return;
  }

  // Load app config (Razorpay key, currency)
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      appConfig = await res.json();
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }
  loadConfig();

  // Load session info
  async function loadSession() {
    try {
      const res = await fetch(`/api/session/${sessionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      streamerTitle.textContent = `Tip ${data.streamerName}`;
      streamerSubtitle.textContent = `Show your support for ${data.streamerName}`;
    } catch {
      streamerTitle.textContent = 'Send a Tip';
    }
  }
  loadSession();

  // Amount preset buttons
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAmount = parseFloat(btn.dataset.amount);
      customAmountInput.value = '';
    });
  });

  // Custom amount input
  customAmountInput.addEventListener('input', () => {
    if (customAmountInput.value) {
      amountBtns.forEach(b => b.classList.remove('active'));
      selectedAmount = parseFloat(customAmountInput.value);
    }
  });

  // Pay button — Razorpay Checkout
  payBtn.addEventListener('click', async () => {
    const amount = customAmountInput.value
      ? parseFloat(customAmountInput.value)
      : selectedAmount;

    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount');
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = '⏳ Creating Order...';

    try {
      // Step 1: Create Razorpay order on server
      const orderRes = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          amount,
          name: tipName.value.trim() || 'Anonymous',
          message: tipMessage.value.trim()
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // Step 2: Open Razorpay Checkout
      const options = {
        key: appConfig.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'StreamTip',
        description: `Tip for ${streamerTitle.textContent.replace('Tip ', '')}`,
        order_id: orderData.orderId,
        prefill: {
          name: tipName.value.trim() || 'Anonymous'
        },
        theme: {
          color: '#a855f7',
          backdrop_color: 'rgba(10, 10, 18, 0.85)'
        },
        modal: {
          ondismiss: function () {
            payBtn.disabled = false;
            payBtn.textContent = '💳 Pay Now';
            showToast('Payment cancelled');
          }
        },
        handler: async function (response) {
          // Step 3: Verify payment on server
          payBtn.textContent = '🔒 Verifying...';

          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: orderData.paymentId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // Redirect to status page
              window.location.href = `status.html?payment=${orderData.paymentId}&session=${sessionId}`;
            } else {
              throw new Error('Verification failed');
            }
          } catch (err) {
            showToast('Payment verification failed. Contact support.');
            payBtn.disabled = false;
            payBtn.textContent = '💳 Pay Now';
          }
        }
      };

      const rzp = new Razorpay(options);

      rzp.on('payment.failed', function (response) {
        showToast(`Payment failed: ${response.error.description}`);
        payBtn.disabled = false;
        payBtn.textContent = '💳 Pay Now';
      });

      rzp.open();

    } catch (err) {
      showToast(err.message || 'Payment failed. Please try again.');
      payBtn.disabled = false;
      payBtn.textContent = '💳 Pay Now';
    }
  });

  // Toast helper
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
})();
