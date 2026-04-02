# 💸 StreamTipz — Full-Stack Streaming Donation & Alert Platform

> A premium, real-time tipping and alert management platform built for **Indian streamers & content creators**, enabling fans to send tips via UPI with instant on-screen alerts for OBS/Streamlabs.

---

## 📌 Project Overview

**StreamTipz** is a complete web application designed to bridge the gap between Indian streamers and their supporters. The platform allows content creators (streamers) to set up personalized tipping pages where fans can send monetary tips using India's UPI payment system (Google Pay, PhonePe, Paytm, etc.). Each tip triggers a real-time animated alert that can be overlaid on the streamer's live broadcast through OBS Studio or Streamlabs.

The project follows a **modern full-stack architecture** with a clear separation between the frontend client, and two backend implementations — one using MongoDB and Socket.IO for real-time communication, and a production-grade TypeScript backend powered by Supabase (PostgreSQL).

---

## 🎯 Key Features

### For Creators (Streamers)
- **Personalized Tipping Page** — Each creator gets a unique public URL (`/[streamerId]`) where fans can send tips
- **Creator Dashboard** — View received tips, earnings statistics, and manage account settings
- **Customizable Alert Widget** — Browser-source overlay for OBS with configurable themes (`default`, `neon`, `minimal`, `fireworks`, `gaming`), alert sounds, durations, and message templates
- **UPI Integration** — Accept payments directly via any Indian UPI app
- **Daily Payouts** — Funds credited to the creator's bank/UPI daily with no manual withdrawal
- **QR Code Generator** — Generate QR codes for easy sharing of tipping pages
- **Profile Management** — Update display name, avatar, bio, and username

### For Fans (Tippers)
- **Quick Tip Submission** — Simple, clean tip form with preset amounts (₹50, ₹100, ₹500) and custom amounts
- **Anonymous or Named Tips** — Option to send tips as anonymous or with a custom sender name
- **Personal Messages** — Attach a message to the tip that appears in the streamer's alert

### Platform Features
- **Real-Time Alerts** — Socket.IO powered instant notification system with zero delay
- **Live Leaderboard** — Top streamers and top viewers rankings displayed on the landing page
- **Admin Panel** — System-wide administration dashboard
- **Responsive Design** — Mobile-first UI with glassmorphism, gradients, and smooth animations
- **Authentication System** — Secure signup/login with Supabase Auth (JWT-based)
- **92% Earnings Retention** — Platform takes a minimal platform fee

---

## 🏗️ Architecture

The project uses a **three-tier architecture** with distinct folders for the frontend, a legacy server, and a production-grade backend:

```
StreamTipz/
│
├── client/              # 🖥️  Next.js 14 Frontend (App Router)
│   └── src/
│       ├── app/         # Pages & Routing
│       │   ├── page.tsx              # Landing page with hero, features, leaderboard
│       │   ├── login/                # Creator login page
│       │   ├── signup/               # Creator registration page
│       │   ├── dashboard/            # Creator dashboard (tips, stats, settings)
│       │   ├── admin/                # System admin panel
│       │   ├── [streamerId]/         # Dynamic public tipping page per creator
│       │   ├── widget/               # OBS alert widget overlay
│       │   ├── qr-generator/         # QR code generation utility
│       │   ├── about/                # About Us page
│       │   ├── contact/              # Contact page
│       │   ├── auth/                 # Auth callback handler
│       │   └── logout/               # Logout handler
│       ├── context/
│       │   └── AuthContext.tsx        # Supabase auth state management
│       ├── lib/
│       │   ├── supabase.ts           # Supabase client initialization
│       │   └── api.ts                # Backend API wrapper (profile, tips, creator)
│       └── types/
│           └── supabase.ts           # Auto-generated Supabase TypeScript types
│
├── server/              # ⚡ Express Server (MongoDB + Socket.IO)
│   ├── config/
│   │   └── db.js                     # MongoDB Atlas connection handler
│   ├── models/
│   │   ├── User.js                   # User schema (username, email, balance, etc.)
│   │   ├── Tip.js                    # Tip schema (amount, sender, message, status)
│   │   └── Widget.js                 # Widget settings (alert config per user)
│   ├── middleware/                    # Auth & validation middleware
│   ├── routes/
│   │   └── profile.js                # Profile API endpoints
│   └── index.js                      # Entry point with Socket.IO rooms
│
├── backend/             # 🚀 Production Backend (TypeScript + Supabase)
│   └── src/
│       ├── config/
│       │   └── supabase.ts           # Supabase admin client (service role)
│       ├── middleware/
│       │   ├── auth.ts               # JWT authentication middleware
│       │   ├── errorHandler.ts       # Central error handler + 404
│       │   └── validate.ts           # Zod request body validation
│       ├── services/
│       │   ├── auth.service.ts       # Signup, Login, GetMe
│       │   ├── profile.service.ts    # Profile CRUD operations
│       │   ├── tips.service.ts       # Send & fetch tips with statistics
│       │   └── creator.service.ts    # Creator settings management
│       ├── routes/
│       │   ├── auth.routes.ts        # /api/auth/*
│       │   ├── profile.routes.ts     # /api/profile/*
│       │   ├── tips.routes.ts        # /api/tips/*
│       │   └── creator.routes.ts     # /api/creator/*
│       ├── types/
│       │   └── index.ts              # TypeScript interfaces
│       ├── server.ts                 # Express app factory
│       └── index.ts                  # Entry point
│
├── test_supabase.js     # 🧪 Supabase connectivity test script
└── README.md            # 📖 Project documentation
```

