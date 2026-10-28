# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SafeSite AI is an AI workplace-safety and compliance platform for Vietnamese construction companies, factories and industrial contractors. This repo is the **prototype demo**: a static React SPA that shows the product workflow (Detect → Review → Act → Report) using simulated data only. There is no backend, real camera or ML model.

`docs/` holds the project rules. Read the relevant doc before making product or UI changes:
- `docs/PROJECT_SUMMARY.md`: product scope, the three core features, target customers, current stage.
- `docs/DESIGN.md`: visual system (tokens, components, Do's/Don'ts).
- `docs/summary.md`: known inconsistencies in `DESIGN.md`. Don't copy them: `#2f343` should be `#2f343e`, and the heading gradient runs top-to-bottom (`180deg`).

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve dist/
```

There is no test runner or linter configured. `npm run build` is the compile check. To verify UI changes, run the app and look at it.

## Stack

React 19 + Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config`), React Router 7 (`HashRouter`, so it deploys to any static host), lucide-react icons. Plain JSX, no TypeScript.

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

**Workflow navigation: `components/Workflow.jsx`.** `WORKFLOW` maps the 4 steps to routes. It drives the top-bar stepper, the per-page `GuideBanner` and the landing page's workflow section. To add or reorder a step, edit it here and add the matching `workflow.<key>.*` strings.

**Selectors: `lib/selectors.js`.** Derived metrics for the dashboard (`safetyScore` is a demo heuristic, `violationsByDay`, `forSite`, etc.).

## Bilingual rules (vi / en)

- UI strings live in `src/lib/i18n.js` as flat keys in both `en` and `vi` dictionaries. Use `t('key', { var })`, which fills `{var}` placeholders. Always add **both** languages; a missing key falls back to English, then to the key itself.
- Domain values that need both languages are stored as `{ en, vi }` objects and resolved with `bi(value, lang)` (`lib/format.js`). User-typed text is stored as a plain string. `bi` passes strings through unchanged, so both forms coexist (for example, corrective-action `text`).
- **Reports are always bilingual (Vietnamese first, English second), whatever the UI language.** `pages/Reports.jsx` keeps its own `R` label map and reads `.vi`/`.en` directly instead of using `t()`.
- Use `fmtDateTime` / `fmtDate` from `lib/format.js` for dates rather than raw `Intl`.

## Styling rules

- Design tokens are defined once in the `@theme` block in `src/index.css` (`canvas`, `steel`, `fog`, `mist`, `frost`, `ice`, `blueprint`, `edge`, `accent`, `critical`/`warning`/`good`, `series-1..3`). Reusable component classes live in `@layer components`: `glass-card`, `glass-modal`, `hairline`, `btn` + `btn-ghost`/`btn-outline`/`btn-cta`, `field`, `chip`, `eyebrow`, `text-skywash`, `bg-blueprint-grid`.
- **Violet (`btn-cta` / `accent`) is reserved for the single primary action on a screen.** Do not use it for decoration.
- Status colors (`critical`/`warning`/`good`) are a deliberate addition to DESIGN.md for safety severity and status. Always pair them with an icon and a text label (see `SeverityChip`, `IncidentStatusChip` in `components/ui.jsx`).
- Chart series colors (`series-1..3`) were validated for colorblind safety on the dark surface and are assigned in fixed order per violation type (`SERIES_COLOR` in `ViolationsChart.jsx`). Don't reuse status colors for series.
- Borders use the frosted inset hairline (`hairline` / `border-edge`), never solid colored strokes. Radii: pill buttons, 16px cards and modals, 6px inputs and badges.
- Fonts are the free substitutes from DESIGN.md (Inter, Space Grotesk as `font-display`, JetBrains Mono as `font-mono`), loaded from Google Fonts in `index.html`.
- Print: the Reports page prints as a white document. Use `print:` variants to hide app chrome and recolor text when you touch report markup.
