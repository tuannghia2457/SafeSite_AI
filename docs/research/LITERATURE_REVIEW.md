# Literature Review: Digest

English digest of `Literature Review_ An toàn lao động, FDI và cơ hội thương mại của Việt Nam — hàm ý cho AI Safety & C.pdf` (same folder; Vietnamese; 25 pages). The PDF was generated with ChatGPT. Its numbers were re-checked in [FACT_CHECK.md](FACT_CHECK.md), and the corrected values below come from that file.

## Research questions

| ID | Question |
|----|----------|
| RQ-A FDI | Is there causal evidence that poor workplace safety stops multinationals investing in a country (Vietnam)? |
| RQ-B Trade/sourcing | Does poor safety compliance make suppliers lose export orders or fail supplier qualification? |
| RQ-C Procurement | In EPC, construction, infrastructure and internationally financed projects, does safety performance affect contractor selection and retention? |
| RQ-D Technology | Can computer vision produce evidence and workflows reliable enough to reduce the friction in RQ-B and RQ-C? |

Method: a structured/scoping review, **not** a PRISMA meta-analysis. Sources are prioritised as ILO, IFC/World Bank, UNCTAD and governments, then journals and reputable reporting.

## Headline findings

1. **The macro story does not hold.** Vietnam ran a US$24.77B goods surplus in 2024 and had record realized FDI (US$25.35B). There is no clean causal estimate of "FDI lost because of OHS"; the labour-standards → FDI literature (Kucera/ILO and later work) is mixed and specification-dependent. **Any "Vietnam loses $X of FDI because of safety" figure would be an unsupported marketing claim.**
2. **The procurement story is strong.** IFC's contractor Good Practice Note (2017) says poor E&S and safety records "should preclude the contractor from qualifying, regardless of technical aspects or price". IFC Performance Standard 2 requires OHS management, monitoring of third-party employers, and supply-chain remedies.
3. **Safety failures do create contract consequences.**
   - **Thailand, Jan 2026:** the PM ordered contract termination and blacklisting after crane collapses killed about 30 people (contracts suspended; final termination referred to the Attorney-General).
   - **Bangladesh:** Rana Plaza (1,134 deaths) led 200+ brands to sign a binding safety Accord. Buyers stayed but imposed governance on suppliers.
4. **FDI and safety risk coexist.** Malaysia has higher FDI per head than Vietnam yet recorded 324 occupational deaths in 2023. Indonesia's Morowali (21 deaths) and China's 2026 shoe-factory fire (28 deaths) did not stop investment. **Cross-country fatality-vs-FDI regressions suffer from heavy omitted-variable bias and reverse causality (FDI → better safety).**
5. **PPE detection is commoditized.** There is research since 2020 (Nath et al.), improper-PPE and action-recognition work, and large datasets (SFCHD, SH17). A Vietnamese YOLOv8 preprint (Oct 2026) reports 97% precision at mAP@0.5. Commercial vendors already exist: Intenseye, Protex AI, viAct and Voxel.

## Hypothesis → evidence strength

| Hypothesis | Evidence |
|------------|----------|
| Vietnam loses national FDI mainly because of workplace safety | **Weak / unproven** |
| Poor safety can make a contractor fail prequalification | **Strong** |
| Poor safety can lead to contract suspension or termination | **Strong in specific cases** |
| International buyers and lenders require suppliers/contractors to manage OHS | **Strong** |
| Vietnamese firms need to digitise safety evidence | **Plausible; needs customer discovery** |
| CV can automate PPE/hazard checks | **Strong technical feasibility** |
| CV by itself wins international contracts | **No evidence** |
| A detection → remediation → audit-evidence platform creates value | **Worth testing commercially** |

## Comparator table (UNCTAD 2024 inflows; per capita derived)

