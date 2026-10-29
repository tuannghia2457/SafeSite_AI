# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SafeSite AI is an AI workplace-safety and compliance platform for Vietnamese construction companies, factories and industrial contractors. This repo is the **prototype demo**: a static React SPA that shows the product workflow (Check in → Detect → Review → Act → Report) using simulated data only. There is no real backend, camera feed or ML model: the "backend" is a mock API plus an in-browser IndexedDB database, built to *show* how a server would handle the data.

`docs/` holds the project rules. Read the relevant doc before making product or UI changes:
- `docs/PROJECT_SUMMARY.md`: product scope, the three core features, target customers, current stage.
- `docs/DESIGN.md`: visual system (tokens, components, Do's/Don'ts).
- `docs/summary.md`: known inconsistencies in `DESIGN.md`. Don't copy them: `#2f343` should be `#2f343e`, and the heading gradient runs top-to-bottom (`180deg`).
- `docs/STARTUP_THESIS.md` and `docs/research/`: the market thesis, the literature-review digest and the statistics fact-check log.

## Evidence page and research rules

`/evidence` (`src/pages/Evidence.jsx`) is a public pitch page at the same level as the landing page (outside the app `Layout`). All of its content lives in `src/data/evidence.js` as bilingual `{ en, vi }` objects.
- **Every statistic needs a row in `docs/research/FACT_CHECK.md`.** Link it with `factId` and give it a `status` of `verified`, `corrected` or `unverified`. Never show a number without its source and status badge. The literature-review PDF was AI-generated, so don't copy numbers from it without checking them.
- Never mix FDI series: UNCTAD *inflows* (US$20.2B for VN in 2024) are not Vietnam's *realized* FDI (US$25.35B).
- Keep counter-arguments visible. Before adding a claim, check `CLAIMS_WE_DONT_MAKE` and the table in `docs/STARTUP_THESIS.md`. The thesis is "safety-evidence layer for Vietnamese contractors in international projects", **not** "Vietnam loses FDI because of safety" and not "we detect helmets".
- Project skills: `/verify-stat <figure>` fact-checks a number and updates the log; `/challenge-claim <claim>` red-teams a claim and grades it on the `LEVELS` ladder. The `academic-research-skills` plugin is enabled in `.claude/settings.json`; use its deep-research fact-check and devil's-advocate modes for contested claims.
- Public pages share `components/SiteHeader.jsx`. In-page anchors must use its `scrollTo()`, never `href="#id"`: under `HashRouter`, a hash link changes the route.

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve dist/
```

There is no test runner or linter configured. `npm run build` is the compile check. To verify UI changes, run the app and look at it.

## Stack

React 19 + Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config`), React Router 7 (`HashRouter`, so it deploys to any static host), Dexie 4 + `dexie-react-hooks` (IndexedDB), lucide-react icons. Plain JSX, no TypeScript.

## Architecture

**State: `src/state/DemoStore.jsx`.** A single `useReducer` store exposed through `useDemo()`. It returns `{ state, lang, t, ...actions }`. Pages never call `dispatch` directly. They use the action functions (`simulateAlert`, `confirmAlert`, `dismissAlert`, `setIncidentStatus`, `addAction`, `toggleAction`, `setLang`, `toggleSimulation`, `reset`).
- State is saved to `localStorage` under `safesite-demo-v1`; toasts are not saved. If you change the state shape, bump `version`. Otherwise old saved state will load with the wrong shape.
- The provider also runs the simulated "AI engine". While `state.simulation` is on, it calls `simulateAlert()` every 25 s.
- Alert IDs are assigned inside the reducer (`ADD_ALERT`). Incident IDs are computed in `confirmAlert` from `stateRef`, so the caller can navigate to the new incident straight away.

