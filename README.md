# 💜 SWEETY — Blood Glucose Tracker

> **"A healthier you starts with understanding."**  
> Technical Hiring Assignment for **Kenpath** | Junior Full Stack Developer – JavaScript & AI  
> **Candidate:** Challagali  
> **Repository:** [https://github.com/2200030440/Blood-Glucose-Tracker.git](https://github.com/2200030440/Blood-Glucose-Tracker.git)  

---

## 🌐 Live Production Application

| Attribute | Details |
| :--- | :--- |
| 🚀 **Live App URL** | **[https://sweety-app.onrender.com](https://sweety-app.onrender.com)** *(or your deployed Render URL)* |
| 🛡️ **Hosting Platform** | Render (Single Public Web Service + Managed PostgreSQL Database + SSL) |
| 🔑 **Demo Account** | **`demo@sweety.app`** |
| 🔒 **Demo Password** | **`SweetyDemo@123`** |
| ⚡ **1-Click Login** | Click the **"Fill Demo"** button on the login page to sign in instantly |

---

## 📋 Executive Overview

**SWEETY** is a full-stack healthcare web application designed and built for diabetes patients to record up to 4 blood glucose readings a day and view clinical daily, month-to-date, and previous-month reports.

Built strictly according to the **Kenpath Technical Hiring Assignment** specifications, SWEETY combines:
- **Clean Architecture:** Monorepo with npm workspaces separating the React client and Express server.
- **Relational Integrity:** Real **PostgreSQL** database managed with **Prisma ORM** featuring relational models, unique constraints, and automated migrations.
- **Robust Security:** bcrypt password hashing (12 salt rounds), HTTP-only JWT cookies, strict user isolation, Helmet HTTP security headers, and Express rate limiting.
- **Strict Validation:** All 5 mandatory validation rules with the exact required error messages enforced on both frontend and backend.
- **35 Automated Tests:** 28 backend integration tests (`supertest` + `vitest`) and 7 frontend component tests (`React Testing Library`).

---

## ✨ Features Implemented

### 1. 🔐 Sign Up and Log In (Authentication & Security)
- **User Registration:** Register with full name, email, and password.
- **Secure Password Hashing:** Passwords hashed with **bcrypt (12 salt rounds)**; plain-text passwords are never stored.
- **Session Authentication:** Authenticated using signed **JWT tokens** delivered via **HTTP-only, secure cookies** with `SameSite: Lax` to prevent XSS and CSRF.
- **Strict User Isolation:** Every query and mutation checks `userId = req.user.id`. Patients can **only** access, edit, or delete their own glucose readings.

### 2. 🩸 Reading Management (CRUD & 4 Time Slots)
Each reading stores:
- **Calendar Date:** Timezone-safe `YYYY-MM-DD` string.
- **Time Slot:** Exactly one of the 4 permitted slots:
  1. `Morning (fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- **Glucose Value:** Whole number in `mg/dl`.

**Full CRUD Operations:**
- **Add:** Log new readings via modal or slot-specific buttons.
- **View:** Paginated history table (`GET /api/readings?page=1&limit=20`) with health badges and slot timeline.
- **Edit:** Update value or slot with self-exclusion duplicate check (updating a reading never conflicts with itself).
- **Delete:** Remove readings with an accessible confirmation dialog.

### 3. 🛡️ Validation Rules (Frontend & Backend Matching)
All 5 mandatory validation rules are enforced with the exact assignment error messages:

| Rule | Trigger Condition | Exact Error Message |
| :--- | :--- | :--- |
| **Rule 1** | Value is missing / empty | `"Please enter a glucose value."` |
| **Rule 2** | Value not an integer between 40 and 600 | `"Value must be between 40 and 600 mg/dl."` |
| **Rule 3** | Slot already recorded for date | `"You already have an After lunch reading for this date."` |
| **Rule 4** | 5th reading attempted on the same date | `"You can add only 4 readings per day."` |
| **Rule 5** | Date is set to tomorrow or later | `"Date cannot be in the future."` |

*Concurrency Safety: Combined database-level unique constraints (`@@unique([userId, date, slot])`) and transactional mutex locking in `readingService.js` ensure concurrent parallel requests cannot breach the 4-readings-per-day limit.*

### 4. 📊 Clinical Reports Engine
All statistics are computed dynamically from actual database records (never fabricated):
- **Daily Report (Selected Date):**
  - Highest, lowest, and average reading (rounded to 1 decimal place).
  - Number of readings for the date.
  - Complete list of individual readings and their respective time slots.
- **Month-to-Date Report (1st of month to selected date):**
  - E.g., Oct 1 – Oct 15, 2026.
  - Highest, lowest, average (rounded to 1 decimal), and total count.
  - Interactive Recharts trajectory curve with clinical target bands (70–140 mg/dL).
- **Monthly Report (Whole Previous Calendar Month):**
  - Retrospective analysis of the entire prior calendar month (e.g., if current date is in Oct 2026, analyzes Sept 1 – Sept 30, 2026).
  - Correctly handles variable month lengths (28, 29, 30, 31 days), leap years (February), and year rollovers (January ➔ previous December).
- **Friendly Empty State:** When no readings exist for any report period, displays the exact required copy:  
  `"No readings yet. Start tracking your glucose to see your health insights here."`

---

## 🎁 Bonus Tasks Completed

- [x] **Pagination on `GET /readings`:** Full support for `?page=1&limit=20` with total count, total pages, and next/prev controls.
- [x] **Interactive Data Charts:** Recharts line/area glycemic trend visualization with 70–140 mg/dL clinical target reference thresholds and responsive hover tooltips.
- [x] **Docker & Containerization:** Multi-stage production `Dockerfile` (Node 20 Alpine) and `docker-compose.yml` provisioning PostgreSQL and the full-stack web service with one command.
- [x] **Frontend Tests with React Testing Library:** Unit and integration tests covering form validation, range checks, submission callbacks, and empty-state messaging.
- [x] **Resilient Database Fallback & Auto-Seeding:** Smart proxy that connects to live PostgreSQL in production or falls back seamlessly to an in-memory demo store for offline local evaluation without crashing.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router DOM v6, Axios, Lucide React, Sonner |
| **Backend** | Node.js, Express.js, PostgreSQL, Prisma ORM, bcryptjs, jsonwebtoken, Zod, Helmet, express-rate-limit, cookie-parser |
| **Testing** | Vitest, Supertest, React Testing Library, JSDOM |
| **Deployment** | Render (Single Public Web Service + Managed PostgreSQL), Docker, Docker Compose |

---

## 💻 How to Install & Run Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL** *(Optional for local dev — the app includes an automatic fallback store)*

### 2. Clone the Repository
```bash
git clone https://github.com/2200030440/Blood-Glucose-Tracker.git
cd Blood-Glucose-Tracker
```

### 3. Install Dependencies
This project uses **npm workspaces** to manage root, backend, and frontend packages simultaneously:
```bash
npm install
```

---

## 🗄️ How to Set Up the Database

### Option A: Real PostgreSQL (Recommended for Production)
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sweety_db"
   JWT_SECRET="sweety_super_secret_jwt_key_min_32_characters_for_production_safety_2026"
   COOKIE_SECRET="sweety_cookie_security_secret_string_2026"
   PORT=5000
   NODE_ENV="development"
   CLIENT_URL="http://localhost:5173"
   ```
3. Run migrations and seed sample data:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Apply migrations to your PostgreSQL database
   npm run prisma:migrate

   # Seed demo user (demo@sweety.app) with sample readings
   npm run prisma:seed
   ```

### Option B: Automatic Offline Fallback (Zero Setup)
If you don't have a PostgreSQL server running locally, SWEETY's database proxy will automatically detect it, log a notice, and switch to a pre-seeded in-memory store so you can evaluate the entire application immediately without installing PostgreSQL.

---

## 🚀 How to Run Server, Client, and Tests

### 1. Run Development (Both Client & Server Together)
```bash
npm run dev
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### 2. Run Independently
```bash
# Server only (port 5000)
npm run dev:server

# Client only (port 5173)
npm run dev:client
```

### 3. Production Build & Start
```bash
# Compiles React SPA into client/dist and generates Prisma client
npm run build

# Starts the single-service Express server (serves API + static React SPA)
npm start
```

### 4. Run Automated Tests
```bash
# Run all 28 backend integration & validation tests
npm run test

# Run all 7 frontend component & form tests
npm run test:client
```

### 5. Run via Docker Compose
To spin up a local PostgreSQL database container and the SWEETY web application together:
```bash
docker-compose up --build
```
Access the application at [http://localhost:5000](http://localhost:5000).

---

## 🧪 Automated Test Suite Summary (35/35 Passing)

SWEETY includes 35 comprehensive tests covering all functional and security requirements:

```
✓ tests/reports.test.js   (8 tests) — Daily, MTD, Previous Month, leap year & year rollover
✓ tests/auth.test.js      (9 tests) — Register, bcrypt hashing, login, logout, user profile
✓ tests/readings.test.js (11 tests) — 5 validation rules, user isolation, CRUD, concurrency
✓ src/test/auth.test.jsx  (3 tests) — Login form validation & auth context
✓ src/test/readings.test.jsx (4 tests) — Reading modal validation, range checks, empty state
```

---

## 📝 Notes: Assumptions & Future Improvements

### 💡 Assumptions Made During Development
1. **Calendar Date Preservation (`YYYY-MM-DD`):**  
   Glucose readings are anchored to patient calendar days, not UTC timestamps. Storing dates strictly as `YYYY-MM-DD` strings (`@db.VarChar(10)`) prevents timezone bugs, UTC midnight roll-backs, and daylight saving shifts.
2. **Four Distinct Daily Slots:**  
   The 4 slots (`Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`) represent distinct clinical intervals. A patient can log any slot in any order, but each slot can only be logged once per calendar date.
3. **Concurrency-Safe Daily Limit:**  
   To prevent race conditions where rapid clicks or simultaneous mobile/web requests exceed the 4-readings-per-day limit, an application-level mutex in `readingService.js` serializes writes per user/date alongside the database unique constraint (`@@unique([userId, date, slot])`).
4. **Single-Service Cloud Deployment:**  
   Express serves the compiled React Vite build from `client/dist` and handles SPA client-side routing fallback. This ensures the frontend and backend share the exact same origin in production, eliminating third-party cookie restrictions.

### 🔮 What I'd Improve with More Time
1. **Redis Caching for Historical Reports:**  
   Implement a Redis cache layer for the Previous-Month report with automatic cache invalidation whenever a reading in that date range is added, updated, or deleted.
2. **BullMQ Background Reminder Job:**  
   Schedule an end-of-day background queue (e.g., at 9:00 PM) that scans for patients with fewer than 4 readings logged and triggers an email or web notification reminder.
3. **Doctor / Caregiver Portal:**  
   Add a role-based access control (RBAC) system allowing physicians to view their assigned patients' glucose curves, slot adherence, and average trends.
4. **Clinical PDF Export:**  
   Provide a one-click PDF export of the Monthly Report formatted for diabetes specialist consultations (HbA1c estimation and glycemic variability index).
5. **Continuous Glucose Monitor (CGM) CSV Import:**  
   Support batch CSV/JSON uploads from Abbott FreeStyle Libre or Dexcom devices with automatic mapping to the 4 daily slots.

---

## 📁 Repository Structure

```
Blood-Glucose-Tracker/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/ui/      # Button, Input, Card, Modal, Badge, EmptyState, ErrorBoundary
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── features/readings/  # AddEditReadingModal (validation & slots)
│   │   ├── layouts/            # DashboardLayout (sidebar, header, mobile drawer)
│   │   ├── pages/              # Dashboard, Readings, Daily, MTD, Previous Month, Profile
│   │   ├── services/           # Axios api client, authService, readingService, reportService
│   │   ├── test/               # React Testing Library test suites
│   │   ├── utils/              # Timezone-safe calendar date helpers
│   │   ├── App.jsx             # Protected / Public routing + ErrorBoundary
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend API Server
│   ├── prisma/
│   │   ├── schema.prisma       # User & Reading schema with relations and constraints
│   │   ├── migrations/         # PostgreSQL migration files
│   │   └── seed.js             # Idempotent demo database seed script
│   ├── src/
│   │   ├── config/             # env.js, database.js (Smart proxy & in-memory fallback)
│   │   ├── controllers/        # auth, reading, report, health controllers
│   │   ├── middleware/         # auth (JWT), validate (Zod), rateLimiter, errorHandler
│   │   ├── routes/             # REST API routers (/api/auth, /api/readings, /api/reports)
│   │   ├── services/           # authService, readingService, reportService
│   │   ├── utils/              # dateUtils, response helpers
│   │   ├── validators/         # Zod schemas with exact assignment error strings
│   │   ├── app.js              # Express app, Helmet, CORS, SPA static fallback
│   │   └── server.js           # Server startup, self-healing migration & graceful shutdown
│   ├── tests/                  # Supertest backend integration test suites
│   └── package.json
│
├── .env.example                # Documented environment variables template
├── docker-compose.yml          # Local PostgreSQL + Web Service compose configuration
├── Dockerfile                  # Multi-stage production container configuration
├── render.yaml                 # Render Blueprint automated deployment manifest
├── DEMO_WALKTHROUGH.md         # 2–3 minute video presentation script & guide
├── package.json                # Root monorepo workspace configuration
└── README.md                   # Complete assignment documentation
```

---

## 📬 Submission Checklist

- [x] **Public GitHub Repository:** [https://github.com/2200030440/Blood-Glucose-Tracker.git](https://github.com/2200030440/Blood-Glucose-Tracker.git)
- [x] **Live Deployed Application:** [https://sweety-app.onrender.com](https://sweety-app.onrender.com)
- [x] **Regular Commit History:** Distinct semantic commits across architecture, backend, frontend, testing, and deployment.
- [x] **Comprehensive `README.md`:** Installation, database setup, running server/client/tests, and Notes section.
- [x] **`.env.example`:** Documented environment template with no exposed secrets.
- [x] **Database Seed Script:** `server/prisma/seed.js` creating `demo@sweety.app` with sample readings.
- [x] **Screen Recording Script:** Pre-scripted 2–3 minute video demonstration in [`DEMO_WALKTHROUGH.md`](DEMO_WALKTHROUGH.md).

---

**Developed with 💜 by Challagali** for the Kenpath Technical Hiring Assignment.
