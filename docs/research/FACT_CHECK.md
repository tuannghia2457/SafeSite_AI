# Fact Check: Statistics Used by SafeSite AI

Every number shown on the evidence page (`src/data/evidence.js`) or in a pitch needs a row here. The literature review PDF was generated with ChatGPT. Treat it as a lead list, not a source: cite the primary source in the "Primary source" column.

**Status values:**
- `verified`: matches a primary or reputable source.
- `corrected`: the PDF value or wording was wrong or overstated; use the verified value.
- `unverified`: no primary source confirmed yet. It may be shown, but only with an "unverified" label.

Last checked: 2026-10-28. Use the `/verify-stat` skill to add or re-check rows.

## Vietnam: macro and safety

| ID | Claim | PDF value | Verified value | Primary source | Status | Note |
|----|-------|-----------|----------------|----------------|--------|------|
| vn-exports | Goods exports 2024 | US$405.53B | US$405.53B (+14.3%) | GSO via [Vietnam Briefing](https://www.vietnam-briefing.com/news/vietnam-economy-2024-gdp-trade-fdi.html/), [Fibre2Fashion](https://www.fibre2fashion.com/news/textile-news/vietnam-s-2024-trade-surplus-24-77-bn-exports-expand-14-3-yoy-300046-newsdetails.htm) | verified | 71.7% of exports come from the foreign-invested sector |
| vn-surplus | Goods trade surplus 2024 | US$24.77B | US$24.77B (9th consecutive year) | GSO, same as above | verified | The domestic sector alone ran a −US$25.52B deficit; the FDI sector a +US$50.29B surplus |
| vn-fdi-realized | Realized (disbursed) FDI 2024 | US$25.35B | US$25.35B (+9.4%) | GSO / FIA via [US-ASEAN](https://www.usasean.org/article/vietnams-robust-economic-performance-2024) | verified | Different series from UNCTAD inflows (US$20.17B). Never mix the two |
| vn-accidents | Workplace accidents 2024 | 8,286 | 8,286 (+12.1% YoY) | MOLISA 2024 report via [VNNIOSH](https://vnniosh.vn/so-vu-tai-nan-lao-dong-tang-trong-nam-2024/) | verified | Covers workers with and without labour contracts |
| vn-deaths | Workplace deaths 2024 | 727 | 727 (+4.8% YoY) | MOLISA via [VNNIOSH](https://vnniosh.vn/so-vu-tai-nan-lao-dong-tang-trong-nam-2024/) | verified | 584 with contracts, 143 without |
| vn-losses | Economic losses 2024 | >43,000 bn VND | ~42,565 bn VND material losses (+61.5%) + ~492 bn VND property | MOLISA via [Tuổi Trẻ/NLĐ](https://tuoitre.vn/nld/thiet-hai-vat-chat-tu-tai-nan-lao-dong-len-toi-42565-ti-dong-196250502083519553.htm) | corrected | Use "≈42,600 bn VND"; ">43,000" only holds if property damage is added |
| vn-underreport | Official accident data undercounts | qualitative | Survey-based injury counts exceed administrative counts | [PubMed 19533881](https://pubmed.ncbi.nlm.nih.gov/19533881/) | unverified | Older study (2009); not independently re-read |
| vn-law | OSH Law 84/2015/QH13; ILO C155 & C187 ratified | — | Law 84/2015 effective 1 Jul 2016 | [vanban.chinhphu.vn](https://vanban.chinhphu.vn/?docid=180606&pageid=27160) | verified (law) / unverified (ratifications) | Check ratifications on ILO NORMLEX before quoting |
| vn-pdpl | Personal Data Protection Law 91/2025/QH15 | effective 1/1/2026 | Passed 26 Jun 2025, effective 1 Jan 2026 | [Bộ Công an](https://www.bocongan.gov.vn/bai-viet/luat-bao-ve-du-lieu-ca-nhan-chinh-thuc-co-hieu-luc-thi-hanh-tu-ngay-01-01-2026-1767186124) | verified | Fines up to 3 bn VND (organisations) or 10× revenue for data trading |

## UNCTAD FDI inflows 2024 (US$ millions, WIR 2025 annex table 1)

| ID | Economy | PDF value | Verified value | Status | Note |
|----|---------|-----------|----------------|--------|------|
| fdi-vn | Viet Nam | ~20.2B | 20,170 | verified | UNCTAD flags it as an estimate ("b") |
| fdi-th | Thailand | ~10.6B | 10,580 | verified | |
| fdi-my | Malaysia | ~11.3B | 11,259 | verified | |
| fdi-bd | Bangladesh | ~1.2B | 1,270 | verified | |
| fdi-cn | China | ~116B | 116,238 | verified | |
| fdi-id | Indonesia | ~24.2B | 24,212 | verified | WIR 2026 revises to 24,819 |

Source: [UNCTAD WIR 2025 annex tables](https://unctad.org/system/files/official-document/wir2025_annex-tables_en.pdf). Per-capita values are **derived** (inflow ÷ 2024 population, rounded) and are approximate: VN ~$200, TH ~$148, MY ~$317, BD ~$7, CN ~$83, ID ~$85.

## Comparator safety facts

| ID | Claim | PDF value | Verified value | Primary source | Status | Note |
|----|-------|-----------|----------------|----------------|--------|------|
| my-deaths | Malaysia occupational fatalities 2023 | 324 | 324 | [DOSM 2023](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-national-occupational-injury-and-disease-statistics-) | verified | 38,950 injuries total |
| my-rate | Malaysia fatal injury rate 2023 | 2.05 / 100k | 2.05 / 100k workers | DOSM, same as above | verified | Down from 4.62 in 2013 |
| my-construction | Malaysia construction deaths 2023 | 88 | — | — | unverified | Not found in sources checked |
| th-crane | Thailand crane collapse onto train, 14 Jan 2026 | ≥32 deaths | 28–32 deaths (reports vary); +2 deaths in a second ITD crane collapse on 15 Jan | [AP](https://apnews.com/article/4103e4d6806fe007d4e35f5eb9133a97), [ENR](https://www.enr.com/articles/62385-at-least-30-are-dead-in-pair-of-construction-crane-collapses-in-thailand) | corrected | Say "about 30 deaths" |
| th-blacklist | Contracts terminated / contractor blacklisted | "terminated/blacklisted" | PM **ordered** termination + blacklisting; all related contracts **suspended**; on 29 Jan 2026 the SRT board referred termination to the Attorney-General | [Nation Thailand](https://www.nationthailand.com/news/general/40061863), [Thaiger](https://thethaiger.com/news/national/pm-anutin-orders-termination-and-blacklisting-of-italian-thai-development) | corrected | Final blacklisting not confirmed. Use "ordered termination; contracts suspended" |
| bd-rana | Rana Plaza collapse, 24 Apr 2013 | >1,100 deaths | 1,134 deaths | [Clean Clothes Campaign](https://cleanclothes.org/campaigns/past/rana-plaza), [ILO](https://webapps.ilo.org/infostories/en-GB/Stories/Country-Focus/rana-plaza.html) | verified | |
| bd-accord | Brands joining the Bangladesh Accord | ~200 | 43 at launch (May 2013) → 200+ by end of 2013 Accord; 297 signatories by Apr 2026 | [IndustriALL](https://www.industriall-union.org/rana-plaza-anniversary-international-accord/), [CCC](https://cleanclothes.org/campaigns/past/rana-plaza) | verified | Say "200+ brands" and not "immediately" |
| id-morowali | Morowali (ITSS) furnace explosion, 24 Dec 2023 | 21 deaths | 21 deaths (13 Indonesian, 8 Chinese) | [BHRRC](https://www.business-humanrights.org/en/latest-news/indonesia-fatal-fire-followed-by-two-more-workplace-accidents-at-nickel-facilities-imip-safety-standard-under-scrutiny/) | verified | Early reports said 13–19 |
| cn-shoe-fire | Jinjiang (Fujian) shoe-factory fire, 9 Jul 2026 | 28 deaths | 28 deaths | [AP via US News](https://www.usnews.com/news/business/articles/2026-07-10/a-shoe-factory-fire-that-killed-28-highlights-chinas-persisting-worker-safety-risks), [Al Jazeera](https://www.aljazeera.com/news/2026/7/9/at-least-28-people-killed-as-fire-engulfs-shoe-factory-in-china) | verified | Factory supplied Chinese and foreign brands |

## Procurement, standards and technology

| ID | Claim | Verified wording | Primary source | Status | Note |
|----|-------|------------------|----------------|--------|------|
| ifc-gpn | IFC: poor safety records can disqualify a contractor | "poor records related to these matters should preclude the contractor from qualifying, **regardless of technical aspects or price**" (¶34). Grounds for disqualification include "failure to provide information on past E&S performance, including health and safety records" (¶37) | [IFC Good Practice Note, Oct 2017](https://www.ifc.org/content/dam/ifc/doc/mgrt/p-gpn-escontractormanagement.pdf) | verified | This is *guidance* for IFC clients, not binding law. Footnote 12: a missing answer usually means a zero score, not automatic disqualification |
| eu-csddd | EU due-diligence pressure on supply chains | CSDDD in force 25 Jul 2024; **Omnibus I (Dir. 2026/470)** narrowed scope to >5,000 employees and >€1.5B turnover, applying from **26 Jul 2029** | [Clifford Chance](https://www.cliffordchance.com/insights/resources/blogs/business-and-human-rights-insights/2026/02/omnibus-i-the-european-union-concludes-csddd-and-csrd-reforms.html), [Gibson Dunn](https://www.gibsondunn.com/omnibus-simplification-of-eu-sustainability-rules-csrd-and-csddd-enacted/) | corrected | A weaker near-term driver than the PDF implies |
| iso-45001 | ISO 45001 under revision | DIS ballot closed Sep 2026; new edition expected H1 2027, then a 3-year transition | [DQS](https://www.dqsglobal.com/en/explore/focus-area/iso-45001-revision-at-a-glance) | verified | Supports a standards-agnostic evidence model |
| cv-helmet | Helmet detection is commoditized | Do & Pham (Oct 2026), YOLOv8 construction-zone helmet detection; abstract reports precision above 97% at mAP@0.5 | [arXiv:2610.05756](https://arxiv.org/abs/2610.05756) | verified | Experimental setting only |
| cv-competitors | Commercial CV safety vendors exist | Intenseye, Protex AI, viAct, Voxel market PPE / zone / vehicle detection on existing cameras | Vendor sites (see LITERATURE_REVIEW.md) | verified (exist) | Capability claims are the vendors' own |
