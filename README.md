# WaveTipz - Full Stack Streaming Alert & Donation Platform

A premium, modern web application for streamers to manage tips and real-time alerts.

## 🚀 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose
- **Real-time**: Socket.IO for instant alert triggering

## 📂 Project Structure
```
.
├── client/          # Next.js Frontend
│   └── src/
│       ├── app/    # App Router (Landing, Dashboard, Admin, Profile, Widget)
│       └── components/ # Reusable UI components
└── server/         # Express Backend
    ├── config/     # Database configuration
    ├── models/     # Mongoose schemas (User, Tip, Widget)
    └── index.js    # Entry point & Socket.IO setup
```

## 📘 MANUAL WORK DOCUMENTATION

### 1️⃣ Node.js Installation
**Purpose**: Node.js is required to run the backend server and manage packages using npm.

**Steps**:
1. Open browser and go to: [https://nodejs.org](https://nodejs.org)
2. Download **LTS (Long Term Support)** version.
3. Install using default settings.
4. Verify installation in your terminal:
   ```bash
   node -v
   npm -v
   ```
**Expected Output**: Node and npm versions should be displayed.

---

### 2️⃣ MongoDB Atlas Database Creation
**Purpose**: MongoDB Atlas is used as a cloud database to store users, tips, and transactions.

**Steps**:
1. Visit: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account.
3. Click **Create Cluster** → choose **Free Tier (M0)**.
4. Select cloud provider and region.
5. Create database user (username & password).
6. **Whitelist IP**: Allow access from anywhere (`0.0.0.0/0`) for development.
7. Copy the MongoDB connection URI.
   *Example: `mongodb+srv://username:password@cluster0.mongodb.net/wavetipz`*

---

### 3️⃣ Environment Variables (.env File)
**Purpose**: To securely store sensitive information like database URI and API keys.

**Steps**:
1. In the `server` folder, create a file named `.env`.
2. Add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000
   ```
3. In the `client` folder, create `.env.local`:
   ```env
   NEXT_PUBLIC_SERVER_URL=http://localhost:5000
   ```
4. Ensure `.env` is added to your `.gitignore`.

---

### 4️⃣ Project Run Locally
**Purpose**: To test the application in a local development environment.

#### ▶️ Backend Run
1. `cd server`
2. `npm install`
3. `npm run dev`
*Expected output: `Server running on port 5000` & `MongoDB Connected`*

#### ▶️ Frontend Run
1. `cd client`
2. `npm install`
3. `npm run dev`
4. Open browser at: [http://localhost:3000](http://localhost:3000)

---

### 5️⃣ Folder Structure (Manual Verification)
```text
WaveTipz/
│
├── client/          # Next.js Frontend
│   ├── src/app/     # Pages & Routing
│   ├── components/  # UI Components
│   └── public/      # Assets
│
├── server/          # Express Backend
│   ├── routes/      # API Endpoints
│   ├── models/      # Database Schemas
│   ├── config/      # DB Connection
│   └── index.js     # Entry Point
│
└── .env             # Configuration
```

---

## 📍 Key Routes
- `/` - Landing Page
- `/login` - Creator Login
- `/signup` - Creator Registration
- `/[streamerId]` - Public Tip Submission Page
- `/dashboard` - Creator Dashboard
- `/admin` - System Admin Panel
- `/widget/[streamerId]` - Alert Widget (Overlay for OBS)

# 🚀 WaveTipz Deployment Guide

## Architecture Overview

```mermaid
graph LR
    subgraph "Frontend"
        A[Next.js 16 App] -->|Deployed to| B[Vercel]
    end
    subgraph "Backend"
        C[Express + TypeScript API] -->|Deployed to| D[Render / Railway]
    end
    subgraph "Services"
        E[Supabase - Database + Auth]
        F[Razorpay - Payments]
    end
    B -->|API calls| D
    D --> E
    D --> F
    B --> E
```

Your app has **3 pieces** — and Supabase is already cloud-hosted, so you only need to deploy **2 things**:

| Component | Deploy To (Recommended) | Cost |
|-----------|------------------------|------|
| **Frontend** (Next.js) | **Vercel** | Free tier |
| **Backend** (Express API) | **Render** | Free tier |
| **Database** (Supabase) | Already hosted ✅ | Free tier |

---

## Step 1: Push Code to GitHub

> [!IMPORTANT]
> Both Vercel and Render deploy from GitHub repos. If you haven't already, push your code.

```bash
# From the tipz root folder
cd c:\Users\ranjeeta\Downloads\tipz

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - WaveTipz"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wavetipz.git
git branch -M main
git push -u origin main
```

> [!CAUTION]
> Make sure `.env` and `.env.local` are in your `.gitignore`! Never push secrets to GitHub.

Verify your `.gitignore` files include:
```
# backend/.gitignore
node_modules
dist
.env

# client/.gitignore (already has this)
.env.local
```

---

## Step 2: Deploy the Backend to Render

[Render](https://render.com) is the easiest free option for Express/Node APIs.

### 2.1 — Create a Render Account
1. Go to [render.com](https://render.com) and sign up with GitHub

### 2.2 — Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `wavetipz-api` |
| **Region** | Pick closest to your users (Singapore for India) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 2.3 — Add Environment Variables

In the Render dashboard → **Environment** tab, add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `SUPABASE_URL` | `https://pefbtibpovosunxkramv.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your service role key)* |
| `CORS_ORIGIN` | `https://your-app.vercel.app` ← *update after Vercel deploy* |
| `RAZORPAY_KEY_ID` | *(your production Razorpay key)* |
| `RAZORPAY_KEY_SECRET` | *(your production Razorpay secret)* |
| `PLATFORM_COMMISSION_PERCENT` | `10` |

### 2.4 — Deploy
Click **"Create Web Service"**. Render will build and deploy automatically.

Your backend URL will be something like:
```
https://wavetipz-api.onrender.com
```

> [!NOTE]
> Render's free tier spins down after 15 mins of inactivity. The first request after idle takes ~30 seconds to cold-start. Upgrade to the **Starter plan ($7/mo)** to keep it always-on.

---

## Step 3: Deploy the Frontend to Vercel

[Vercel](https://vercel.com) is the best platform for Next.js — it's built by the same team.

### 3.1 — Create a Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub

### 3.2 — Import Your Project
1. Click **"Add New Project"**
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | *(leave default)* |

### 3.3 — Add Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SERVER_URL` | `https://wavetipz-api.onrender.com` ← *your Render URL* |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pefbtibpovosunxkramv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your Supabase anon key)* |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | *(your production Razorpay key ID)* |

### 3.4 — Deploy
Click **"Deploy"**. Vercel will build and give you a URL like:
```
https://wavetipz.vercel.app
```

> [!IMPORTANT]
> After getting your Vercel URL, go back to **Render** and update the `CORS_ORIGIN` environment variable to match your Vercel URL (e.g., `https://wavetipz.vercel.app`). Then redeploy the backend.

---

## Step 4: Post-Deployment Checklist

### 4.1 — Update CORS on Backend
Go to Render → Environment Variables → set:
```
CORS_ORIGIN=https://wavetipz.vercel.app
```
Then **manually redeploy**.

### 4.2 — Update Supabase Auth Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   ```
   https://wavetipz.vercel.app
   ```

### 4.3 — Update Razorpay Webhook (if using)
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **Webhooks**
3. Add your backend URL:
   ```
   https://wavetipz-api.onrender.com/api/tips/verify-payment
   ```

### 4.4 — Custom Domain (Optional)
- **Vercel**: Settings → Domains → Add your domain (e.g., `wavetipz.com`)
- **Render**: Settings → Custom Domains → Add your API domain (e.g., `api.wavetipz.com`)

---

## Step 5: Verify Everything Works

```bash
# Test backend health
curl https://wavetipz-api.onrender.com/api/health

# Then open the frontend
# https://wavetipz.vercel.app
```

Try:
- [x] Sign up for a new account
- [x] Log in
- [x] Visit a public streamer page
- [x] Create a tip/payment code
- [x] Test a payment flow

---

## Alternative Backend Hosts

If you prefer something other than Render:

### Railway ($5 credit/month free)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
cd backend
railway init
railway up
```
Set env vars in the Railway dashboard.

### Fly.io (free tier available)
```bash
# Install flyctl
# Then from the backend folder:
fly launch
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... CORS_ORIGIN=...
fly deploy
```

---

## Quick Summary

```mermaid
sequenceDiagram
    participant You
    participant GitHub
    participant Render
    participant Vercel
    
    You->>GitHub: Push code
    You->>Render: Connect repo, set root=backend
    Render-->>You: https://wavetipz-api.onrender.com
    You->>Vercel: Connect repo, set root=client
    Vercel-->>You: https://wavetipz.vercel.app
    You->>Render: Update CORS_ORIGIN to Vercel URL
    You->>Vercel: Done! 🎉
```

| Step | Action | Time |
|------|--------|------|
| 1 | Push to GitHub | 2 min |
| 2 | Deploy backend on Render | 5 min |
| 3 | Deploy frontend on Vercel | 3 min |
| 4 | Update CORS & Supabase settings | 2 min |
| **Total** | | **~12 min** |

## Complete Deployment Guide (From Scratch)

This guide walks you through deploying **WaveTipz**, specifically detailing how to set up the database and authentication layers assuming you are starting completely fresh.

### Part 1: Supabase Setup (Database & Authentication)
Supabase replaces traditional databases and complex authentication workflows by offering a Postgres Database and an Auth system out of the box.

**Step 1: Create a Project**
1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click **New Project**, select an organization, and give your project a name (e.g., *WaveTipz*).
3. Set a strong, secure database password and choose a region close to your target audience.
4. Wait for the project database to be fully provisioned (takes ~2 minutes).

**Step 2: Initialize the Database Schema (Important)**
We have prepared a complete schema initialization file for you located at supabase_full_schema.sql at the root of the project.
1. In your Supabase Dashboard, look to the left sidebar and click on **SQL Editor**.
2. Click **New query**.
3. Open the supabase_full_schema.sql file from your local computer, copy all of its text, and paste it into the editor.
4. Click **Run**.
*Success!* All your required tables (profiles, creator_settings, 	ips, payment_codes, payment_notifications), Row Level Security (RLS) policies, and Triggers are now properly initialized.

**Step 3: Configure Authentication**
1. Go to **Authentication** (left sidebar) -> **Providers**.
2. **Email & Password**: Ensure this is enabled.
3. **Google OAuth (Optional but Recommended)**: Enable the Google provider if you wish. You will need to obtain a Client ID and Client Secret from the Google Cloud Console.
4. **URL Configuration**:
   - Go to **Authentication** -> **URL Configuration**.
   - Under **Site URL**, put your local frontend URL for now (http://localhost:3000).
   - Under **Redirect URLs**, add http://localhost:3000/auth/callback.

**Step 4: Gather Supabase Keys**
1. Go to **Project Settings** (the gear icon) -> **API**.
2. You will need the **Project URL**, the **anon public key**, and the **service_role secret key** for the backend/frontend configurations.

### Part 2: Backend Deployment (Render)
1. Commit all your latest code to your GitHub Repository.
2. Log into [Render](https://render.com/).
3. Click **New** -> **Web Service**.
4. Connect the GitHub repository for this project.
5. Setup the service details:
   - **Name**: wavetipz-backend
   - **Root Directory**: ackend
   - **Environment**: Node
   - **Build Command**: 
pm install && npm run build
   - **Start Command**: 
pm run start 
6. Add the following **Environment Variables**:
   - NODE_ENV: production
   - SUPABASE_URL: *(Your Supabase Project URL)*
   - SUPABASE_SERVICE_ROLE_KEY: *(Your Supabase service_role key - KEEP THIS SECRET)*
   - RAZORPAY_KEY_ID: *(Your Razorpay ID)*
   - RAZORPAY_KEY_SECRET: *(Your Razorpay Secret)*
   - CORS_ORIGIN: *
7. Click **Deploy Web Service** and wait for the "Live" status. Copy your Render Backend URL.

### Part 3: Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
2. Import the GitHub repository for WaveTipz.
3. In the project setup, set the **Framework Preset** to Next.js and **Root Directory** to client.
4. Add the following **Environment Variables**:
   - NEXT_PUBLIC_SERVER_URL: *(Your new Render Backend URL)*
   - NEXT_PUBLIC_SUPABASE_URL: *(Your Supabase Project URL)*
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: *(Your Supabase anon public key)*
   - NEXT_PUBLIC_RAZORPAY_KEY_ID: *(Your Razorpay ID)*
5. Click **Deploy**. Vercel will process the build. Once finished, you will receive a Live URL.

### Part 4: Finalizing Connections
Now that both frontend and backend are live on the internet, secure their communication:
1. **Verify Webhooks**: Go to your Razorpay Dashboard -> Top left "Test Mode" -> **Webhooks**. Add a webhook pointing to https://<YOUR-RENDER-BACKEND-URL>/api/tips/webhook. Listen for the payment.captured event.
2. **Restrict CORS**: Go to the **Render Dashboard**, edit the wavetipz-backend environment variables, and change CORS_ORIGIN from * to https://<YOUR-VERCEL-FRONTEND-URL>.
3. **Update Supabase Redirects**: Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**. Change your "Site URL" to your Vercel URL, and add https://<YOUR-VERCEL-FRONTEND-URL>/auth/callback to the Redirect URIs list.
