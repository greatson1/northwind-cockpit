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

## Deploy

The repo includes `vercel.json` and is configured as a Vite project, so it deploys to **Vercel** out of the box — connect the GitHub repo or run `vercel` from the project root.

## Tech

| | |
|---|---|
| Framework | React 18 + Vite 6 |
| Charts | Recharts |
| Icons | lucide-react |
| State / persistence | React hooks + `localStorage` |
| Styling | Inline styles (single-file design system) |