**Domain data: `src/data/mockData.js`.** Static catalogs (`SITES`, `CAMERAS`, `USERS`, `VIOLATIONS`, `SEVERITY`, `INCIDENT_STATUS`), plus:
- `buildInitialState(now)`: deterministic seed data (seeded PRNG `mulberry32`) placed relative to the current time, so the demo always looks recent.
- `createAlert` / `buildSnapshot`: build an alert with a frozen **snapshot** (worker positions + `targetId`). That snapshot is the "evidence frame" shown again in Alerts, Incident detail and Reports.
- `violationsOf(worker, zone)`: the single detection rule (no helmet / no vest / inside the camera's restricted `zone`). This is where a real CV model would plug in.

**Data flow:** alert (`new` → `confirmed` | `dismissed`). A confirmed alert creates one incident (`open` → `in_progress` → `resolved`). An incident has `actions[]` (corrective actions) and a `timeline[]` of event keys. The UI only allows resolving once every action is done.

**Camera rendering: `components/CameraFrame.jsx`.** Pure SVG in a fixed 320×180 coordinate space (`zone` and worker x/y use these units; worker `y` is the feet position). It draws the scene backdrop per `camera.scene` (`construction` | `factory` | `warehouse`), worker figures and YOLO-style boxes. `CameraFeed.jsx` wraps it for the live view and animates the workers locally (that motion is visual only and never creates alerts).

**Simulated backend: `src/backend/`.** Worker check-ins, contractors and reports use a separate data layer from the reducer store:
- `db.js`: Dexie schema (`companies`, `workers`, `checkins`, `photos`, `hazards`, `apiLog`, `meta`) and day helpers (`dayKey`, `shiftStart` = 07:00, `lastDays`). To change the schema, add a new `db.version(n)`; don't edit version 1 in place.
- `seed.js`: `ensureSeeded()` runs in `main.jsx` before the first render. It seeds 30 days of deterministic history (per-company behaviour `profile` in `data/companies.js`) and, on later visits, tops up the days since `meta.seededThrough` without overwriting real submissions.
- `api.js`: the mock REST API. **All writes go through `request(method, url, body, ctx)`**, which runs the handler, simulates latency, returns `steps` (the server pipeline: validate → photo → ai → rules → save → notify) and logs every call to `apiLog`. Reads use `useLiveQuery` on `db` directly. To build a real backend, keep the routes and swap `request()` for `fetch()`.
- `rules.js`: `evaluateCheckin()` → `cleared` / `flagged` (AI disagrees with the declaration) / `blocked` (unfit or required PPE missing). `simulatePpeDetection()` fakes the photo model. Unfit workers can only be `sent_home`, never "corrected"; this is enforced in both the API and the Attendance UI.
- `report.js`: `buildCompanyReport()` for the contractor report. Camera incidents (which live in the reducer store) are passed in via `ctx.incidents` and attributed to a company through `CAMERAS[].companyId`, i.e. by work zone. **Never attribute by face; there is no facial recognition.**

**Contractors: `src/data/companies.js`.** Fictional Vietnamese contractors (main + sub), their international clients and `CONTRACTS`, worker roster generator, PPE items, fitness checks and check-in statuses. Companies are the customers: firms that win contracts from international clients and must prove safety to keep them.

**Workflow navigation: `components/Workflow.jsx`.** `WORKFLOW` maps the 5 steps to routes (`also` lists extra routes that belong to a step, e.g. `/attendance` → Check in, `/companies` → Report). It drives the top-bar stepper, the per-page `GuideBanner` and the landing page's workflow section. To add or reorder a step, edit it here and add the matching `workflow.<key>.*` strings.

**Selectors: `lib/selectors.js`.** Derived metrics for the dashboard (`safetyScore` is a demo heuristic, `violationsByDay`, `forSite`, etc.).

## Bilingual rules (vi / en)

- UI strings live in `src/lib/i18n.js` as flat keys in both `en` and `vi` dictionaries. Use `t('key', { var })`, which fills `{var}` placeholders. Always add **both** languages; a missing key falls back to English, then to the key itself.
- Domain values that need both languages are stored as `{ en, vi }` objects and resolved with `bi(value, lang)` (`lib/format.js`). User-typed text is stored as a plain string. `bi` passes strings through unchanged, so both forms coexist (for example, corrective-action `text`).
- **Reports are always bilingual (Vietnamese first, English second), whatever the UI language.** `pages/Reports.jsx` and `pages/CompanyDetail.jsx` keep their own `R` label maps and read `.vi`/`.en` directly instead of using `t()`. Shared pieces (`Bi`, `SectionTitle`, `downloadCsv`) are in `components/report.jsx`.
- Use `fmtDateTime` / `fmtDate` from `lib/format.js` for dates rather than raw `Intl`.

## Styling rules

- Design tokens are defined once in the `@theme` block in `src/index.css` (`canvas`, `steel`, `fog`, `mist`, `frost`, `ice`, `blueprint`, `edge`, `accent`, `critical`/`warning`/`good`, `series-1..3`). Reusable component classes live in `@layer components`: `glass-card`, `glass-modal`, `hairline`, `btn` + `btn-ghost`/`btn-outline`/`btn-cta`, `field`, `chip`, `eyebrow`, `text-skywash`, `bg-blueprint-grid`.
- **Violet (`btn-cta` / `accent`) is reserved for the single primary action on a screen.** Do not use it for decoration.
- Status colors (`critical`/`warning`/`good`) are a deliberate addition to DESIGN.md for safety severity and status. Always pair them with an icon and a text label (see `SeverityChip`, `IncidentStatusChip` in `components/ui.jsx`).
- Chart series colors (`series-1..3`) were validated for colorblind safety on the dark surface and are assigned in fixed order per violation type (`SERIES_COLOR` in `ViolationsChart.jsx`). Don't reuse status colors for series.
- Borders use the frosted inset hairline (`hairline` / `border-edge`), never solid colored strokes. Radii: pill buttons, 16px cards and modals, 6px inputs and badges.
- Fonts are the free substitutes from DESIGN.md (Inter, Space Grotesk as `font-display`, JetBrains Mono as `font-mono`), loaded from Google Fonts in `index.html`.
- Print: the Reports page prints as a white document. Use `print:` variants to hide app chrome and recolor text when you touch report markup.
