# 💜 SWEETY — Blood Glucose Tracker

> **"A healthier you starts with understanding."**  
> A production-ready, full-stack healthcare SaaS web application designed for diabetes patients to log daily glucose measurements, track clinical trends across scheduled meal intervals, and view in-depth glycemic analytics.  
> **Author:** Challagali  
> **Repository:** [https://github.com/2200030440/Blood-Glucose-Tracker.git](https://github.com/2200030440/Blood-Glucose-Tracker.git)  

---

## 🌐 Live Production Application

| Metric | Details |
| :--- | :--- |
| 🚀 **Live App URL** | **[https://blood-glucose-tracker-vjbp.onrender.com](https://blood-glucose-tracker-vjbp.onrender.com)** |
| 🛡️ **Infrastructure** | Render (Single Public Web Service + Managed PostgreSQL Database + SSL) |
| 🔑 **Demo Account** | **`demo@sweety.app`** |
| 🔒 **Demo Password** | **`SweetyDemo@123`** |
| ⚡ **1-Click Preview** | Click the **"Fill Demo"** button on the login screen to sign in instantly |

---

## 📸 Application Showcase

### 1. Interactive Dashboard & Glycemic Analytics
Real-time daily progress, 4-slot status cards, clinical average metrics, and Month-to-Date glycemic curve with 70–140 mg/dL target reference bands.

![Dashboard Preview](docs/screenshots/02_dashboard.png)

---

### 2. Clinical Reports Engine (Daily, Month-to-Date, Previous Month)
Dynamic reporting computed strictly from actual database records, featuring 1-decimal precision rounding, slot breakdowns, and target-range badges.

| Daily Report & Slot Breakdown | Month-to-Date Trend Curve |
| :---: | :---: |
| ![Daily Report](docs/screenshots/04_daily_report.png) | ![Month to Date Report](docs/screenshots/05_month_to_date_report.png) |

| Historical Previous-Month Analysis | Glucose Readings History (Paginated) |
| :---: | :---: |
| ![Previous Month Report](docs/screenshots/06_previous_month_report.png) | ![Readings History](docs/screenshots/03_readings_history.png) |

---

### 3. Patient Authentication & Session Security
Secure registration and login with bcrypt password hashing (12 rounds), HTTP-only JWT cookies, and strict patient data isolation.

![Authentication View](docs/screenshots/01_login_page.png)

---

## 🌟 Key Features

### 1. 🔐 Patient Authentication & Privacy Isolation
- **Registration & Login:** Full name, email, and password registration with client/server validation.
- **Bcrypt Password Security:** Passwords hashed with **bcrypt (12 salt rounds)**; plain-text passwords are never stored.
- **Session Authentication:** Authenticated using signed **JWT tokens** delivered via **HTTP-only, secure cookies** (`SameSite: Lax`) to defend against XSS and CSRF attacks.
- **Strict Data Isolation:** Every database query checks `userId = req.user.id`. Patients can **only** access, edit, or delete their own medical records.

### 2. 🩸 Precision Glucose Log Management
- **Four Permitted Meal & Fasting Slots:**
  1. `Morning (fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- **Complete CRUD Lifecycle:**
  - **Add:** Record readings with calendar date, slot, and value in `mg/dl`.
  - **View:** Paginated history list (`GET /api/readings?page=1&limit=20`) with health badges and slot timeline.
  - **Edit:** Update value or slot with self-exclusion checks (updating a reading never conflicts with itself).
  - **Delete:** Remove readings with an accessible confirmation dialog.

### 3. 🛡️ Clinical Validation & Concurrency Protection
- **Mandatory Field:** Value is required (`"Please enter a glucose value."`).
- **Clinical Range:** Value must be a whole number between 40 and 600 (`"Value must be between 40 and 600 mg/dl."`).
- **Slot Uniqueness:** Exactly 1 reading per slot per day (`"You already have an After lunch reading for this date."`).
- **Daily Limit:** Maximum 4 readings per calendar date (`"You can add only 4 readings per day."`).
- **Calendar Constraint:** Future dates are strictly prohibited (`"Date cannot be in the future."`).
- **Concurrency Locking:** Combined database unique constraint (`@@unique([userId, date, slot])`) and transactional mutex locking in `readingService.js` prevent parallel race conditions from exceeding daily limits.

### 4. 📊 Clinical Reports Engine
- **Daily Report (Selected Date):**
  - Highest, lowest, and average reading (rounded to 1 decimal place).
  - Number of readings for the date.
  - Complete list of individual readings and their respective time slots.
- **Month-to-Date Report (1st of month to selected date):**
  - From the 1st of the month through the selected date.
  - Highest, lowest, average (rounded to 1 decimal), and total count.
  - Interactive Recharts trajectory curve with clinical target bands (70–140 mg/dL).
- **Monthly Report (Whole Previous Calendar Month):**
  - Retrospective analysis of the entire prior calendar month.
  - Handles month boundaries, leap years (February), and year rollovers (January ➔ previous December).
- **Friendly Empty State:** Displays a clear medical callout when no readings exist for any period:  
  `"No readings yet. Start tracking your glucose to see your health insights here."`

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, Framer Motion, Recharts, React Router DOM v6, Axios, Lucide React, Sonner |
| **Backend** | Node.js, Express.js, PostgreSQL, Prisma ORM, bcryptjs, jsonwebtoken, Zod, Helmet, express-rate-limit, cookie-parser |
| **Testing** | Vitest, Supertest, React Testing Library, JSDOM |
| **DevOps & Cloud** | Render (Single-Service Web Application), Docker, Docker Compose |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL** *(Optional for local dev — an automated in-memory demo fallback is included)*

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

## 🗄️ Database Setup

### Option A: PostgreSQL Setup (Production & Local)
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Configure your PostgreSQL connection string in `.env`:
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

   # Apply migrations to PostgreSQL
   npm run prisma:migrate

   # Seed demo user (demo@sweety.app) with sample readings
   npm run prisma:seed
   ```

### Option B: Automatic Offline Fallback (Zero Setup)
If you don't have PostgreSQL installed locally, SWEETY's database proxy will automatically detect it, log a notice, and switch to a pre-seeded in-memory store so you can evaluate the entire application immediately.

---

## 🚀 Running the Application

### 1. Start Development Servers (Full Stack)
```bash
npm run dev
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### 2. Run Independently
```bash
# Backend only (port 5000)
npm run dev:server

# Frontend only (port 5173)
npm run dev:client
```

### 3. Production Build & Start
```bash
# Compiles React SPA into client/dist and generates Prisma client
npm run build

# Starts the production Express server (serves API + static React SPA)
npm start
```

### 4. Run via Docker Compose
To run a complete containerized environment with PostgreSQL and the web service:
```bash
docker-compose up --build
```
Access the application at [http://localhost:5000](http://localhost:5000).

---

## 🧪 Automated Testing Suite (35/35 Passing)

SWEETY includes 35 comprehensive automated tests covering all functional, clinical, and security requirements:

```bash
# Run backend integration tests (28 tests)
npm run test

# Run frontend component tests (7 tests)
npm run test:client
```

### Test Coverage Breakdown:
- ✅ **Authentication:** Registration, duplicate email rejection (409), bcrypt hashing verification, login success, invalid password rejection (401), session profile retrieval, unauthorized request blocking.
- ✅ **Reading Validation:** Missing values, out-of-range values (<40 or >600), decimal values, future dates, duplicate slot rejection, 5th reading blocking.
- ✅ **User Isolation:** Verifies User B cannot view, edit, or delete User A's medical readings.
- ✅ **Reports Engine:** Daily stats, Month-to-date trajectory, Previous calendar month retrospective, leap years, year rollover transitions, and required empty-state messages.
- ✅ **Concurrency:** Mutex lock verification preventing simultaneous parallel requests from breaching the 4-reading daily limit.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Sign in and receive HTTP-only session cookie.
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Readings Management (Protected)
- `POST /api/readings` — Create a new glucose reading.
- `GET /api/readings` — Retrieve readings with optional pagination (`?page=1&limit=20`) and date filters (`?date=YYYY-MM-DD`).
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

## 📝 Notes: Assumptions & Future Improvements

### Assumptions Made
1. **Calendar Date Preservation (`YYYY-MM-DD`):** Stored strictly as `YYYY-MM-DD` strings (`@db.VarChar(10)`) to maintain timezone safety across international patient use and eliminate UTC midnight rollover anomalies.
2. **Four Distinct Daily Slots:** The 4 slots (`Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`) represent distinct clinical intervals. Each slot can be recorded once per calendar date, up to 4 readings per day.
3. **Concurrency-Safe Daily Limit:** Combined database unique constraints (`@@unique([userId, date, slot])`) with application-level mutex locking in `readingService.js` to ensure concurrent parallel requests cannot bypass the 4-readings-per-day limit.
4. **Single-Service Architecture:** Serving both the API and the compiled React SPA build from the same Express origin in production eliminates third-party cookie restrictions and simplifies deployment on cloud platforms.

### What I'd Improve with More Time
1. **Redis Caching for Historical Reports:** Cache Monthly and Month-to-Date analytics in Redis with automatic invalidation whenever a reading in that range is added, modified, or deleted.
2. **BullMQ Background Reminder Job:** Schedule an automated daily reminder job (e.g., at 9:00 PM) to notify patients who have fewer than 4 readings logged for the day.
3. **Doctor / Caregiver Role:** Implement a multi-tenant role-based access control (RBAC) portal allowing physicians to review glucose charts, trends, and slot compliance for their assigned patients.
4. **Clinical PDF & CSV Export:** Provide one-click report exports formatted for diabetes specialist consultations and endocrinology visits.
5. **Continuous Glucose Monitor (CGM) Import:** Add support for importing batch CSV/JSON data from Abbott FreeStyle Libre or Dexcom sensors with automatic slot mapping.

---

## 📁 Repository Structure

```
Blood-Glucose-Tracker/
├── client/                     # Frontend React 18 SPA
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
├── server/                     # Backend Express API Server
│   ├── prisma/
│   │   ├── schema.prisma       # Relational User & Reading models
│   │   ├── migrations/         # PostgreSQL migration history
│   │   └── seed.js             # Idempotent demo database seed script
│   ├── src/
│   │   ├── config/             # env.js, database.js (Smart proxy & in-memory fallback)
│   │   ├── controllers/        # auth, reading, report, health controllers
│   │   ├── middleware/         # auth (JWT), validate (Zod), rateLimiter, errorHandler
│   │   ├── routes/             # REST API routers (/api/auth, /api/readings, /api/reports)
│   │   ├── services/           # authService, readingService, reportService
│   │   ├── utils/              # dateUtils, response helpers
│   │   ├── validators/         # Zod schemas with medical error messages
│   │   ├── app.js              # Express app, Helmet, CORS, SPA static fallback
│   │   └── server.js           # Server startup, self-healing migration & graceful shutdown
│   ├── tests/                  # Supertest backend integration test suites
│   └── package.json
│
├── docs/screenshots/           # High-resolution application screenshots
├── .env.example                # Documented environment variables template
├── docker-compose.yml          # Local PostgreSQL + Web Service compose configuration
├── Dockerfile                  # Multi-stage production container configuration
├── render.yaml                 # Render Blueprint automated deployment manifest
├── package.json                # Root monorepo workspace configuration
└── README.md                   # Complete application documentation
```

---

## 📄 License
Developed with 💜 by **Challagali**.  
Released under the [MIT License](LICENSE).
