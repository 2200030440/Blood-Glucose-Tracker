# 🎬 SWEETY — 2–3 Minute Video Demonstration Walkthrough Script
> **Blood Glucose Tracker | Kenpath Technical Hiring Assignment**  
> **Tagline:** *"A healthier you starts with understanding."*

---

## ⏱️ Video Structure & Timeline (Total Duration: 2 Minutes 30 Seconds)

```
0:00 ─── 0:25  Scene 1: Introduction & Demo Authentication (1-Click Fill)
0:25 ─── 0:55  Scene 2: Dashboard, 4 Metric Cards & 4-Slot Timeline
0:55 ─── 1:25  Scene 3: Reading Management & Strict Kenpath Validation
1:25 ─── 1:55  Scene 4: Reporting Suite (Daily, Month-to-Date, Previous Month)
1:55 ─── 2:15  Scene 5: Readings List, Filtering & Pagination
2:15 ─── 2:30  Scene 6: Architecture, Security & Closing
```

---

## 📽️ Scene-by-Scene Script & Action Guide

### Scene 1: Introduction & 1-Click Authentication (0:00 – 0:25)
- **On Screen:** Start on the login screen (`/login`). Show the clean healthcare brand, violet/lavender palette, and the "Kenpath Hiring Reviewer? Click to auto-fill sample demo account" banner.
- **Action:** Click the **"Fill Demo"** button. The email `demo@sweety.app` and password `SweetyDemo@123` fill automatically. Click **"Sign In"**.
- **Narration / Voiceover:**
  > *"Welcome to SWEETY, a full-stack healthcare SaaS web application developed for the Kenpath Technical Hiring Assignment. Built around the tagline 'A healthier you starts with understanding,' SWEETY features a custom healthcare design system, a React frontend, an Express API, and a real PostgreSQL database with Prisma ORM. Let's sign in using our pre-seeded demo account."*

---

### Scene 2: Dashboard Experience & 4-Slot Timeline (0:25 – 0:55)
- **On Screen:** Dashboard (`/dashboard`) loads with the personalized welcome banner, 4 metric cards, and 4-slot daily timeline.
- **Action:** 
  1. Hover over the **4 Metric Cards**: Today's Progress (3/4 slots), Average Glucose (111.3 mg/dL), Highest Reading (128 mg/dL), and Lowest Reading (92 mg/dL).
  2. Point out the **Daily Slot Timeline**: Highlight the 3 logged slots (`Morning (Fasting)`, `After breakfast`, `After lunch`) with clinical color-coded status badges, and the 4th empty slot (`After dinner`) showing the **"Log Slot"** action button.
  3. Scroll to the **Recharts Area Chart**: Hover over points on the curve showing average, peak, and low readings, noting the clinical dashed reference lines for normal range (70–140 mg/dL).
- **Narration / Voiceover:**
  > *"Upon login, we arrive at the main dashboard. Notice the 4 primary statistic cards dynamically calculated from real database records without fabricated data. Below, our 4-slot daily protocol tracks Morning Fasting, Breakfast, Lunch, and Dinner. Each slot highlights clinical status badges—from Normal to Elevated—and provides direct edit and delete controls. Below the timeline, an interactive Recharts area chart visualizes glycemic fluctuations with dashed clinical target reference thresholds."*

---

### Scene 3: Strict Validation & Reading Management (0:55 – 1:25)
- **On Screen:** Click **"Add Reading"** or **"Log Slot"** on the empty After dinner card.
- **Action (Demonstrating all 5 mandatory Kenpath validation rules):**
  1. Click submit with empty value ➔ Shows `"Please enter a glucose value."`
  2. Enter `30` or `750` ➔ Shows `"Value must be between 40 and 600 mg/dl."`
  3. Enter decimal `105.5` ➔ Shows `"Value must be between 40 and 600 mg/dl."`
  4. Select a future date ➔ Shows `"Date cannot be in the future."`
  5. Select an already-logged slot (`After lunch`) ➔ Shows `"You already have an After lunch reading for this date."`
  6. Enter valid values (`After dinner`, `122 mg/dL`) ➔ Successfully saves. Dashboard instantly updates to 4/4 progress!