---

## 🛠️ Tech Stack

| Layer          | Technology                                                              |
|----------------|-------------------------------------------------------------------------|
| **Frontend**   | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion |
| **UI/Icons**   | Lucide React, Glassmorphism design, Custom gradient system              |
| **Backend (v1)** | Node.js, Express.js, Mongoose (MongoDB), Socket.IO                   |
| **Backend (v2)** | Node.js, TypeScript, Express.js, Supabase (PostgreSQL)               |
| **Auth**       | Supabase Auth (JWT tokens)                                              |
| **Database**   | Supabase (PostgreSQL) with Row Level Security, MongoDB Atlas            |
| **Validation** | Zod (schema-based runtime validation)                                   |
| **Security**   | Helmet, CORS, Rate Limiting (100 req/15 min), bcrypt password hashing   |
| **Real-Time**  | Socket.IO (WebSocket rooms per streamer)                                |
| **Logging**    | Morgan (HTTP request logger)                                            |
| **Dev Tools**  | Nodemon, ts-node, ESLint                                                |

---

## 📊 Database Schema

### Supabase (PostgreSQL) — Production

| Table              | Purpose                                  | Key Columns                                          |
|--------------------|------------------------------------------|------------------------------------------------------|
| `profiles`         | User profiles (1:1 with `auth.users`)    | `id`, `email`, `username`, `full_name`, `avatar_url`, `role` |
| `tips`             | All tips sent to creators                | `id`, `creator_id`, `sender_name`, `amount`, `message`      |
| `creator_settings` | Per-creator widget & payment config      | `creator_id`, `upi_id`, `alert_sound`, `alert_theme`        |

### MongoDB — Legacy Server

| Collection | Purpose                                    | Key Fields                                                    |
|------------|--------------------------------------------|---------------------------------------------------------------|
| `users`    | Creator accounts                           | `username`, `email`, `password`, `displayName`, `bio`, `balance` |
| `tips`     | Tip transactions                           | `streamer`, `senderName`, `amount`, `message`, `currency`, `status` |
| `widgets`  | Per-user alert widget configuration        | `userId`, `type`, `settings` (minAmount, duration, image, sound, etc.) |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint            | Auth | Description               |
|--------|---------------------|------|---------------------------|
| POST   | `/api/auth/signup`  | ❌   | Register a new creator    |
| POST   | `/api/auth/login`   | ❌   | Login & receive JWT token |
| GET    | `/api/auth/me`      | 🔒   | Get current user profile  |

### Profile Management (`/api/profile`)
| Method | Endpoint                   | Auth | Description           |
|--------|----------------------------|------|-----------------------|
| GET    | `/api/profile/me`          | 🔒   | Get own profile       |
| PUT    | `/api/profile/me`          | 🔒   | Update own profile    |
| GET    | `/api/profile/:username`   | ❌   | Get public profile    |

### Tipping (`/api/tips`)
| Method | Endpoint              | Auth | Description                      |
|--------|-----------------------|------|----------------------------------|
| POST   | `/api/tips/send`      | ❌   | Send a tip to a creator (public) |
| GET    | `/api/tips/my-tips`   | 🔒   | Get received tips (paginated)    |
| GET    | `/api/tips/stats`     | 🔒   | Get tip statistics & analytics   |

