# 🚀 WaveTipz Backend API

Production-grade backend for WaveTipz — a tipping platform for creators.  
Powered by **Node.js + TypeScript + Express + Supabase**.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase admin client
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts      # Central error handler + 404
│   │   └── validate.ts          # Zod request validation
│   ├── services/
│   │   ├── auth.service.ts      # Signup, Login, GetMe
│   │   ├── profile.service.ts   # Profile CRUD
│   │   ├── tips.service.ts      # Send & fetch tips
│   │   └── creator.service.ts   # Creator settings
│   ├── routes/
│   │   ├── auth.routes.ts       # /api/auth/*
│   │   ├── profile.routes.ts    # /api/profile/*
│   │   ├── tips.routes.ts       # /api/tips/*
│   │   └── creator.routes.ts    # /api/creator/*
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── server.ts                # Express app factory
│   └── index.ts                 # Entry point
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Never commit your `.env` file!** It contains your service role key.

### 3. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### 🏥 Health Check

| Method | Endpoint         | Auth | Description          |
|--------|------------------|------|----------------------|
| GET    | `/api/health`    | ❌   | Server health status |

### 🔑 Authentication

| Method | Endpoint           | Auth | Description                |
|--------|--------------------|------|----------------------------|
| POST   | `/api/auth/signup` | ❌   | Register new user          |
| POST   | `/api/auth/login`  | ❌   | Login (returns JWT)        |
| GET    | `/api/auth/me`     | 🔒   | Get current user profile   |

**Signup Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "username": "johndoe"
}
```

**Login Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 👤 Profile

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| GET    | `/api/profile/me`         | 🔒   | Get own profile          |
| PUT    | `/api/profile/me`         | 🔒   | Update own profile       |
| GET    | `/api/profile/:username`  | ❌   | Get public profile       |

**Update Profile Body:**
```json
{
  "full_name": "Updated Name",
  "avatar_url": "https://example.com/avatar.jpg",
  "username": "newusername"
}
```

### 💸 Tips

| Method | Endpoint             | Auth | Description                  |
|--------|----------------------|------|------------------------------|
| POST   | `/api/tips/send`     | ❌   | Send a tip (public)          |
| GET    | `/api/tips/my-tips`  | 🔒   | Get received tips (paginated)|
| GET    | `/api/tips/stats`    | 🔒   | Get tip statistics           |

**Send Tip Body:**
```json
{
  "creator_id": "uuid-of-creator",
  "sender_name": "Fan123",
  "message": "Great stream!",
  "amount": 100
}
```

**Query Params for `/my-tips`:**
- `limit` (default: 50)
- `offset` (default: 0)

### ⚙️ Creator Settings

| Method | Endpoint                 | Auth | Description              |
|--------|--------------------------|------|--------------------------|
| GET    | `/api/creator/settings`  | 🔒   | Get creator settings     |
| PUT    | `/api/creator/settings`  | 🔒   | Update creator settings  |

**Update Settings Body:**
```json
{
  "upi_id": "creator@upi",
  "alert_sound": "coins.mp3",
  "alert_theme": "neon"
}
```

Available themes: `default`, `neon`, `minimal`, `fireworks`, `gaming`

---

## 🔒 Authentication

Protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

Get the token from the `/api/auth/login` response.

---

## 🛡️ Security Features

- **Helmet** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Zod Validation** — Request body validation with detailed errors
- **RLS** — Row Level Security enabled on all Supabase tables
- **Service Role Key** — Never exposed in responses or logs

---

## 📊 Database Schema (Supabase)

| Table              | Description                          |
|--------------------|--------------------------------------|
| `profiles`         | User profiles (1:1 with auth.users)  |
| `tips`             | Tips sent to creators                |
| `creator_settings` | UPI, alert config per creator        |

> Schema is managed directly in Supabase. No SQL migrations in this repo.

---

## 🧑‍💻 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT)
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiter
