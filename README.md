# 💜 SWEETY — Blood Glucose Tracker

> **"A healthier you starts with understanding."**  
> *Technical Hiring Assignment for Kenpath | Full-Stack Production Healthcare SaaS*

![SWEETY Application Banner](https://img.shields.io/badge/SWEETY-Healthcare%20SaaS-7665E8?style=for-the-badge&logo=heart&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20PostgreSQL%20%7C%20Prisma-5B4BC4?style=for-the-badge)
![Tests](https://img.shields.io/badge/Automated%20Tests-35%2F35%20Passing-2EAD83?style=for-the-badge)
![Railway](https://img.shields.io/badge/Deployment-Railway%20Single--Service-0B0D0E?style=for-the-badge&logo=railway)

---

## 🌟 Executive Summary

**SWEETY** is a full-stack blood glucose tracking SaaS web application designed and engineered to satisfy every strict requirement of the **Kenpath Technical Hiring Assignment**. 

Engineered with a **Single Public Web Service** architecture on **Railway**, SWEETY combines a React 18 frontend with an Express.js backend and a **PostgreSQL** database managed via **Prisma ORM**.

### 🎨 Visual Identity & Healthcare Design System
- **Color Palette**:
  - Primary Violet: `#7665E8`
  - Deep Violet: `#5B4BC4`
  - Soft Lavender: `#F0EDFF`
  - Main Background: `#F8F9FD`
  - Surface White: `#FFFFFF`
  - Soft Pink: `#FCEBF3`
  - Health Indicators: Success (`#2EAD83`), Warning (`#E9A23B`), Danger (`#E45C70`)
- **Typography**: Inter & Manrope
- **Micro-Interactions**: Smooth Framer Motion transitions, responsive Recharts curves with clinical target reference bands (70–140 mg/dL), accessible modals, and toast notifications.

---

## 🚀 Key Features & Strict Requirements

### 1. 🔐 Secure Authentication & User Isolation
- User registration with Full Name, Email, Password, and Password Confirmation.
- Password hashing with **bcrypt** (12 salt rounds); passwords never stored in plain text.
- Authentication via **HTTP-only JWT cookies** with `SameSite=Strict` and `Secure=true` in production (plus `Authorization: Bearer` support for API consumers).
- **Strict User Isolation**: All readings queries and database mutations strictly check `userId = req.user.id`. Users cannot view, modify, or delete another user's readings even if IDs are tampered with.

### 2. 🩸 Precision Glucose Reading Management
- **Four Permitted Daily Time Slots**:
  1. `Morning (Fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- Complete CRUD operations: Add, View, Edit, and Delete (with confirmation dialog).
- Editing an existing reading correctly updates without triggering false duplicate conflicts on itself.

### 3. 🛡️ Strict Validation & Concurrency Guarantees (Both Frontend & Backend)
| Rule | Condition | Exact Error Message |
| :--- | :--- | :--- |
| **Rule 1** | Value is missing / empty | `"Please enter a glucose value."` |
| **Rule 2** | Value not whole number between 40 and 600 | `"Value must be between 40 and 600 mg/dl."` |
| **Rule 3** | Slot already logged for date | `"You already have an After lunch reading for this date."` |
| **Rule 4** | Fifth reading attempted on date | `"You can add only 4 readings per day."` |
| **Rule 5** | Date is in the future | `"Date cannot be in the future."` |

*Concurrency Integrity: Maximum 4 readings per user per day and single reading per slot are guaranteed through database unique constraints (`@@unique([userId, date, slot])`) and transactional concurrency locking.*

### 4. 📊 Comprehensive Reporting Engine
All statistics are computed dynamically from actual database records (never fabricated):
- **Daily Report**:
  - Filtered to selected date only.
  - Metrics: Number of readings, Highest reading, Lowest reading, Average rounded to 1 decimal place (`Math.round((sum / count) * 10) / 10`).
  - Chronological slot breakdown.
- **Month-to-Date Report**:
  - From the 1st of the selected month through the selected date (e.g. Oct 1 – Oct 15, 2026).
  - Metrics: Total readings, Highest, Lowest, Average, and interactive Recharts glycemic trend.
- **Monthly Report (Previous Calendar Month)**:
  - Full calendar month relative to the selected date's month (e.g., if date is in Oct 2026, analyzes entire Sept 1 – Sept 30, 2026).
  - Handles month boundaries, leap years (February), and year rollovers (January ➔ previous December).
- **Empty Report States**: Displays the exact required message:  
  `"No readings yet. Start tracking your glucose to see your health insights here."`

---

## 🏗️ Monorepo Architecture

```
sweety/
│
├── client/                     # Frontend (React 18, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/ui/      # Button, Input, Card, Modal, Badge, EmptyState, Skeletons
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── features/readings/  # AddEditReadingModal
│   │   ├── layouts/            # DashboardLayout, AuthLayout
│   │   ├── pages/              # Dashboard, Readings, Reports (Daily, MTD, Monthly), Profile, 404
│   │   ├── services/           # api.js, authService, readingService, reportService
│   │   ├── styles/             # Tailwind CSS & design variables
│   │   ├── test/               # Vitest component & form tests
│   │   ├── utils/              # Timezone-safe calendar date utilities
│   │   ├── App.jsx             # Protected & Public routing
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js, Express, PostgreSQL, Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # User & Reading schema with relations and constraints
│   │   ├── migrations/         # Production PostgreSQL migrations
│   │   └── seed.js             # Idempotent demo database seed script
│   ├── src/
│   │   ├── config/             # env.js, database.js (Prisma client & test adapter)
│   │   ├── controllers/        # auth, reading, report, health controllers
│   │   ├── middleware/         # auth (JWT), validate (Zod), rateLimiter, errorHandler
│   │   ├── routes/             # REST endpoints (/auth, /readings, /reports, /health)
│   │   ├── services/           # authService, readingService, reportService
│   │   ├── utils/              # dateUtils, response helpers
│   │   ├── validators/         # Zod schemas with assignment error messages
│   │   ├── app.js              # Express app, Helmet, CORS, SPA static fallback
│   │   └── server.js           # Server bootstrap & graceful shutdown
│   ├── tests/                  # Automated integration tests (supertest)
│   └── package.json
│
├── package.json                # Monorepo workspaces & build orchestration
├── railway.json                # Single Web Service deployment configuration
├── .env.example                # Environment variable documentation
├── DEPLOYMENT.md               # Beginner-friendly Railway deployment guide
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, Framer Motion, Recharts, React Router DOM v6, Axios, Lucide React, Sonner |
| **Backend** | Node.js, Express.js, PostgreSQL, Prisma ORM, bcrypt, jsonwebtoken, Zod, Helmet, express-rate-limit, cookie-parser |
| **Testing** | Vitest, Supertest, React Testing Library, JSDOM |
| **Deployment** | Railway (Single Public Web Service + Railway PostgreSQL) |

---

## 👤 Demo Credentials

For quick evaluation by the Kenpath team, an idempotent seed script is provided with rich sample data:

| Field | Value |
| :--- | :--- |
| **Demo User Name** | `Sweety Demo` |
| **Email** | `demo@sweety.app` |
| **Password** | `SweetyDemo@123` |

*A "Fill Demo" shortcut button is available on the login screen to auto-fill these credentials in 1 click.*

---

## 💻 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/sweety.git
cd sweety
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` is configured to your local PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sweety_db"
JWT_SECRET="sweety_super_secret_jwt_key_min_32_characters_2026"
NODE_ENV="development"
PORT=5000
```
*(Note: If evaluating without a local PostgreSQL daemon running, set `USE_IN_MEMORY_DB=true` to preview all features immediately).*

### 3. Generate Prisma Client & Run Migrations
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations to PostgreSQL
npm run prisma:migrate

# Seed demo account and sample readings
npm run prisma:seed
```

### 4. Start Development Servers
Run both backend Express server and Vite frontend simultaneously:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🧪 Automated Testing Suite

SWEETY features **35 comprehensive automated tests** verifying every requirement, validation rule, and edge case:

```bash
# Run all backend API and validation tests (28 tests)
npm run test

# Run frontend component and validation tests (7 tests)
npm run test:client
```

### Test Coverage Highlights:
- ✅ **Authentication**: Registration, duplicate email rejection (409), bcrypt hashing verification, login success, invalid password rejection (401), non-existent user rejection, profile retrieval, unauthorized request blocking.
- ✅ **Reading Validation**: Missing glucose value, value < 40, value > 600, decimal values, future date prevention, duplicate slot rejection (`"You already have an After lunch reading for this date."`), 5th reading blocking (`"You can add only 4 readings per day."`).
- ✅ **User Isolation**: Verification that User 2 cannot access, edit, or delete User 1's records.
- ✅ **Editing & Deletion**: Modifying readings without self-duplication false positives, deletion confirmation flow.
- ✅ **Reports**: Daily stats, Month-to-date range calculations, Previous-month retrospective, leap years, year rollover transitions, and required empty-state messages.
- ✅ **Concurrency**: Atomic lock verification preventing concurrent requests from breaching the 4-reading daily limit.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Sign in and receive HTTP-only session cookie.
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Readings Management (Protected)
- `POST /api/readings` — Create a new glucose reading.
- `GET /api/readings` — Retrieve readings with optional filtering (`?date=YYYY-MM-DD`).
- `GET /api/readings/:id` — Retrieve a single reading by ID (user isolated).
- `PUT /api/readings/:id` — Update reading value, slot, or date.
- `DELETE /api/readings/:id` — Delete reading.

### Reports (Protected)
- `GET /api/reports/daily?date=YYYY-MM-DD` — Daily metrics and slot breakdown.
- `GET /api/reports/month-to-date?date=YYYY-MM-DD` — Month-to-date metrics and trend data.
- `GET /api/reports/monthly?date=YYYY-MM-DD` — Entire previous calendar month analysis.

### System & Health
- `GET /api/health` — Application and database connection status check.

---

## 🚀 Live Railway Single-Service Deployment

SWEETY is configured for turnkey deployment on [Railway](https://railway.app) as a single public web service with connected PostgreSQL.  
*Detailed step-by-step instructions are available in [DEPLOYMENT.md](file:///c:/Users/chsiv/OneDrive/Desktop/kenpath_task/DEPLOYMENT.md).*

### Production Build & Launch
```bash
# 1. Build the React frontend with Vite into client/dist
npm run build

# 2. Apply migrations safely and launch Express
npm run prisma:migrate
npm run start
```

---

## 📋 Kenpath Acceptance Checklist

| Requirement | Specification | Status | Evidence / Test |
| :--- | :--- | :---: | :--- |
| **User Registration** | Full name, email, password, confirm password | **PASS** | `auth.test.js` & `auth.test.jsx` |
| **Login & Logout** | Email and password authentication with session cookies | **PASS** | `auth.test.js` |
| **Bcrypt Hashing** | Passwords hashed using bcrypt (12 rounds) | **PASS** | `auth.test.js` (`should securely hash password with bcrypt`) |
| **User Isolation** | Users can only access their own readings | **PASS** | `readings.test.js` (`User Isolation & Security`) |
| **Add Reading** | Date, permitted slot, glucose value in mg/dL | **PASS** | `readings.test.js` & `readings.test.jsx` |
| **View Reading** | Listing and single reading retrieval | **PASS** | `readings.test.js` |
| **Edit Reading** | Edit value/slot without rejecting itself as duplicate | **PASS** | `readings.test.js` (`Edit & Delete Flows`) |
| **Delete Reading** | Delete reading with confirmation modal | **PASS** | `readings.test.js` (`should allow deleting an existing reading`) |
| **Permitted Slots** | Exactly 4 slots (Morning Fasting, Breakfast, Lunch, Dinner) | **PASS** | `readingValidator.js` & `readings.test.js` |
| **Duplicate Slot Rule** | Only 1 reading per slot per day | **PASS** | `readings.test.js` (`should reject duplicate slot on same date`) |
| **Max 4 Readings / Day** | Maximum 4 readings per day enforced under concurrency | **PASS** | `readings.test.js` & `concurrency` test |
| **Whole Number Validation** | Whole number between 40 and 600 mg/dL | **PASS** | `readings.test.js` (`decimal`, `<40`, `>600`) |
| **Future Date Prevention** | Date cannot be in the future | **PASS** | `readings.test.js` (`should reject date in the future`) |
| **Daily Report** | Selected date only: High, Low, Avg rounded to 1 dec, Count, Slots | **PASS** | `reports.test.js` (`Daily Report`) |
| **Month-to-Date Report** | 1st of month through selected date, trend, stats | **PASS** | `reports.test.js` (`Month-to-Date Report`) |
| **Previous-Month Report** | Entire previous calendar month, trend, stats | **PASS** | `reports.test.js` (`Monthly Report (Previous Calendar Month)`) |
| **Empty Report Message** | Exact required empty message | **PASS** | `reports.test.js` & `readings.test.jsx` |
| **PostgreSQL Integration** | Real PostgreSQL database via Prisma ORM | **PASS** | `schema.prisma` & migration scripts |
| **Database Seed Script** | Idempotent seed script with demo user & rich data | **PASS** | `server/prisma/seed.js` |
| **Single Web Service** | Frontend dist served via Express on Railway | **PASS** | `server/src/app.js` & verified via probe |
| **Automated Tests** | Backend + Frontend automated tests | **PASS** | 35/35 passing tests |

---

## ⚖️ Design Decisions & Assumptions

1. **Date-Only Storage Representation**: Calendar dates are strictly formatted and stored as `YYYY-MM-DD` strings (`@db.VarChar(10)`). This ensures 100% immunity from timezone conversions, UTC midnight shifts, and DST surprises.
2. **Concurrency Strategy**: Enforced both at the database level (`@@unique([userId, date, slot])`) and through atomic transactional serialization in `readingService.js`, guaranteeing no race condition can ever create more than 4 readings per day.
3. **Single-Service Architecture**: Configured Express to serve both API routes and the React SPA static build, minimizing infrastructure overhead and ensuring a unified origin for HTTP-only cookies.

---

## 📄 License
Developed for the Kenpath Technical Hiring Assignment.
All rights reserved © 2026 SWEETY.

