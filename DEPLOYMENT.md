# 🚀 SWEETY — Railway Single-Service Deployment Guide

> **"A healthier you starts with understanding."**  
> Complete beginner-friendly instructions for deploying the **SWEETY Blood Glucose Tracker** onto [Railway](https://railway.app) using a **Single Public Web Service** architecture connected to a managed **Railway PostgreSQL** database.

---

## 🏛️ Deployment Architecture Overview

SWEETY is designed to run in production under a **Single Public Web Service** pattern on Railway:

```
[ Browser / Client ]
        │
        ▼ (Single Public HTTPS Domain, e.g. https://sweety-production.up.railway.app)
┌─────────────────────────────────────────────────────────────┐
│               Railway Public Web Service                    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Express.js Web Server (0.0.0.0:$PORT)               │   │
│   │                                                     │   │
│   │  ├── /api/auth/*     (Authentication API)           │   │
│   │  ├── /api/readings/* (Glucose CRUD + Concurrency)   │   │
│   │  ├── /api/reports/*  (Daily, MTD, Monthly Reports)  │   │
│   │  ├── /api/health     (Health Checks & Monitoring)   │   │
│   │  └── /*              (Serves React SPA Production)  │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Internal Private Connection via DATABASE_URL)
┌─────────────────────────────────────────────────────────────┐
│               Railway PostgreSQL Service                    │
│               (Managed Database & Migrations)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before starting, ensure you have:
1. A **GitHub account** ([github.com](https://github.com)).
2. A **Railway account** ([railway.app](https://railway.app)) — you can sign in with your GitHub account.
3. Your local repository committed and pushed to a GitHub repository (public or private).

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub

If you haven't already pushed your code to GitHub:
```bash
# In the project root directory
git add .
git commit -m "feat: complete SWEETY production build ready for Railway"
git remote add origin https://github.com/<your-username>/sweety.git
git branch -M main
git push -u origin main
```

---

### Step 2: Create a New Project on Railway

1. Open your browser and navigate to [Railway Dashboard](https://railway.app/dashboard).
2. Click the **"+ New Project"** button.
3. Select **"Deploy from GitHub repo"**.
4. Choose your `sweety` repository from the list.
5. Click **"Deploy Now"**.
   *(Note: The initial build will start, but we will configure PostgreSQL and environment variables next.)*

---

### Step 3: Add PostgreSQL Database Service

1. Inside your new Railway project canvas, click the **"+ New"** button (or press `Ctrl + K` / `Cmd + K`).
2. Select **"Database"** ➔ **"Add PostgreSQL"**.
3. Railway will provision a dedicated PostgreSQL database container in a few seconds.
4. Once created, click on the **Postgres** card and navigate to the **"Variables"** tab. You will see that Railway automatically creates a variable named `DATABASE_URL`.

---

### Step 4: Configure Web Service Environment Variables

1. On the project canvas, click on your **SWEETY Web Service** card.
2. Navigate to the **"Variables"** tab.
3. Add the following environment variables:

| Variable Name | Value / Reference | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & error masking |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | **Railway Variable Reference** connecting the web app to PostgreSQL |
| `JWT_SECRET` | `generate-a-random-secure-string-min-32-chars` | Cryptographic secret for signing auth tokens |
| `COOKIE_SECRET` | `generate-another-random-secure-cookie-key` | Used for cookie verification |
| `PORT` | *(Leave empty)* | Railway injects the assigned port dynamically |

> 💡 **Tip on Railway Variable References**: When you type `${{Postgres.DATABASE_URL}}`, Railway automatically links the internal database credentials so you never have to manually copy or expose database passwords.

---

### Step 5: Verify Build & Start Commands

Click on the **"Settings"** tab of your SWEETY Web Service and confirm:

- **Build Command**:
  ```bash
  npm run build
  ```
  *(This builds the React frontend with Vite into `client/dist` and runs `prisma generate`)*

- **Deploy / Start Command**:
  ```bash
  npm run prisma:migrate && node server/prisma/seed.js && npm run start
  ```
  *(This automatically applies migrations to PostgreSQL, seeds the demo account, and boots the Express server)*

- **Healthcheck Path**:
  ```
  /api/health
  ```
  *(Railway will monitor this endpoint to ensure zero downtime deployments)*

---

### Step 6: Generate a Public Domain

1. In the **"Settings"** tab of your Web Service, scroll down to the **"Networking"** section.
2. Under **Public Networking**, click **"Generate Domain"**.
3. Railway will instantly assign a secure HTTPS domain, such as:
   ```
   https://sweety-production.up.railway.app
   ```
4. Click the generated link to visit your live deployment!

---

### Step 7: Verify Production Functionality

Test all primary flows in the live web application:
1. **Health Check**: Visit `https://your-domain.up.railway.app/api/health` and verify `{"status": "healthy", "database": {"status": "connected"}}`.
2. **Demo Sign-In**: Click **"Fill Demo"** on the login page and sign in as `demo@sweety.app` / `SweetyDemo@123`.
3. **Verify Dashboard**: Check that summary cards, timeline slots, and the Recharts monthly trend chart render real data.
4. **Log Reading**: Click **"Add Reading"**, enter a reading (e.g. 115 mg/dL), and verify instant updates.
5. **View Reports**: Click **"Daily Report"**, **"Month-to-Date"**, and **"Previous Month"** to verify all calculations (Highest, Lowest, Average rounded to 1 decimal place).
6. **Registration**: Log out and register a new test user to confirm bcrypt hashing and user isolation.

---

## 🔄 Automatic Continuous Deployment (CI/CD)

Whenever you push new commits to your `main` branch on GitHub:
1. Railway detects the push automatically.
2. It builds the new React frontend bundle and runs `prisma generate`.
3. It runs `prisma migrate deploy` safely against PostgreSQL.
4. Performs healthcheck on `/api/health`.
5. Seamlessly rolls out the new version with zero user downtime.

---

## 📌 Technical Notes & Operational Guarantees

1. **Date-Only Storage Strategy**: Calendar dates are strictly captured and stored in `YYYY-MM-DD` string format. This eliminates timezone drift and accidental day shifts when users log measurements across different UTC offsets.
2. **Concurrency Safety**: Maximum 4 readings per day and single-reading-per-slot rules are protected using database transactions and atomic locks, preventing duplicate insertions under rapid concurrent submissions.
3. **HTTP-Only Cookies**: Authentication tokens are transmitted in secure HTTP-only cookies (`SameSite=Strict`, `Secure=true` in production), preventing XSS token theft.