### Creator Settings (`/api/creator`)
| Method | Endpoint                  | Auth | Description             |
|--------|---------------------------|------|-------------------------|
| GET    | `/api/creator/settings`   | 🔒   | Get creator settings    |
| PUT    | `/api/creator/settings`   | 🔒   | Update creator settings |

---

## 🔐 Security

- **JWT Authentication** — All protected routes require a valid `Authorization: Bearer <token>` header
- **Helmet.js** — Sets secure HTTP headers to prevent XSS, clickjacking, MIME sniffing
- **CORS** — Configured origin whitelist ensuring only authorized frontends can make requests
- **Rate Limiting** — 100 API requests per 15-minute window per IP to prevent abuse
- **Zod Validation** — Runtime request body validation with detailed error messages
- **Row Level Security (RLS)** — Enabled on all Supabase tables for data isolation
- **Password Hashing** — bcrypt with 10 salt rounds for secure password storage
- **Service Role Key Protection** — Supabase admin keys never exposed in client responses

---

## 🌐 Frontend Routes

| Route                    | Page                  | Description                                      |
|--------------------------|-----------------------|--------------------------------------------------|
| `/`                      | Landing Page          | Hero section, features, leaderboard, footer      |
| `/login`                 | Login                 | Creator authentication via Supabase              |
| `/signup`                | Sign Up               | New creator registration                         |
| `/dashboard`             | Creator Dashboard     | Tip history, earnings stats, settings management |
| `/admin`                 | Admin Panel           | System-wide administration                       |
| `/[streamerId]`          | Public Tip Page       | Unique per-creator tip submission page           |
| `/widget/[streamerId]`   | Alert Widget          | OBS browser source overlay for live alerts       |
| `/qr-generator`          | QR Generator          | Generate shareable QR codes for tipping pages    |
| `/about`                 | About Us              | Platform information                             |
| `/contact`               | Contact               | Contact form / info                              |

---

## ⚡ Real-Time System

StreamTipz uses **Socket.IO** for real-time communication between the backend and the alert widgets:

1. **Streamer rooms** — When a widget loads for a streamer, it joins a Socket.IO room identified by the `streamerId`
2. **Tip event flow**:
   - Fan submits a tip via the public tipping page
   - Backend processes and stores the tip
   - Server emits a Socket.IO event to the streamer's room
   - The OBS widget in that room receives the event and displays the animated alert
3. **Zero-delay** alerts — WebSocket connection ensures sub-second alert delivery

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** LTS (v18+)
- **npm** (comes with Node.js)
- A **Supabase** project (free tier available at [supabase.com](https://supabase.com))
- *(Optional)* MongoDB Atlas cluster for the legacy server

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/streamtipz.git
cd streamtipz
```

### 2. Setup the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

```bash
npm run dev    # Development server with hot reload
```

### 3. Setup the Frontend
```bash
cd client
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

```bash
npm run dev    # Starts Next.js at http://localhost:3000
```

### 4. Setup Supabase Database
Create the following tables in your Supabase project:

- **`profiles`** — `id` (uuid, PK), `email`, `username`, `full_name`, `avatar_url`, `role`, `created_at`
- **`tips`** — `id` (int8, PK), `creator_id` (FK → profiles.id), `sender_name`, `amount`, `message`, `created_at`
- **`creator_settings`** — `creator_id` (FK → profiles.id, PK), `upi_id`, `alert_sound`, `alert_theme`, `created_at`

Enable **Row Level Security** on all tables.

---

## 📱 UI Design

The frontend features a **premium dark-themed** design with:

- **Glassmorphism** — Frosted glass cards with backdrop blur effects
- **Gradient accents** — Vibrant gradient buttons, badges, and glowing elements
- **Framer Motion animations** — Smooth fade-in, slide-up, and hover micro-interactions
- **Responsive layout** — Mobile-first design that scales beautifully to desktop
- **Custom typography** — Clean, modern font hierarchy with tight tracking
- **Dark color palette** — Deep blacks (`#0B0B0F`) with subtle white/primary borders

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Credits

Developed by the **Harshplay Community**  
Copyright © 2026 — Made with 💜 for Indian Creators