| Country | Safety evidence | FDI 2024 | FDI/capita | Procurement / incident evidence |
|---------|-----------------|----------|------------|---------------------------------|
| Vietnam | 8,286 accidents, 727 deaths (2024) | $20.2B | ~$200 | No public dataset of contracts lost to OHS |
| Thailand | National stats not comparable to VN | $10.6B | ~$148 | Jan 2026 crane disasters → termination ordered, contracts suspended |
| Malaysia | 324 deaths, 2.05/100k (2023) | $11.3B | ~$317 | High FDI despite fatalities |
| Bangladesh | Rates hard to harmonise | $1.3B | ~$7 | Rana Plaza → Accord; low FDI driven mainly by other barriers (UNCTAD) |
| China | Official accidents falling | $116.2B | ~$83 | 2026 shoe-factory fire, 28 deaths |
| Indonesia | Multi-agency OSH data | $24.2B | ~$85 | Morowali 2023, 21 deaths; investment continued |

**Takeaway:** there is no "safer country → more FDI" pattern. The defensible pattern is: FDI arrives → buyers, lenders and owners need safety governance → suppliers and contractors must produce evidence → audit, remediation and procurement friction. **That friction is the market.**

## Reframed thesis

- **Not:** "Vietnamese YOLO for helmets" or "help Vietnam get FDI".
- **But:** "Safety evidence infrastructure for Vietnamese companies entering global projects and supply chains."

CV is the sensor layer. The moat sits above it:
- risk workflow
- corrective action
- contractor management
- bilingual evidence and audit trail
- VN law ↔ international requirement mapping
- prequalification dossier
- safety history

**Moat ladder (weak → strongest):**
1. Own YOLO model, helmet detection, generic CCTV dashboard.
2. A Vietnam-specific dataset, deployment/edge expertise and low false-alert rates.
3. Safety workflow, contractor graph, historical records and audit evidence.
4. A network where international owners trust safety data supplied by Vietnamese contractors through the platform.

## Product architecture (from the review)

Four input layers (worker app, vision/edge AI, HSE workflow, project data) feed a **safety event and evidence graph**. The graph produces corrective actions, KPIs, an audit trail and compliance mapping, which feed a **global-readiness layer**: IFC/EHS, ISO 45001 evidence, VN OSH requirements, client-specific requirements and the prequalification package.

The core loop is: detect → validate → risk-classify → assign → remediate → verify → close → trend → report. The evidence model must be **standards-agnostic**, because ISO 45001 is being revised for 2027: change the mapping, not the data model.

**ICP:** Vietnamese contractors and subcontractors working for FDI developers, multinational EPCs, IFC/World Bank-linked projects or multinational manufacturers. The next segment is export factories with recurring social/EHS audits. Land-and-expand path: 1 contractor → 1 site → main-contractor dashboard → all subcontractors → portfolio network.

## Recommended MVP

"AI can see it. HSE can act on it. Company can prove it."

| Module | MVP scope |
|--------|-----------|
| Camera integration | 2–5 existing CCTV streams |
| AI | Helmet + vest + one restricted-zone rule |
| Worker app | Pre-shift PPE photo/checklist + hazard report |
| Event management | Validate / dismiss / assign / severity |
| Corrective action | Owner, deadline, photo evidence, closure |
| Dashboard | Violations, repeat events, zones, contractor |
| Evidence | Tamper-evident timestamps and event history |
| Reporting | Vietnamese + English monthly HSE report |
| Compliance | Initial IFC PS2 / client-requirement mapping |
| Privacy | Role-based access, retention settings, **no facial recognition by default** (PDPL 91/2025/QH15) |

## Pilot metrics

| Category | Metrics |
|----------|---------|
| CV quality | Precision/recall per hazard; **false alerts per 100 camera-hours**; missed critical events |
| Operations | Alert → acknowledgement time; alert → closure time; % closed within SLA; repeat violations |
| HSE productivity | Monitoring hours saved; report-prep hours before/after; evidence retrieval time |
| Compliance | % of required evidence available; open findings by severity; audit non-conformities before/after |
| Commercial | **Prequalification pass rate**; bids requiring HSE evidence; contracts where safety was scored; willingness to pay |
| Outcome | Near-miss recurrence (leading); recordable incidents/LTIs (lagging, long-term) |

