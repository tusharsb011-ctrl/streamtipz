# StreamTipz System Description (Detailed)

## 1) Purpose and Product Model

StreamTipz is a creator-support platform built to let viewers send tips to streamers and trigger real-time stream overlays. The repository contains **multiple implementations** of this idea:

1. A modern production-oriented stack:
   - **Next.js frontend** (`client/`)
   - **TypeScript Express API** (`backend/`)
   - **Supabase** (Auth + PostgreSQL + Realtime)
   - **Razorpay** for payment order creation and signature verification
2. A legacy/experimental stack:
   - **Node/Express + MongoDB + Socket.IO** (`server/`)
3. A standalone payment prototype:
   - **Express + Razorpay + static HTML/JS** (`payment/`)

This split suggests deliberate iteration: keep an actively-developed production backend while retaining earlier service implementations and payment prototypes for reference and fallback.

---

## 2) Repository-Level Architecture

## Top-level modules

- `client/` — User-facing app (creator dashboard, public tip page, widget overlay, auth callbacks, profile pages).
- `backend/` — Main API with route/service layering and middleware-based security.
- `server/` — Legacy Socket.IO + MongoDB service (minimal profile route currently active).
- `payment/` — Independent payment flow demo with QR/session model and in-memory ledgers.
- `supabase_full_schema.sql`, `backend/supabase_migration.sql`, `backend/viewer_role_migration.sql` — schema/migration artifacts.

### Why this structure is meaningful

- **Risk isolation**: payment experimentation can continue in `payment/` without destabilizing the primary app.
- **Migration safety**: `server/` coexists while Supabase backend matures.
- **Operational clarity**: frontend and API are separately deployable and can scale independently.

---

## 3) Frontend (client/) — Component-by-Component

The Next.js app uses the App Router and client-heavy interactive pages with animation-rich UI.

## 3.1 Layout and shared concerns

- `src/app/layout.tsx`: root layout shell and global providers.
- `src/app/globals.css`: design system foundation (dark theme, gradients, glass effects, utility class composition).
- `src/context/AuthContext.tsx`: authentication state manager, likely wrapping Supabase auth session and exposing user/loading/signOut hooks.
- `src/lib/supabase.ts`: browser Supabase client initialization.
- `src/lib/api.ts`: API wrapper for backend endpoints (tips/profile abstraction from raw fetch).
- `src/types/supabase.ts`: generated database types for safer app-level data access.

### Design choices

- **Context-based auth** avoids prop drilling and keeps route-level auth checks straightforward.
- **Direct Supabase + backend API hybrid** gives resilience: if backend endpoints fail, some pages still read directly from Supabase.
- **Generated types** reduce runtime bugs and schema drift.

## 3.2 Public landing and marketing routes

- `src/app/page.tsx`: animated landing page (hero, features, leaderboard, nav, footer), with conditional auth CTA state.
- `src/app/about/page.tsx`, `src/app/contact/page.tsx`: static informational surfaces for brand trust.
- `src/app/robots.ts`, `src/app/sitemap.ts`: SEO crawl and discoverability support.

### Design choices

- **Motion-first UI** (Framer Motion + Lucide icons) is optimized for streamer audience expectations (high-energy, polished visuals).
- **CTA branching by auth state** lowers friction for returning creators.

## 3.3 Public tipping route

- `src/app/[streamerId]/page.tsx` is the most critical conversion route.

### What it does

1. Resolves streamer identity by username slug.
2. Optionally resolves payment code from query param (`?code=...`) to prefill amount/message and map to creator.
3. Loads social proof (tip count + top supporters).
4. Creates Razorpay orders through backend (`/api/tips/create-order`).
5. Launches Razorpay Checkout.
6. Verifies payment via backend (`/api/tips/verify-payment`).
7. Updates UI success state and local counters.

### Design choices

- **Server-issued order + server verification**: avoids client-side trust for amount and signature checks.
- **Payment code support**: enables QR campaigns and pre-configured donation intents.
- **Progressive enhancement**: fallback from code-resolve path to direct creator lookup improves reliability.

## 3.4 OBS/overlay widget route

- `src/app/widget/[streamerId]/page.tsx`

### What it does

1. Resolves creator ID from streamer slug.
2. Opens Supabase Realtime channel on `tips` table inserts filtered by creator.
3. Plays animated alert overlay and optional sound.
4. Auto-dismisses after timeout.

### Design choices

