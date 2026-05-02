# 📊 WaveTips — Technical Reference Tables

> Detailed technical tables documenting the technology stack, database schema, API surface, dependency versions, security layers, environment configuration, and deployment architecture of the WaveTips platform.

---

## Table 1 — Technology Stack & Frameworks

| #  | Category              | Technology                    | Version      | Purpose                                                      |
|----|-----------------------|-------------------------------|--------------|--------------------------------------------------------------|
| 1  | Frontend Framework    | Next.js (App Router)          | 16.1.6       | Server-side rendering, file-based routing, React framework   |
| 2  | UI Library            | React                         | 19.2.3       | Component-based UI rendering                                 |
| 3  | Language (Frontend)   | TypeScript                    | ^5           | Static type checking for frontend code                       |
| 4  | Styling               | Tailwind CSS                  | ^4           | Utility-first CSS framework for responsive design            |
| 5  | Animations            | Framer Motion                 | 12.34.3      | Declarative animations & micro-interactions                  |
| 6  | Icons                 | Lucide React                  | 0.575.0      | Lightweight, customizable SVG icon set                       |
| 7  | Backend Framework     | Express.js                    | ^4.21.2      | REST API server framework (production backend)               |
| 8  | Language (Backend)    | TypeScript                    | ^5.7.3       | Static type checking for backend code                        |
| 9  | Database (Production) | Supabase (PostgreSQL)         | —            | Managed PostgreSQL with Auth, RLS, and real-time features    |
| 10 | Database (Legacy)     | MongoDB Atlas (Mongoose)      | ^9.2.3       | NoSQL document database for legacy server                    |
| 11 | Real-Time Engine      | Socket.IO                     | ^4.8.3       | WebSocket-based real-time tip alert delivery                 |
| 12 | Payment Gateway       | Razorpay                      | ^2.9.6       | UPI/card payment processing with order & signature verify    |
| 13 | State Management      | React Context API              | —            | Auth state management via `AuthContext.tsx`                   |
| 14 | Data Fetching         | TanStack React Query          | ^5.90.21     | Server state caching, background refetching                  |
| 15 | HTTP Client           | Axios                         | ^1.13.6      | Promise-based HTTP requests to backend API                   |
| 16 | Validation            | Zod                           | ^3.24.2      | Runtime schema validation for request payloads               |
| 17 | Compiler Target       | ES2020                        | —            | TypeScript compilation target for backend                    |

---

## Table 2 — Database Schema (Supabase PostgreSQL)

| #  | Table                    | Primary Key              | Key Columns                                                                                                              | RLS Enabled | Description                                      |
|----|--------------------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------------------------|
| 1  | `profiles`               | `id` (UUID, FK → auth.users) | `email`, `username` (UNIQUE), `full_name`, `avatar_url`, `role` (default: 'creator'), `created_at`                   | ✅           | User profiles, 1:1 mapping with Supabase Auth    |
| 2  | `tips`                   | `id` (BIGSERIAL)         | `creator_id` (FK), `sender_id` (FK, nullable), `sender_name`, `amount` (NUMERIC 10,2), `message`, `platform_fee`, `creator_earnings`, `razorpay_order_id`, `razorpay_payment_id`, `payment_code`, `status`, `created_at` | ✅ | Stores all tip transactions with commission split |
| 3  | `creator_settings`       | `creator_id` (UUID, FK)  | `upi_id`, `upi_name`, `min_tip_amount` (default: 10), `payment_enabled`, `tip_page_message`, `show_leaderboard`, `thank_you_message`, `alert_theme`, `alert_sound`, `currency` (default: 'INR'), `created_at`, `updated_at` | ✅ | Per-creator widget & payment configuration       |
| 4  | `payment_codes`          | `id` (UUID, auto-gen)    | `code` (UNIQUE), `creator_id` (FK), `amount`, `message_template`, `is_active` (default: TRUE), `created_at`              | ✅           | QR payment codes for quick tipping               |
| 5  | `payment_notifications`  | `id` (UUID, auto-gen)    | `creator_id` (FK), `tip_id` (FK, nullable), `type` (default: 'tip_received'), `message`, `is_read` (default: FALSE), `created_at` | ✅ | In-app notification system for creators          |

### Database Indexes

| Index Name                     | Table                   | Column(s)                    | Type         | Purpose                          |
|--------------------------------|-------------------------|------------------------------|--------------|----------------------------------|
| `idx_payment_codes_code`       | `payment_codes`         | `code`                       | B-Tree       | Fast QR code lookup on scan      |
| `idx_payment_codes_creator`    | `payment_codes`         | `creator_id`                 | B-Tree       | Quick creator code retrieval     |
| `idx_notifications_creator`    | `payment_notifications` | `creator_id`                 | B-Tree       | Fast notification list fetch     |
| `idx_notifications_unread`     | `payment_notifications` | `creator_id`, `is_read`      | Partial (WHERE is_read = FALSE) | Efficient unread count queries  |