Don't use "accidents −50% in 3 months" as an MVP KPI. Serious accidents are rare, so a small pilot has no statistical power to show it.

**North Star metric:** Verified Safety Closure Rate = high-risk cases closed with evidence within SLA ÷ total validated high-risk cases.

**Business model:** B2B SaaS + deployment. Price per site + contractor-management/compliance tier, not per camera, to avoid being compared with commodity video analytics. Never monetise workers.

## Validation plan

Run 15–20 interviews across four buyer groups:
- HSE managers at Vietnamese contractors
- HSE/procurement at multinational owners or EPCs
- factory compliance managers
- third-party auditors

Ask about concrete past tenders:
- What HSE documents were required?
- Did you lose points or fail prequalification because of missing records?
- How many person-hours does preparing the dossier take?
- How many findings came from evidence scattered across Excel, Zalo or paper?
- Who owns the budget?

**Research question that could become a dataset moat:** do digitally verifiable safety-management capabilities increase the probability that Vietnamese contractors pass international prequalification or supplier audits? The design compares baseline maturity, a 6–12-month pilot, and audit/bid outcomes against matched firms without the platform.

## Evidence hierarchy for pitching

- **Proven:** international project frameworks can require safety records, and poor records can disqualify a contractor. CV can detect many PPE violations.
- **Supported, needs Vietnam validation:** Vietnamese contractors in FDI projects face real friction producing safety evidence. IFC-backed projects in Vietnam already apply PS2 requirements (e.g. IFC project 34305, Pan Pacific VN).
- **Startup hypothesis to prove:** the platform helps Vietnamese contractors pass more prequalifications, win more contracts and retain international clients.

## Key sources

- IFC, *Managing Contractors' E&S Performance* GPN (2017): https://www.ifc.org/content/dam/ifc/doc/mgrt/p-gpn-escontractormanagement.pdf
- IFC Performance Standard 2: https://www.ifc.org/content/dam/ifc/doc/2010/2012-ifc-performance-standard-2-en.pdf
- Vietnam OSH Law 84/2015/QH13: https://vanban.chinhphu.vn/?docid=180606&pageid=27160
- ISO 45001 and revision: https://www.iso.org/standard/45001 · https://www.iso.org/standard/45001/rev
- ILO national OSH profiles: https://www.ilo.org/topics-and-sectors/safety-and-health-work/national-occupational-safety-and-health-profiles
- ILO OSH statistics issue paper (2025): https://www.ilo.org/sites/default/files/2025-11/TWG_OSH_Issue_Paper_2025_10_22.pdf
- UNCTAD World Investment Report: https://unctad.org/topic/investment/world-investment-report
- ILO Rana Plaza retrospective: https://webapps.ilo.org/infostories/en-GB/Stories/Country-Focus/rana-plaza.html
- EU CSDDD: https://commission.europa.eu/topics/business-and-industry/company-law-and-corporate-governance/corporate-sustainability-due-diligence_en
- Malaysia DOSM OSH statistics 2023: https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-national-occupational-injury-and-disease-statistics-
- Kucera, *Core labour standards and FDI*, International Labour Review: https://researchrepository.ilo.org/
- Nath et al. (2020), *Deep learning for site safety*, Automation in Construction: https://www.sciencedirect.com/science/article/abs/pii/S0926580519308325
- Do & Pham (2026), helmet compliance detection: https://arxiv.org/abs/2610.05756
- World Bank, *Enhancing Enterprise Competitiveness and SME Linkages*: https://openknowledge.worldbank.org/entities/publication/2129a9b8-cd1b-510f-b243-1304ba6e0af1
- Vendors: https://www.intenseye.com · https://www.protex.ai · https://www.viact.ai · https://www.voxelai.com