- **Database realtime over bespoke socket service** reduces backend infrastructure burden.
- **Per-creator channel filtering** keeps event fanout narrow and privacy-safe.

## 3.5 Creator dashboard routes

- `src/app/dashboard/page.tsx`: consolidated overview (tips, stats, quick links, live updates).
- `src/app/dashboard/tips/page.tsx`: tip history view.
- `src/app/dashboard/settings/page.tsx`: profile/settings management.
- `src/app/dashboard/widgets/page.tsx`: widget setup/access details.

### Data behavior

- Attempts backend API reads first (`tipsApi`, `profileApi`).
- Falls back to direct Supabase reads when needed.
- Subscribes to realtime tip inserts for live dashboard updates.

### Design choices

- **Backend-first + Supabase fallback** improves perceived uptime.
- **Client subscription updates** reduce polling load and boost “live” product feel.

## 3.6 Auth utility routes

- `src/app/login/page.tsx`, `src/app/signup/page.tsx`: user entry flow.
- `src/app/auth/callback/page.tsx`: callback/session completion.
- `src/app/logout/page.tsx`: explicit session teardown route.

---

## 4) Production Backend (backend/) — Detailed Functional Breakdown

The backend uses a clear layered style: routes (transport) → services (business logic) → config/data clients.

## 4.1 Bootstrapping and middleware pipeline

- `src/index.ts`: env load + server startup + endpoint logging.
- `src/server.ts`: app factory, middleware stack, route mounting, health endpoints.

### Middleware roles

- **helmet**: secure headers.
- **cors**: explicit allow-list including local and production domains.
- **rate-limit**: `/api/*` throttling (100 requests / 15 min / IP).
- **express JSON/urlencoded parsers** with conservative payload limits.
- **morgan** request logging except in test mode.
- Global `notFoundHandler` + `errorHandler`.

### Design choices

- **App factory pattern** improves testability and separation from process lifecycle.
- **Centralized middleware** enforces security defaults uniformly.

## 4.2 Route modules

- `src/routes/auth.routes.ts`: signup/login/me endpoints.
- `src/routes/profile.routes.ts`: current-user profile and public profile reads.
- `src/routes/tips.routes.ts`: payment code resolve/create/deactivate, order creation, payment verification, stats, notifications.
- `src/routes/creator.routes.ts`: creator settings.

### Design choices

- **Route-level zod validation** catches malformed input early.
- **`requireAuth` middleware** applied only where data sensitivity requires it.

## 4.3 Services and domain logic

- `auth.service.ts`: account lifecycle and auth token/session operations.
- `profile.service.ts`: profile CRUD + username lookup behavior.
- `creator.service.ts`: creator preferences (UPI ID, alert settings/themes).
- `payment-code.service.ts`: QR/payment-code generation and lifecycle.
- `tips.service.ts`: core payment order creation, signature verification, tip persistence, fee split calculations, stats.
- `notification.service.ts`: creation/read/unread-count lifecycle for creator notifications.

### Commission model

- Reads `PLATFORM_COMMISSION_PERCENT` from env (default 10).
- Calculates split during order creation and during verified write path.
- Persists both platform fee and creator earnings for traceable accounting.

### Security-critical path (verify-payment)

1. Build signature payload `order_id|payment_id`.
2. HMAC SHA256 with Razorpay secret.
3. Compare with provided signature.
4. Fetch trusted order metadata from Razorpay.
5. Insert verified tip row with computed breakdown.
6. Trigger notification generation.

### Design choices

- **Never trust client-provided split values**.
- **Write-on-verify** prevents pending or fake client-side success states from polluting financial records.
- **Notification side effect after persistence** keeps feed aligned with committed transactions.

## 4.4 Config modules

- `src/config/supabase.ts`: server-side Supabase client (service role).
- `src/config/razorpay.ts`: Razorpay instance initialization.

### Design choices

- **Config isolation** avoids duplicated initialization and keeps secret handling centralized.

## 4.5 Type system

- `src/types/index.ts`: shared request/response contracts and authenticated request extensions.

### Design choices

- **Shared types across routes/services** reduce integration bugs as API evolves.

---

## 5) Legacy Socket.IO Server (server/)

- `server/index.js` bootstraps Express + HTTP + Socket.IO.
- `server/config/db.js` handles MongoDB connection.
- `server/models/*.js` defines Mongoose models (`User`, `Tip`, `Widget`).
- `server/routes/profile.js` provides profile route(s).
- `server/middleware/auth.js` provides auth guarding.

