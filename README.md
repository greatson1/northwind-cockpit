# Northwind Transformation Cockpit

An interactive, single-page learning app for **AI Foundations in Procurement & Supply Chain**. Learners advise the (fictional) Northwind Building Systems CPO across a five-day programme: exploring the case dossier, working through daily missions, capturing AI opportunities in a backlog, and assembling a personal, phased AI strategy they can export.

Built with **React + Vite**, charts via **Recharts**, icons via **lucide-react**. All progress is saved locally in the browser (`localStorage`) — no backend, no accounts, no data leaves the device.

## Features

- **Home** — programme overview, week-progress tracker, opportunities counter, name field for export.
- **Explore** — the live Northwind dossier: company profile, suppliers (with spend chart), performance, contracts, demand & inventory, logistics, and emissions. Click any supplier or contract for a detail drawer.
- **Missions** — five days of structured activities (exercises, copy-ready LLM prompts, and case challenges) with auto-saving notes and completion tracking.
- **Backlog** — capture AI opportunities, tag by goal / type / value / readiness, and see them plotted on a value × readiness matrix.
- **My Strategy** — opportunities flow into a phased roadmap (Quick wins / Scale / Strategic bets / Foundations) plus a 90-day action plan you can print or export to PDF.

> Northwind is entirely fictional — every prompt and figure is safe to paste into any AI tool. The app reminds learners never to paste real, confidential data into public AI.

## Getting started

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Multi-user & instructor dashboard

The app supports many learners with a **local-first + backend-mirror** model — no logins or passwords.

- **Identity:** on first load a learner enters their **name** + a **cohort / join code** you hand out. A stable `learnerId` (UUID) is generated and stored locally. Progress is namespaced per learner (`cockpit:v1:<learnerId>`), so several people can share one browser without colliding — the sidebar chip lets them **Switch / add learner**.
- **Sync:** every change saves to `localStorage` instantly and is mirrored (debounced) to the backend so it can be collected centrally. The same person on a second device starts a fresh session — there is intentionally no cross-device sync.
- **Dashboard:** open `#admin` (or the "Instructor dashboard" link on the start/switch screens), enter the admin passphrase, and load a cohort to see every learner's progress %, opportunity backlog, 90-day plan, and mission notes.

### Backend

A single Supabase **edge function** (`supabase/functions/cockpit-sync`) handles both writes and dashboard reads using the service role. The `cockpit_sessions` table is **RLS-locked with no policies and anon revoked**, so the public anon key can't read or write learner data directly — only the function can. The dashboard read is gated by an `ADMIN_KEY` secret checked inside the function.

| Setting | Where |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Build-time env (Vercel + local `.env`). Public/safe to ship. |
| `ADMIN_KEY` | Supabase function secret — the dashboard passphrase. Change with `supabase secrets set ADMIN_KEY=... --project-ref <ref>`. |

Copy `.env.example` to `.env` for local dev. Leaving the env vars blank runs the app in **local-only mode** (per-browser progress, no cohort sync, no dashboard).

## Deploy

The repo includes `vercel.json` and is configured as a Vite project, so it deploys to **Vercel** out of the box — connect the GitHub repo or run `vercel` from the project root. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project for the multi-user features.

## Tech

| | |
|---|---|
| Framework | React 18 + Vite 6 |
| Charts | Recharts |
| Icons | lucide-react |
| State / persistence | React hooks + `localStorage` |
| Styling | Inline styles (single-file design system) |