### Database Triggers

| Trigger Name           | Table      | Event         | Function                          | Purpose                                              |
|------------------------|------------|---------------|-----------------------------------|------------------------------------------------------|
| `on_profile_created`   | `profiles` | AFTER INSERT  | `handle_new_user_settings()`      | Auto-creates default `creator_settings` for new creators |

---

## Table 3 — REST API Endpoints

### Authentication (`/api/auth`)

| #  | Method | Endpoint            | Auth Required | Request Body                                | Response                          | Description                |
|----|--------|---------------------|---------------|---------------------------------------------|-----------------------------------|----------------------------|
| 1  | POST   | `/api/auth/signup`  | ❌ No          | `{ email, password, username, full_name }`  | `{ user, session }`              | Register a new creator     |
| 2  | POST   | `/api/auth/login`   | ❌ No          | `{ email, password }`                       | `{ user, session, token }`       | Login & receive JWT token  |
| 3  | GET    | `/api/auth/me`      | 🔒 Yes         | —                                           | `{ user profile }`               | Get current user details   |

### Profile Management (`/api/profile`)

| #  | Method | Endpoint                 | Auth Required | Request Body                                      | Response               | Description             |
|----|--------|--------------------------|---------------|---------------------------------------------------|------------------------|-------------------------|
| 4  | GET    | `/api/profile/me`        | 🔒 Yes         | —                                                 | `{ profile }`          | Get own profile         |
| 5  | PUT    | `/api/profile/me`        | 🔒 Yes         | `{ full_name?, username?, avatar_url?, bio? }`    | `{ updated profile }`  | Update own profile      |
| 6  | GET    | `/api/profile/:username` | ❌ No          | —                                                 | `{ public profile }`   | Get public creator info |

### Tipping (`/api/tips`)

