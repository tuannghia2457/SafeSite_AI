# SafeSite AI — Workflow Demo

Interactive prototype of **SafeSite AI**, an AI-powered workplace safety and compliance platform
(see `docs/PROJECT_SUMMARY.md`). The app walks through the full product workflow using simulated data.
No backend, camera or ML model is required.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## The workflow

| Step | Page | What to show |
|------|------|--------------|
| — | **Overview** (`/`) | Product pitch, the 4-step workflow, the core features, and target customers |
| — | **Dashboard** | Safety score, alerts to review, open incidents, 7-day detection chart, per-site status |
| 1. Detect | **Live monitoring** | Simulated CCTV feeds with YOLO-style detection boxes. Click **Simulate detection** to raise an alert |
| 2. Review | **Alerts** | Evidence frame plus AI confidence. **Confirm & create incident**, or dismiss as a false positive |
| 3. Act | **Incidents** | Assign an owner, set a due date, add corrective actions and tick them off, then resolve |
| 4. Report | **Reports** | Generate a bilingual Vietnamese–English report with evidence. **Print / Save as PDF** |

A guide banner on each workflow page says what to do and links to the next step.

### Demo controls (top bar and sidebar)

- **AI detection live / paused**: the simulated AI engine raises a new alert every 25 seconds and shows a toast.
- **VI / EN**: switches the whole UI language. Reports are always bilingual.
- **Reset demo data**: restores the original sample alerts and incidents. Demo state is saved in `localStorage`.

## Project structure

```
src/
  main.jsx, App.jsx        entry point and routes (HashRouter, so it works on any static host)
  index.css                Tailwind v4 theme: design tokens from docs/DESIGN.md
  data/mockData.js         sites, cameras, users, violation types, seed data and scene generator
  state/DemoStore.jsx      app state (reducer + localStorage) and the simulated AI engine
  lib/                     i18n dictionary (en/vi), formatting helpers, dashboard selectors
  components/              layout, workflow stepper, SVG camera frame/feed, chart, shared UI
  pages/                   Landing, Dashboard, Monitoring, Alerts, Incidents, IncidentDetail, Reports
```

## Notes

- **Design** follows `docs/DESIGN.md`: dark frosted-glass surfaces, and violet is used only for primary actions.
  The licensed fonts are replaced by their documented substitutes (Inter, Space Grotesk, JetBrains Mono).
  Status colors (critical, warning, good) are added for safety severity and always come with an icon and a label.
- **Camera feeds are SVG simulations.** To integrate a real model later, replace `createAlert()`/`buildSnapshot()`
  in `src/data/mockData.js` with detections from the CV service, and replace the reducer actions with API calls.
