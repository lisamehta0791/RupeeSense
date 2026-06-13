# 💰 RupeeSense

**Your brutally honest AI financial mirror.** Track your spending, get roasted by an AI advisor, see how much you're really saving, and build better money habits — all with a privacy-first design where your data is yours.

Built for Indian personal finance (₹), powered by Supabase and Groq AI.

---

## ✨ Features

- **📊 Spending Dashboard** — Upload a bank-statement CSV, paste UPI history, or enter transactions manually. Get instant analysis: category breakdown, trends, a "Shame-O-Meter", a Money Health Score, and fraud/anomaly flags.
- **💸 Real Savings Tracker** — Enter your monthly income once; see exactly how much you save each month (income − spending), with a live progress bar.
- **📈 Time Comparisons** — This month vs last month, this week vs last week, this year vs last year. See whether you're spending more or less over time.
- **🎯 Savings Goals** — Set goals (emergency fund, a trip), track progress, and add money as you go.
- **🧮 Budgets** — Set per-category monthly limits and get colour-coded warnings before you overspend.
- **🤖 AI Financial Advisor** — Chat with an AI that has read your transactions. Ask about saving, investing (SIPs, PPF, ELSS, FDs), or upload a screenshot of a statement for instant analysis. A floating chat is available on every page.
- **🏆 Achievements** — Unlock badges as you build healthy habits.
- **📤 CSV Export** — Download all your transactions anytime.
- **🔒 Private by design** — Row Level Security means each user can only ever see their own data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Routing | React Router |
| Backend & Auth | Supabase (Postgres + Auth + Row Level Security) |
| AI | Groq API (Llama 3.3 70B + Llama 4 Scout vision) |

---

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js 18 or newer** — [download here](https://nodejs.org/). Check with `node --version`.
- **A free Supabase account** — [supabase.com](https://supabase.com/)
- **A free Groq API key** — [console.groq.com](https://console.groq.com/)
- **Git** — to clone the repo.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/rupeesense.git
cd rupeesense
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your Supabase database

1. Go to [supabase.com](https://supabase.com/) and create a new project (free tier is fine).
2. Once it's ready, open the **SQL Editor** in the left sidebar.
3. Open the `schema.sql` file from this repo, copy its entire contents, paste into the SQL Editor, and click **Run**.
   - This creates all the tables (transactions, profiles, goals, budgets, achievements, chat) with security rules.
4. In your Supabase project, go to **Project Settings → API** and copy:
   - your **Project URL**
   - your **anon public key**

### 4. Get a Groq API key

1. Sign up at [console.groq.com](https://console.groq.com/).
2. Go to **API Keys** and create a new key.
3. Copy it (starts with `gsk_...`).

### 5. Create your environment file

Create a file named `.env.local` in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

> ⚠️ Never commit `.env.local` to GitHub. It's already in `.gitignore`.

### 6. Run the app

```bash
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

---

## 📖 How to Use

1. **Sign up** with an email and password on the auth screen.
2. **Add your transactions** on the Dashboard — choose one of:
   - **CSV Upload** — export a statement from your bank (HDFC, ICICI, SBI, Axis, etc.) and upload it.
   - **Paste UPI** — paste lines like `Swiggy, 450, Food`.
   - **Manual** — type entries one at a time.
   - Or click **Use Demo Data** to explore with sample data.
3. Click **Analyse My Spending** to see your full breakdown.
4. **Add more data later:** click **Reset / Enter Data** — this opens the entry panel again *without deleting your history*. New entries are added to what you already have. Click **← Back to my analysis** when done.
5. Visit **Savings** to enter your monthly income and see real savings + comparisons.
6. Set **Goals** and **Budgets** to stay on track.
7. Chat with the **AI Advisor** (or the floating button) for personalised advice.

> **Reset vs Delete:** "Reset / Enter Data" only clears the screen so you can add more — your history is always safe. To permanently erase data, use **Settings → Delete All Data** (it asks for confirmation).

---

## 🏗️ Build for Production

```bash
npm run build      # type-checks and builds into /dist
npm run preview    # preview the production build locally
```

Deploy the `/dist` folder to any static host (Vercel, Netlify, Cloudflare Pages). Remember to add the same three environment variables in your host's dashboard.

---

## 🧰 Troubleshooting

| Problem | Fix |
|--------|-----|
| "Missing VITE_SUPABASE_URL" error | Your `.env.local` is missing or misnamed. It must be in the project root and you must restart `npm run dev` after editing it. |
| History not loading / saving | Make sure you ran the full `schema.sql` in Supabase, and that you're signed in. |
| AI says "API key not configured" | Add `VITE_GROQ_API_KEY` to `.env.local` and restart. |
| AI "rate limit" message | The Groq free tier has daily limits; wait a bit or upgrade. The app auto-falls back to a lighter model. |
| Image upload in chat fails | The AI reads **images** (JPG/PNG) of statements, not PDFs. |

When something goes wrong, open your browser's developer console (F12) — the app logs a clear message for every failed database call.

---

## 📁 Project Structure

```
src/
├── components/      # Navbar, AppShell, FloatingChat, charts
├── context/         # AuthContext, DataContext, ProfileContext (state + DB)
├── lib/             # supabase client, ai (Groq), finance analysis, periods/savings math
├── pages/           # Dashboard, History, Insights, Savings, Goals, Budgets, Advisor, Settings, Auth
└── App.tsx          # routes + providers
schema.sql           # run this in Supabase once
```

---

## 🔐 Privacy & Security

- All data is stored in **your own** Supabase project.
- **Row Level Security** ensures each user can only read/write their own rows.
- API keys live in `.env.local` and are never committed.
- The AI advisor only receives a summary of your spending to answer questions — you control what you upload.

> ⚠️ The AI provides **educational guidance, not registered financial advice.** Always do your own research before investing.

---

## 📜 License

MIT — feel free to use, modify, and learn from this project.
