---
name: verify-stat
description: Verify a single statistic or factual claim used by SafeSite AI (accident counts, FDI, trade, comparator-country data, incident death tolls, regulations, research results) against primary sources, then record the result in docs/research/FACT_CHECK.md and the status field in src/data/evidence.js. Use before adding any number to the /evidence page, the pitch or the docs, or when asked to fact-check or re-check a figure.
argument-hint: "<statistic or fact-check ID>"
---

# Verify a statistic

Input: `$ARGUMENTS` is either a statistic ("Vietnam had 727 workplace deaths in 2024") or an existing row ID from `docs/research/FACT_CHECK.md` (e.g. `vn-deaths`) to re-check.

## Steps

1. **Find the existing record.** Search `docs/research/FACT_CHECK.md` and `src/data/evidence.js` (look for `factId`) for the figure. Note the current value, status and source.

2. **Find the primary source.** Use `WebSearch` / `WebFetch`, in this order of preference:
   1. The issuing body: GSO, MOLISA/Bộ Nội vụ, UNCTAD annex tables, ILO, IFC, DOSM, a government gazette.
   2. Peer-reviewed papers or arXiv, read from the abstract or full text, not from summaries.
   3. Reputable news (AP, Reuters, national press), and only for events.

   For PDFs that WebFetch can't parse, the raw file is saved under the tool-results directory. Extract it locally with `pdftotext -layout <file> -` or PyMuPDF (`python -c "import fitz"`), and read the actual table row.

3. **Check more than the number:**
   - **Value**: exact figure and rounding (">43,000" vs 42,565).
   - **Year and period**: calendar vs fiscal year; preliminary vs revised (e.g. a later WIR edition revising a figure).
   - **Definition and series**: e.g. UNCTAD FDI *inflows* ≠ Vietnam's *realized* FDI ≠ *registered* FDI. Never mix series in one comparison.
   - **Coverage**: formal vs informal workers, provinces reporting, national definitions (ILO warns raw cross-country rates aren't comparable).
   - **Event outcome**: for incidents, has the story moved on? E.g. "ordered termination" vs "terminated".
   - **Derived values**: if the number is computed (e.g. FDI per capita), record its inputs and mark it "derived".

4. **Assign a status:**
   - `verified`: matches a primary or reputable source.
   - `corrected`: the original value or wording was wrong or overstated; record the corrected value.
   - `unverified`: no primary source found. It may still be shown, but labelled as such.

5. **Record it.**
   - Add or update the row in `docs/research/FACT_CHECK.md`: ID | claim | original value | verified value | primary source (link) | status | note. Update the "Last checked" date.
   - If the figure appears in `src/data/evidence.js`, update its `value`, `status`, `source` and both `en`/`vi` `note` text to match.
   - If the correction changes a claim's strength, flag it for `/challenge-claim`.

6. **Report back** briefly: the verdict, the verified value, the source link, and every file you changed. Never present an unverified number as fact.
