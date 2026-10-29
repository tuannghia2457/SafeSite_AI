---
name: challenge-claim
description: Red-team a SafeSite AI startup or pitch claim (market, FDI, safety statistics, competition, ISO/IFC compliance, product impact). Steelmans it, hunts for counter-evidence, grades it on the project's evidence ladder and proposes a defensible rewrite. Use when the user asks to challenge, counter-argue, stress-test, play devil's advocate on, or "is this claim true" about anything in the pitch, docs/STARTUP_THESIS.md or the /evidence page.
argument-hint: "<claim to challenge>"
---

# Challenge a claim

You are the project's red team. Your job is to find out whether a claim would survive a sceptical investor, auditor or buyer. Defending the claim is not your job. Be fair: steelman it first, then attack it.

The claim to challenge is in `$ARGUMENTS`. If it is empty, ask which claim to test. Suggest ones from `docs/STARTUP_THESIS.md`.

## 1. Load the project's evidence base
Read these before searching the web:
- `docs/research/LITERATURE_REVIEW.md`: findings, the hypothesis table, comparators, the moat ladder.
- `docs/research/FACT_CHECK.md`: verified, corrected and unverified numbers, with sources.
- `docs/STARTUP_THESIS.md`: positioning and the "Claims we don't make" table.
- `src/data/evidence.js`: what the public `/evidence` page currently says.

If the claim already appears in "Claims we don't make", say so up front and quote the reason.

## 2. Steelman
State the strongest version of the claim, and what evidence would have to be true for it to hold.

## 3. Attack
Look for counter-evidence. Check every one of these lenses and say which apply:
- **Macro data**: does aggregate data contradict it? E.g. Vietnam's 2024 trade surplus and record FDI contradict "Vietnam loses FDI because of safety".
- **Causality**: correlation vs causation, reverse causality (FDI → better safety), omitted variables (market size, wages, logistics, tariffs).
- **Measurement**: denominator problems, under-reporting, different national statistical definitions (ILO), mixing data series (UNCTAD inflows vs Vietnam's "realized FDI").
- **Attribution**: is safety the deciding factor, or one of many (quality, price, ESG, labour rights)?
- **Scope**: does a source apply only to a niche? E.g. IFC guidance covers IFC-financed projects; CSDDD covers >5,000-employee firms from 2029.
- **Recency and wording**: did events resolve as claimed? E.g. Thailand ordered termination but referred it to the Attorney-General.
- **Competition and novelty**: Intenseye, Protex AI, viAct, Voxel and published research.
- **Statistical power**: can a pilot of this size actually show the effect?

For anything not covered by the docs, search the web (`WebSearch`/`WebFetch`), preferring primary sources: ILO, IFC/World Bank, UNCTAD, GSO/MOLISA, government gazettes, peer-reviewed papers.

For a deeper or contested claim, use the academic-research-skills plugin (enabled in `.claude/settings.json`):
- `academic-research-skills:deep-research` in **fact-check** mode to verify specific facts and grade sources.
- `academic-research-skills:deep-research` with the **devil's advocate** agent to test assumptions and look for alternative explanations.
- For a pitch deck or written proposal, `/ars-reviewer` gives a simulated peer-review panel.

## 4. Verdict
Grade the claim on the project's ladder. These are the `LEVELS` keys in `src/data/evidence.js`:

| Level | Meaning |
|-------|---------|
| `strong` | Primary sources directly support it |
| `case` | True in specific documented cases; don't generalise |
| `discovery` | Plausible, but needs customer interviews to quantify |
| `test` | A commercial hypothesis only pilot data can prove |
| `weak` | Contradicted by data or unproven |
| `none` | No evidence found |

## 5. Output
Reply with:
1. **Verdict**: the level, plus one sentence.
2. **Steelman**: 2–3 lines.
3. **Counter-evidence**: bullets, each with a source link. Mark anything you couldn't verify.
4. **Defensible rewrite**: the strongest version of the claim the evidence supports, in English and Vietnamese.
5. **What would change the verdict**: the specific data or interview result that would upgrade it.

## 6. Keep the project consistent
Ask before editing, then offer to:
- Add the claim to `HYPOTHESES` or `CLAIMS_WE_DONT_MAKE` in `src/data/evidence.js`, with both `en` and `vi` text, and to the table in `docs/STARTUP_THESIS.md`.
- Log any new statistic with the `/verify-stat` skill so it gets a `docs/research/FACT_CHECK.md` row.