- **Narration / Voiceover:**
  > *"SWEETY enforces all five mandatory Kenpath validation rules on both frontend and backend. Submitting an empty field displays 'Please enter a glucose value.' Entering values outside the 40 to 600 range or decimals triggers 'Value must be between 40 and 600 mg/dl.' Future dates are rejected, and selecting an existing slot triggers 'You already have an After lunch reading for this date.' When we submit a valid 122 mg/dL reading for After dinner, the timeline and statistics refresh immediately."*

---

### Scene 4: The Reporting Engine (1:25 – 1:55)
- **On Screen:** Navigate through the 3 report pages in the sidebar.
- **Action:**
  1. Click **Daily Report**: View selected date summary, exact average rounded to 1 decimal place, and chronological slot breakdown. Change date to an unlogged day to show the required empty state:  
     `"No readings yet. Start tracking your glucose to see your health insights here."`
  2. Click **Month-to-Date Report**: Show the range banner (e.g. 1st through selected date), cumulative stats, and trend curve.
  3. Click **Previous Month Report**: Show the retrospective analysis of the complete previous calendar month, demonstrating correct handling of month lengths, leap years, and year rollovers.
- **Narration / Voiceover:**
  > *"Next is the reporting suite. The Daily Report calculates exact metrics for the selected day only. If a date has no records, it displays the required message: 'No readings yet. Start tracking your glucose to see your health insights here.' The Month-to-Date Report computes cumulative metrics from the 1st of the month through the selected date. And the Previous Month Report conducts a full calendar retrospective for the prior month, handling month boundaries, leap years, and year transitions without timezone drift."*

---

### Scene 5: Readings Log, Filtering & Pagination (1:55 – 2:15)
- **On Screen:** Navigate to **My Readings** (`/readings`).
- **Action:**
  1. Demonstrate the calendar date filter and slot filter (`Morning (Fasting)`, `After lunch`, etc.).
  2. Demonstrate pagination: page numbers, "Next" and "Previous" controls.
  3. Click **Edit** on a reading: update value from `122` to `125` ➔ saves smoothly without false duplicate conflicts on itself.
  4. Click **Delete** ➔ confirm dialog appears with safety prompt, confirm deletion.
- **Narration / Voiceover:**
  > *"Under My Readings, users can filter historical measurements by calendar date or slot. The table features responsive pagination and quick action controls. Notice that editing a reading updates the value smoothly without rejecting itself as a duplicate, and deletion requires explicit modal confirmation."*

---

### Scene 6: Architecture, Security & Closing (2:15 – 2:30)
- **On Screen:** Navigate to **Profile & Account** (`/profile`).
- **Action:** Highlight user details, HTTP-only session cookie status, bcrypt password hashing (12 rounds), PostgreSQL unique constraints, and the passing test suite.
- **Narration / Voiceover:**
  > *"Under the hood, SWEETY uses a Single Public Web Service architecture on Render and Railway with a dedicated PostgreSQL database. All routes enforce strict user isolation, bcrypt password hashing, and atomic transaction locks against concurrent submissions. With 35 passing automated tests, SWEETY is completely production-ready. Thank you!"*

---

## 🎯 Evaluation Checklist Quick Reference for Evaluators

| Timestamp | Feature Demonstrated | Kenpath Assignment Criteria |
| :---: | :--- | :--- |
| `0:10` | 1-Click Demo Login (`demo@sweety.app`) | User authentication & seed data |
| `0:30` | 4 Summary Statistic Cards | Daily readings count, average, highest, lowest |
| `0:45` | 4-Slot Daily Protocol Timeline | Exactly 4 permitted slots with status indicators |
| `1:00` | Recharts Monthly Trend Chart | Area curve with 70–140 mg/dL target thresholds |
| `1:10` | 5 Mandatory Validation Rules | Missing value, 40–600 mg/dL, duplicate slot, future date |
| `1:30` | Daily Report & Empty State | Selected date metrics & required empty message |
| `1:40` | Month-to-Date & Previous-Month Reports | 1st to date range & prior calendar month retrospective |
| `2:00` | Readings Filtering & Pagination | Filter by date/slot, pagination, edit & delete |
| `2:20` | Security & Automated Tests | Strict user isolation, bcrypt, PostgreSQL, 35/35 tests |