| #  | Method | Endpoint                | Auth Required | Request Body                                                       | Response                                    | Description                      |
|----|--------|-------------------------|---------------|--------------------------------------------------------------------|---------------------------------------------|----------------------------------|
| 7  | POST   | `/api/tips/send`        | ❌ No          | `{ creator_id, sender_name, amount, message?, payment_code? }`    | `{ order_id, amount, commission_breakdown }` | Create Razorpay tip order        |
| 8  | POST   | `/api/tips/verify`      | ❌ No          | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`  | `{ tip, breakdown }`                        | Verify payment & record tip      |
| 9  | GET    | `/api/tips/my-tips`     | 🔒 Yes         | Query: `limit`, `offset`                                           | `{ tips[], pagination }`                    | Get received tips (paginated)    |
| 10 | GET    | `/api/tips/stats`       | 🔒 Yes         | —                                                                  | `{ stats object }`                          | Get tip statistics & analytics   |

### Creator Settings (`/api/creator`)

| #  | Method | Endpoint                | Auth Required | Request Body                                                              | Response              | Description             |
|----|--------|-------------------------|---------------|---------------------------------------------------------------------------|-----------------------|-------------------------|
| 11 | GET    | `/api/creator/settings` | 🔒 Yes         | —                                                                         | `{ settings }`        | Get creator settings    |
| 12 | PUT    | `/api/creator/settings` | 🔒 Yes         | `{ upi_id?, alert_theme?, alert_sound?, min_tip_amount?, ... }`          | `{ updated settings }` | Update creator settings |

---

## Table 4 — NPM Dependencies & Versions

### Frontend (`client/package.json`)

| #  | Package                         | Version    | Type        | Purpose                                            |
|----|---------------------------------|------------|-------------|----------------------------------------------------|
| 1  | `next`                          | 16.1.6     | Production  | React framework with SSR & App Router              |
| 2  | `react`                         | 19.2.3     | Production  | UI rendering library                               |
| 3  | `react-dom`                     | 19.2.3     | Production  | React DOM bindings                                 |
| 4  | `@supabase/supabase-js`         | ^2.98.0    | Production  | Supabase client for auth & database queries        |
| 5  | `@supabase/auth-helpers-nextjs` | ^0.15.0    | Production  | Supabase auth integration for Next.js              |
| 6  | `@tanstack/react-query`         | ^5.90.21   | Production  | Async state management & data fetching             |
| 7  | `axios`                         | ^1.13.6    | Production  | HTTP client for backend API calls                  |
| 8  | `framer-motion`                 | ^12.34.3   | Production  | Animation library for UI transitions               |
| 9  | `lucide-react`                  | ^0.575.0   | Production  | Icon library (lightweight SVG icons)               |
| 10 | `socket.io-client`              | ^4.8.3     | Production  | WebSocket client for real-time alerts              |
| 11 | `tailwindcss`                   | ^4         | Development | Utility-first CSS framework                       |
| 12 | `@tailwindcss/postcss`          | ^4         | Development | PostCSS plugin for Tailwind                        |
| 13 | `typescript`                    | ^5         | Development | TypeScript compiler                                |
| 14 | `eslint` + `eslint-config-next` | ^9 / 16.1.6 | Development | Code linting & Next.js lint rules                |

### Backend (`backend/package.json`)

| #  | Package               | Version   | Type        | Purpose                                       |
|----|-----------------------|-----------|-------------|-----------------------------------------------|
| 1  | `express`             | ^4.21.2   | Production  | HTTP server & REST API framework              |
| 2  | `@supabase/supabase-js` | ^2.49.1 | Production  | Supabase admin client (service role)          |
| 3  | `cors`                | ^2.8.5    | Production  | Cross-Origin Resource Sharing middleware      |
| 4  | `helmet`              | ^8.0.0    | Production  | Secure HTTP headers middleware                |
| 5  | `morgan`              | ^1.10.0   | Production  | HTTP request logging                          |
| 6  | `express-rate-limit`  | ^7.5.0    | Production  | API rate limiting (100 req / 15 min)          |
| 7  | `razorpay`            | ^2.9.6    | Production  | Razorpay payment gateway SDK                  |
| 8  | `zod`                 | ^3.24.2   | Production  | Runtime request validation schemas            |
| 9  | `dotenv`              | ^16.4.7   | Production  | Environment variable loader                   |
| 10 | `typescript`          | ^5.7.3    | Production  | TypeScript compiler                           |
| 11 | `nodemon`             | ^3.1.9    | Development | Auto-restart server on file changes           |
| 12 | `ts-node`             | ^10.9.2   | Development | Run TypeScript directly without compiling     |

### Legacy Server (`server/package.json`)

| #  | Package               | Version   | Purpose                                        |
|----|-----------------------|-----------|------------------------------------------------|
| 1  | `express`             | ^5.2.1    | HTTP server (Express v5)                       |
| 2  | `mongoose`            | ^9.2.3    | MongoDB ODM for data modeling                  |
| 3  | `socket.io`           | ^4.8.3    | WebSocket server for real-time alerts          |
| 4  | `@supabase/supabase-js` | ^2.98.0 | Supabase client for auth verification         |
| 5  | `bcryptjs`            | ^3.0.3    | Password hashing (10 salt rounds)              |
| 6  | `jsonwebtoken`        | ^9.0.3    | JWT creation & verification                    |
| 7  | `jwks-rsa`            | ^4.0.0    | JWKS key retrieval for Supabase JWT verify     |
| 8  | `cors`                | ^2.8.6    | CORS middleware                                |
| 9  | `dotenv`              | ^17.3.1   | Environment variable loader                    |

---

## Table 5 — Security Architecture

| #  | Security Layer              | Implementation                  | Configuration                                  | Protection Against                        |
|----|-----------------------------|---------------------------------|------------------------------------------------|-------------------------------------------|
| 1  | **Authentication**          | Supabase Auth (JWT)             | Bearer token in `Authorization` header         | Unauthorized access to protected routes   |
| 2  | **HTTP Security Headers**   | Helmet.js v8                    | Default secure headers enabled                 | XSS, clickjacking, MIME sniffing          |
| 3  | **CORS Policy**             | Express CORS middleware         | Whitelist: `localhost:3000`, `thewavetips.tech` | Cross-origin request forgery              |
| 4  | **Rate Limiting**           | express-rate-limit              | 100 requests per 15-minute window per IP       | Brute force, DDoS, API abuse             |
| 5  | **Request Body Limit**      | Express JSON parser             | Max body size: `10kb`                          | Payload-based denial of service           |
| 6  | **Input Validation**        | Zod schemas                     | Runtime validation on all POST/PUT routes      | Injection attacks, malformed data         |
| 7  | **Row Level Security (RLS)**| Supabase PostgreSQL policies    | Enabled on all 5 tables                        | Unauthorized data access at database level|
| 8  | **Password Hashing**        | bcryptjs                        | 10 salt rounds                                 | Password leaks from database breaches     |
| 9  | **Payment Signature Verify**| HMAC-SHA256 (Razorpay)          | `order_id|payment_id` signed with key secret   | Payment tampering & replay attacks        |
| 10 | **Service Role Isolation**  | Supabase Service Role Key       | Server-side only, never exposed to client      | Privilege escalation                      |

---

## Table 6 — Environment Variables

### Backend (`.env`)

| #  | Variable                       | Example Value                              | Required | Description                                     |
|----|--------------------------------|--------------------------------------------|----------|-------------------------------------------------|
| 1  | `PORT`                         | `5000`                                     | ✅        | Backend server port                             |
| 2  | `NODE_ENV`                     | `development` / `production`               | ✅        | Runtime environment flag                        |
| 3  | `SUPABASE_URL`                 | `https://xxx.supabase.co`                  | ✅        | Supabase project URL                            |
| 4  | `SUPABASE_SERVICE_ROLE_KEY`    | `eyJhbGciOiJIUzI1NiIs...`                 | ✅        | Supabase admin key (full DB access)             |
| 5  | `CORS_ORIGIN`                  | `http://localhost:3000`                    | ⚠️ Optional | Additional allowed CORS origin                  |
| 6  | `RAZORPAY_KEY_ID`              | `rzp_live_xxxx`                            | ✅        | Razorpay API key ID                             |
| 7  | `RAZORPAY_KEY_SECRET`          | `secret_xxxx`                              | ✅        | Razorpay API key secret (for signature verify)  |
| 8  | `PLATFORM_COMMISSION_PERCENT`  | `10`                                       | ⚠️ Optional | Platform commission % (defaults to 10%)         |

