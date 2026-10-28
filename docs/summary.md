# SafesiteAI — Project Summary

_Last updated: 2026-10-28_

## Current State

The project is at the **design-foundation stage**. The workspace contains a single file:

| File | Purpose |
|------|---------|
| `DESIGN.md` | Visual style reference (design tokens, components, layout rules), modeled on the WorkOS **AuthKit** marketing site |

There is no application code, build setup, or version control (`git`) yet. No SafesiteAI-specific product requirements are documented. The design reference is borrowed from AuthKit and still uses AuthKit naming and content.

## Design Direction

**Concept:** *"Frosted glass cathedral at midnight"*: a dark-first, monochromatic UI with frosted-glass surfaces, a faint blueprint grid background, and luminous blue-white text. There is **one** chromatic accent (violet), and it is reserved for the primary call to action (CTA).

**Comparable brands:** Linear, Vercel, Clerk, Radix, Stripe.

### Color Essentials

| Role | Token | Value |
|------|-------|-------|
| Page canvas | `--color-midnight-canvas` | `#05060f` |
| Elevated surface | `--color-steel-plate` | `#2f343e` |
| Headline text | `--color-ice-highlight` | `#d8ecf8` (gradient → `#98c0ef` for display) |
| Body text | `--color-frost-glow` | `#d1e4fa` |
| Muted text | `--color-moon-mist` | `#c7d3ea` |
| Helper text | `--color-fog-veil` | `#9da7ba` |
| Hairline border | `--color-glass-edge` | `rgba(186,215,247,0.12)` |
| Primary CTA (only accent) | `--color-void-violet` | `#663af3` |

### Typography

| Typeface | Fallback | Use |
|----------|----------|-----|
| Untitled Sans | Inter | Body, UI, buttons, inputs, badges (400–700) |
| aeonikPro | Space Grotesk | Display headings only, weight 500 at 28–48px |
| dotDigital | JetBrains Mono | All-caps eyebrow labels, 15px, 0.10em tracking |

Type scale: 12 / 14 / 16 / 18 / 24 / 28 / 44 / 48px.

### Spacing, Shape & Layout

- **Base unit:** 4px. Density is comfortable.
- **Layout:** 1200px max width, 120px section gap, 24px card padding, 16px element gap.
- **Radius families:** buttons 999px (pill), cards and modals 16px, inputs and badges 6px, icon tiles 9999px (circle).
- **Elevation:** inset frost highlights plus soft outer halos instead of conventional drop shadows.

### Component Inventory

- Buttons: Ghost Pill, Outlined Pill, Violet CTA, Provider (social login)
- Surfaces: Glass Feature Card, Auth-Form Modal Card
- Form: Text Input
- Content: Section Eyebrow Label, Feature Icon Tile, Badge/Tag, Logo Mark
- Ambient: Background Grid Layer, conic-gradient spotlight halo
- Utility: Theme Toggle (light/dark), Customization Swatch

### Key Rules

- Use only one chromatic accent (violet), and only on the primary submit/CTA.
- Never use solid borders. Use a 1px inset frosted hairline instead.
- Reserve the gradient for the display wordmark and the largest headings.
- Never use bold (600+) weights on display headings.
- Open every section with a centered eyebrow label, then a 44–48px heading, then one line of muted body text (max width about 640px).
- Use no photography. The visuals are glass UI mockups, line-art icons, and the grid.

### Ready-to-Use Assets

`DESIGN.md` ships complete token sets for **CSS custom properties** (`:root`) and **Tailwind v4** (`@theme`), so you can drop them straight into a front-end project.

## Issues Found in `DESIGN.md`

1. **Truncated hex:** in the Surfaces table and `--surface-steel-plate`, the value `#2f343` should be `#2f343e`.
2. **CTA radius conflict:** the Violet CTA component specifies a 6px radius, but the Agent Prompt Guide example uses 9999px, and the Do's say all interactive elements are 999px.
3. **Gradient direction:** `linear-gradient(0deg, #d8ecf8 0%, #98c0ef 100%)` runs bottom → top, but the text describes a top-to-bottom fade from `#d8ecf8`. Use `180deg` if top-to-bottom is intended.
4. **Naming drift:** the gradient is called both "Ice Highlight" and "Skywash".
5. **Brand mismatch:** content still references AuthKit/WorkOS (wordmark, auth-form hero, sample copy) and needs adapting to SafesiteAI.

## Suggested Next Steps

1. Document the SafesiteAI product scope: its purpose, target users, and core features.
2. Fix the inconsistencies above and rebrand `DESIGN.md` for SafesiteAI.
3. Choose the tech stack (for example, a React/Next.js + Tailwind v4 setup would reuse the provided tokens directly).
4. Initialize a git repository and project scaffold.
5. License or substitute the proprietary fonts (Untitled Sans, aeonikPro, dotDigital).
