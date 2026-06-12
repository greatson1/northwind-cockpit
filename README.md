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

## Multi-user, identity & instructor dashboard

Per-learner identity with **no personal data and no passwords/email** — and therefore **no Supabase Auth**, so nothing here affects any other app on the same Supabase project.

- **Access codes are the identity.** The instructor generates seat codes (`NW-XXXXX`) in the dashboard and hands them out, one per learner. The code is both the learner's identity and their secret: entering it on **any device** loads their work (true cross-device sync), and an **unknown code can't write**, so seats can't be impersonated or spammed. Learners may set an optional display **handle** (a nickname, not personal data).
- **Local + sync.** Progress saves to `localStorage` instantly and mirrors (debounced) to the backend; signing in pulls the server copy so a second device picks up where the first left off. Several seats can share one browser — the sidebar chip lets you **Switch / add a seat**.
- **Dashboard.** Open `#admin` (or the "Instructor dashboard" link on the sign-in screen) and enter the admin passphrase to **issue access codes** (cohort + count → copy-all) and view the **roster** — claimed vs unclaimed seats, each with progress %, opportunity backlog, 90-day plan, and mission notes.

### Backend

Data lives in an **isolated `cockpit` schema** (a partition), reached only through a single Supabase **edge function** (`supabase/functions/cockpit-sync`) using the service role via `SECURITY DEFINER` RPCs — the public anon key can't touch it. The function exposes `signin` / `save` (open to any valid, pre-issued code) and `list` / `generate` (gated by an `ADMIN_KEY` secret).

| Setting | Where |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Build-time env (Vercel + local `.env`). Public/safe to ship. |
| `ADMIN_KEY` | Supabase function secret — the dashboard passphrase (issue codes + read roster). Change with `supabase secrets set ADMIN_KEY=... --project-ref <ref>`. |

Copy `.env.example` to `.env` for local dev. Leaving the env vars blank runs the app in **local-only mode** (per-browser progress, no codes/sync/dashboard).

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