### Frontend (`.env.local`)

| #  | Variable                        | Example Value                              | Required | Description                                     |
|----|---------------------------------|--------------------------------------------|----------|-------------------------------------------------|
| 1  | `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co`                  | ✅        | Supabase project URL (client-safe)              |
| 2  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...`                 | ✅        | Supabase anonymous/public key                   |
| 3  | `NEXT_PUBLIC_SERVER_URL`        | `http://localhost:5000`                    | ✅        | Backend API base URL                            |
| 4  | `NEXT_PUBLIC_RAZORPAY_KEY_ID`   | `rzp_live_xxxx`                            | ✅        | Razorpay key ID (for checkout SDK)              |

---

## Table 7 — Deployment & Hosting Architecture

| #  | Component             | Platform        | URL / Domain                     | Build Command       | Start Command            | Key Notes                                          |
|----|-----------------------|-----------------|----------------------------------|---------------------|--------------------------|----------------------------------------------------|
| 1  | **Frontend**          | Vercel          | `https://thewavetips.tech`       | `next build`        | `next start`             | Auto-deploys from Git, edge CDN, SSR support       |
| 2  | **Backend API**       | Render          | `https://api.thewavetips.tech`   | `tsc`               | `node dist/index.js`     | TypeScript compiled to JS, auto-scaling            |
| 3  | **Database**          | Supabase Cloud  | `https://xxx.supabase.co`        | —                   | —                        | Managed PostgreSQL, free tier, auto backups        |
| 4  | **Auth Service**      | Supabase Auth   | Built-in to Supabase             | —                   | —                        | Google OAuth + email/password, JWT tokens          |
| 5  | **Payment Gateway**   | Razorpay        | Dashboard at `dashboard.razorpay.com` | —             | —                        | UPI, cards, net banking; 10% platform commission   |
| 6  | **Legacy Server**     | (Development)   | `http://localhost:5000`          | —                   | `node index.js`          | MongoDB + Socket.IO, used for real-time alerts     |
| 7  | **Version Control**   | GitHub          | Private repository               | —                   | —                        | Git-based CI/CD triggers for Vercel & Render       |

### Frontend Build Pipeline

| Step | Action                    | Tool / Command         | Output                          |
|------|---------------------------|------------------------|---------------------------------|
| 1    | Install dependencies      | `npm install`          | `node_modules/`                 |
| 2    | Lint check                | `eslint`               | Lint report                     |
| 3    | TypeScript compile        | `next build` (built-in)| `.next/` production bundle      |
| 4    | Deploy                    | Vercel auto-deploy     | Live at `thewavetips.tech`      |

### Backend Build Pipeline

| Step | Action                    | Tool / Command         | Output                          |
|------|---------------------------|------------------------|---------------------------------|
| 1    | Install dependencies      | `npm install`          | `node_modules/`                 |
| 2    | TypeScript compile        | `tsc`                  | `dist/` directory (JS output)   |
| 3    | Start server              | `node dist/index.js`   | Express API on configured PORT  |
| 4    | Dev mode                  | `nodemon --exec ts-node src/index.ts` | Hot-reload dev server |

---

*Document generated for WaveTips — Last updated: May 2026*