### Why it still matters

- Demonstrates original realtime architecture using room-based socket events (`join-streamer-room`).
- Useful for migration reference and historical feature behavior.
- Can serve as fallback if Supabase-realtime strategy changes.

---

## 6) Standalone Payment Gateway Prototype (payment/)

This module is a complete mini-product independent of the main frontend/backend pair.

## 6.1 Backend behavior

- `payment/server.js` exposes endpoints:
  - config fetch
  - session creation
  - session lookup
  - QR generation
  - order creation
  - signature verification
  - payment status
  - session tip aggregation
- Uses in-memory `sessions` and `payments` maps (non-persistent).

## 6.2 Static frontend components

- `public/index.html` + `js/app.js`: streamer session creation + QR rendering.
- `public/tip.html` + `js/tip.js`: viewer payment initiation.
- `public/status.html` + `js/status.js`: post-payment polling/confirmation.
- `public/dashboard.html` + `js/dashboard.js`: tip ledger dashboard.
- `public/css/style.css`: custom dark glassmorphism styling.

### Design choices

- **No framework frontend** reduces setup for rapid payment-flow prototyping.
- **Polling-based status and dashboard** is easy to reason about without websocket complexity.
- **In-memory store** intentionally simple for demos, not production durability.

---

## 7) Data Layer and Schema Intent

Based on schema files and service usage, core entities include:

- `profiles`: identity, username, display metadata, role.
- `tips`: monetary events + sender/message + status + financial split + Razorpay IDs.
- `creator_settings`: creator preferences (UPI, alert options/themes).
- `payment_codes`: QR/code-driven payment presets and campaign-level tracking.
- notifications table(s): unread/read state for creator events.

### Design choices

- **Explicit fee columns** (`platform_fee`, `creator_earnings`) optimize reporting and auditability.
- **Creator foreign keys** enforce ownership segmentation.
- **Realtime-enabled tip inserts** provide low-latency overlay/dashboard UX.

---

## 8) End-to-End Runtime Flows

## Flow A: Creator onboarding

1. Creator signs up via frontend auth page.
2. Backend auth route creates account/profile.
3. Creator updates settings (UPI, theme, branding).
4. Public route `/{username}` becomes shareable.

## Flow B: Viewer tipping

1. Viewer opens creator tip page directly or through payment code QR.
2. Frontend asks backend for Razorpay order.
3. Razorpay Checkout collects payment.
4. Frontend posts payment proof to verification endpoint.
5. Backend verifies signature and records tip.
6. Notification is created; realtime listeners receive INSERT event.

## Flow C: Stream alert

1. OBS browser source loads widget route.
2. Widget subscribes to creator-scoped tip inserts.
3. New verified tip arrives.
4. Alert animation + sound executes and auto-clears.

## Flow D: Creator monitoring

1. Dashboard fetches profile/tips/stats.
2. Realtime channel updates list and derived statistics.
3. Notification endpoints support unread badge and inbox UX.

---

## 9) Design Rationale Summary

- **Hybrid architecture (API + direct Supabase reads)**: balances control and resiliency.
- **Service-layer backend**: keeps business logic testable and reusable.
- **Strong payment verification path**: protects financial integrity.
- **Realtime by database subscription**: simple, scalable event transport for this domain.
- **UI-first creator experience**: branding and trust are conversion features, not decoration.
- **Prototype preservation (`payment/`, `server/`)**: maintains experimentation speed while product core stabilizes.

---

## 10) Current Trade-offs and Engineering Notes

- Some UX copy references different fee percentages in different places (e.g., 8% vs 10% logic), so business-rule consistency should be standardized before production hardening.
- Dual backend patterns (legacy + modern) improve flexibility but increase maintenance overhead.
- Prototype in-memory payment data is intentionally ephemeral and unsuitable for production reconciliation.

---

## 11) Recommended Next Technical Steps

1. Consolidate all commission constants into one shared config contract across frontend/backend copy and calculations.
2. Add end-to-end tests for payment verification, duplicate webhook/payment handling, and notification creation.
3. Move any fallback direct writes/reads behind controlled API surfaces if stricter policy or audit requirements grow.
4. Introduce durable event auditing for tip→alert pipelines (idempotency keys + delivery traces).
5. Document migration path and deprecation timeline for `server/` and `payment/` modules.

---

This document is intentionally detailed so future maintainers can understand **what each component does, why it exists, how data moves, and why key design choices were made**.
