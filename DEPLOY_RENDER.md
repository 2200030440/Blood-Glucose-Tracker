# 🌐 Deploy SWEETY for Free on Render

> **100% Free Hosting & Free PostgreSQL Database**  
> Since Railway requires a paid subscription after the trial period, **[Render](https://render.com)** is the best free production alternative. Render uses the **exact same Single-Service Architecture** we designed for SWEETY!

---

## ⚡ Option 1: 1-Click Blueprint Deploy (Fastest — 3 Minutes)

Because we added a `render.yaml` configuration to your repository, Render can deploy the entire app and PostgreSQL database automatically:

1. **Sign in to Render**:
   - Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in with your GitHub account.
2. **Create New Blueprint**:
   - In the top right, click **"New +"** ➔ Select **"Blueprint"**.
3. **Connect Your Repository**:
   - Select your repository: `2200030440/Blood-Glucose-Tracker`.
4. **Click "Apply"**:
   - Render will detect `render.yaml` and show:
     - `sweety-db` (Free PostgreSQL Database)
     - `sweety-app` (Free Web Service)
   - Click **"Apply"**.
5. **Done!**
   - Render automatically provisions the PostgreSQL database, injects `DATABASE_URL`, builds the React frontend, applies Prisma migrations, seeds the demo account, and assigns a free public HTTPS URL:
   - `https://sweety-app.onrender.com`

---

## 🛠️ Option 2: Manual Deploy on Render (Step-by-Step)

If you prefer manual creation in the Render dashboard:

### Step 1: Create Free PostgreSQL Database
1. Go to **[dashboard.render.com](https://dashboard.render.com)**.
2. Click **"New +"** ➔ Select **"PostgreSQL"**.
3. Fill in:
   - **Name**: `sweety-db`
   - **Database**: `sweety_db`
   - **User**: `sweety_user`
   - **Region**: Choose closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Instance Type**: Select **"Free"**.
4. Click **"Create Database"**.
5. Once created, scroll down to **"Connections"** and copy the **"Internal Database URL"** (or External if connecting from outside).

---

### Step 2: Create Web Service
1. In Render dashboard, click **"New +"** ➔ Select **"Web Service"**.
2. Choose **"Build and deploy from a Git repository"** and select `2200030440/Blood-Glucose-Tracker`.
3. Configure the service settings:
   - **Name**: `sweety-app`
   - **Region**: Same region as your database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm run prisma:migrate && node server/prisma/seed.js && npm run start
     ```
   - **Instance Type**: Select **"Free"**.

4. Scroll down to **"Environment Variables"** and add:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Paste the Internal Database URL from Step 1* |
| `JWT_SECRET` | `sweety_render_production_jwt_secret_key_2026` |
| `COOKIE_SECRET` | `sweety_render_production_cookie_secret_key_2026` |

5. Click **"Create Web Service"**.

---

### Step 3: Verification
Once the build completes (takes about 2 minutes):
1. Render gives you your live URL, e.g. `https://sweety-app.onrender.com`.
2. Open the URL:
   - Check `/api/health` -> should report status `healthy` and database `connected`.
   - On the login screen, click **"Fill Demo"** and sign in as `demo@sweety.app` / `SweetyDemo@123`.
   - Verify the Dashboard, Today's Timeline, Recharts Trend, and Reports.

---

## 💡 Why Render is Ideal:
- **No Credit Card Required** for free web service and database.
- Native PostgreSQL with Prisma support.
- Automatic HTTPS with free SSL certificates.
- Single public domain serving both React static files and Express API.

