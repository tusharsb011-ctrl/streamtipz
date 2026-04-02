# StreamTip — Streaming Tipping Payment Gateway

> A real-time tipping platform that lets live streamers accept **real INR payments** from viewers using Razorpay, QR codes, and shareable links — with automatic **10% commission** deduction.

---

## 📌 Overview

**StreamTip** is a full-stack Node.js web application that enables live streamers to create tipping sessions, generate QR codes, and receive real payments from viewers via **Razorpay**. When a viewer tips, the platform automatically calculates a **10% commission** (kept in the platform owner's Razorpay account) and tracks the **90% creator earnings** in a ledger for payouts.

---

## 🛠 Tech Stack

| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Backend         | Node.js + Express.js                |
| Payments        | **Razorpay** (Orders + Checkout)    |
| Frontend        | Vanilla HTML, CSS, JavaScript       |
| QR Codes        | `qrcode` npm package                |
| Unique IDs      | `uuid` (v4)                         |
| Config          | `dotenv` (environment variables)    |
| Styling         | Custom CSS — glassmorphism, dark theme, animations |

### Dependencies (`package.json`)

```json
{
  "express": "^4.18.2",
  "razorpay": "^2.x",
  "qrcode": "^1.5.3",
  "uuid": "^9.0.0",
  "dotenv": "^16.x"
}
```

---

## 📂 Project Structure

```
payment/
├── server.js                  # Express server — Razorpay integration + API routes
├── package.json               # Project metadata and dependencies
├── .env                       # Razorpay keys + commission config (not committed)
├── .env.example               # Placeholder env template
├── public/                    # Static frontend files
│   ├── index.html             # Landing page — create tipping session
│   ├── tip.html               # Viewer tip page — Razorpay Checkout
│   ├── dashboard.html         # Streamer dashboard — live tip feed + commission stats
│   ├── status.html            # Payment verification status
│   ├── css/
│   │   └── style.css          # Global styles (dark theme, glassmorphism, commission UI)
│   └── js/
│       ├── app.js             # Landing page logic (session creation, QR)
│       ├── tip.js             # Tip page — Razorpay Checkout modal flow
│       ├── dashboard.js       # Dashboard — live polling, commission breakdown
│       └── status.js          # Payment status polling + split display
```

---

## 💰 Commission System

```
Viewer tips ₹100
  ├── Platform Commission (10%):  ₹10  → stays in your Razorpay account
  └── Creator Earnings (90%):     ₹90  → tracked in ledger for payout
```

- **All money** goes to the platform owner's main Razorpay account
- The app records a **per-payment ledger** with the exact split
- Creator payouts can be done manually or via Razorpay Payouts API
- Commission percentage is configurable via `.env` (`PLATFORM_COMMISSION_PERCENT`)

---

## 🔄 How It Works — End-to-End Flow

### 1. Streamer Creates a Session (`index.html` → `app.js`)

1. Streamer enters their name and clicks **"Create Tipping Session"**
2. `POST /api/create-session` generates a unique 8-character **session ID**
3. `GET /api/qr/:sessionId` generates a QR code encoding the tip URL
4. The QR code and shareable link are displayed; session ID saved to `localStorage`

### 2. Viewer Sends a Tip (`tip.html` → `tip.js`)

1. Viewer scans QR / clicks link → `tip.html?session=<sessionId>`
2. Session info is loaded (`GET /api/session/:sessionId`) to show streamer name
3. Viewer selects an amount (₹10, ₹50, ₹100, ₹500 or custom) and optionally adds name/message
4. On **"Pay Now"**:
   - `POST /api/pay` creates a **Razorpay Order** (amount in paise, with commission calculated)
   - **Razorpay Checkout modal** opens → viewer pays via card, UPI, netbanking, or wallet
5. After payment, the Razorpay response is sent to `POST /api/verify-payment`
6. Server verifies the **HMAC SHA-256 signature** using `razorpay_order_id|razorpay_payment_id`
7. On success → payment marked as `verified`, viewer redirected to status page

### 3. Payment Verification (`status.html` → `status.js`)

1. Polls `GET /api/payment/:paymentId` every 1.5 seconds
2. Shows the verified amount with **commission breakdown**:
   - Creator receives: ₹90
   - Platform fee: ₹10
3. Option to send another tip; 60-second timeout safety

### 4. Streamer Dashboard (`dashboard.html` → `dashboard.js`)

1. Polls `GET /api/tips/:sessionId` every 2 seconds
2. Displays **5 stat cards**:
   - **Total Collected** — full tip amount
   - **Creator Earnings** — 90% (green gradient)
   - **Platform Fee** — 10% (pink gradient)
   - **Total Tips** — count of verified tips
   - **Average Tip** — per-tip average
3. **Live Tip Feed** — each tip shows avatar, name, message, amount, status badge, time, and per-tip commission split

---

## 🌐 API Reference

All routes defined in `server.js`. Server runs on **port 3000**.

| Method | Endpoint                    | Description                                       |
|--------|-----------------------------|----------------------------------------------------|
| GET    | `/api/config`               | Returns Razorpay key ID, currency, commission %    |
| POST   | `/api/create-session`       | Create a new tipping session                       |
| GET    | `/api/session/:sessionId`   | Get session info                                   |
| GET    | `/api/qr/:sessionId`        | Generate QR code for the session                   |
| POST   | `/api/pay`                  | Create Razorpay order + calculate commission split |
| POST   | `/api/verify-payment`       | Verify Razorpay payment signature (HMAC)           |
| GET    | `/api/payment/:paymentId`   | Check payment status + commission breakdown        |
| GET    | `/api/tips/:sessionId`      | Get all tips, totals, and commission breakdown     |

### Data Stores (In-Memory)

```
sessions = {
  sessionId → { createdAt, streamerName, creatorAccountId }
}

payments = {
  paymentId → {
    sessionId, amount, amountInPaise,
    commission, creatorEarnings,
    name, message, status,
    razorpayOrderId, razorpayPaymentId,
    createdAt
  }
}
```

---

## 🔐 Security

- **HMAC SHA-256 Signature Verification** — Every payment is verified server-side using Razorpay's signature
- **Server-side commission calculation** — Split is computed on the backend, not client-side
- **No secrets exposed** — Razorpay `key_secret` never leaves the server; only `key_id` is sent to frontend

---

## 🎨 Frontend Design

- **Dark glassmorphism** theme with animated floating blobs
- **Purple accent** (`#a855f7`) with cyan and pink highlights
- **Commission colors**: green gradient for creator earnings, pink gradient for platform fee
- **Razorpay Checkout** themed to match the dark UI
- **Responsive** — 5-column stats collapse to 2-column on mobile
- **Toast notifications** and smooth animations throughout

---

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Configure Razorpay keys in .env
# Copy .env.example → .env and add your keys from:
# https://dashboard.razorpay.com/app/keys

# 3. Start the server
npm start

# Server starts at http://localhost:3000
# Use Razorpay TEST mode keys first for testing
```

### Razorpay Test Card
```
Card Number: 4111 1111 1111 1111
Expiry:      Any future date
CVV:         Any 3 digits
```

---

## 📋 Key Features

- ✅ **Real Payments via Razorpay** — Cards, UPI, Netbanking, Wallets
- ✅ **10% Automatic Commission** — Configurable via `.env`
- ✅ **Commission Ledger** — Per-payment tracking of creator vs platform split
- ✅ **HMAC Signature Verification** — Secure server-side payment verification
- ✅ **QR Code Generation** — Unique QR per session
- ✅ **INR Currency** — ₹10, ₹50, ₹100, ₹500 presets + custom
- ✅ **Live Dashboard with Commission Stats** — Total, Creator Earnings, Platform Fee
- ✅ **Per-Tip Split Display** — Each tip shows its 90/10 breakdown
- ✅ **Razorpay Checkout Modal** — Themed to match the dark UI
- ✅ **Session Persistence** — Saved in localStorage

---

## ⚠️ Limitations

- **In-memory storage** — All data lost on restart (add a database for production)
- **No authentication** — Anyone with session ID can view dashboard
- **Ledger-based splits** — Payouts to creators are manual (use Razorpay Payouts API for automation)
- **No HTTPS** — Required for production Razorpay payments
- **Single server** — Not production-scaled

---

## 🔮 Future Enhancements

- Connect to **Supabase/database** for persistent storage and creator profiles
- **Razorpay Route** for automatic bank transfers to creators
- **Webhook integration** for payment event handling
- **Authentication** for streamer dashboard access
- **Payout dashboard** for creators to see their earnings
