# StreamTipz - Full Stack Streaming Alert & Donation Platform

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
   *Example: `mongodb+srv://username:password@cluster0.mongodb.net/streamtipz`*

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
StreamTipz/
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

