// Content for the market-evidence page (/evidence).
// Every figure must have a matching row in docs/research/FACT_CHECK.md; `factId` points to that row.
// status: 'verified' | 'corrected' (PDF value was wrong/overstated, shown value is the verified one) | 'unverified'

export const STATS = [
  {
    factId: 'vn-accidents',
    value: '8,286',
    label: { en: 'workplace accidents reported in Vietnam, 2024', vi: 'vụ tai nạn lao động được báo cáo tại Việt Nam năm 2024' },
    note: { en: '+12.1% vs 2023. Official counts under-report informal work.', vi: 'Tăng 12,1% so với 2023. Số liệu chính thức chưa phản ánh đủ khu vực phi chính thức.' },
    source: { title: 'MOLISA via VNNIOSH', url: 'https://vnniosh.vn/so-vu-tai-nan-lao-dong-tang-trong-nam-2024/' },
    status: 'verified',
  },
  {
    factId: 'vn-deaths',
    value: '727',
    label: { en: 'workers killed on the job, 2024', vi: 'người lao động tử vong do tai nạn lao động năm 2024' },
    note: { en: '584 with labour contracts, 143 without.', vi: '584 người có hợp đồng lao động, 143 người không có hợp đồng.' },
    source: { title: 'MOLISA via VNNIOSH', url: 'https://vnniosh.vn/so-vu-tai-nan-lao-dong-tang-trong-nam-2024/' },
    status: 'verified',
  },
  {
    factId: 'vn-losses',
    value: '≈42,600',
    unit: { en: 'bn VND', vi: 'tỷ đồng' },
    label: { en: 'material losses from workplace accidents, 2024', vi: 'thiệt hại vật chất do tai nạn lao động năm 2024' },
    note: { en: 'The review said ">43,000 bn"; the official figure is ~42,565 bn plus ~492 bn property damage.', vi: 'Tài liệu ghi ">43.000 tỷ"; số chính thức là ~42.565 tỷ cộng ~492 tỷ thiệt hại tài sản.' },
    source: { title: 'MOLISA via Tuổi Trẻ', url: 'https://tuoitre.vn/nld/thiet-hai-vat-chat-tu-tai-nan-lao-dong-len-toi-42565-ti-dong-196250502083519553.htm' },
    status: 'corrected',
  },
  {
    factId: 'vn-fdi-realized',
    value: 'US$25.35B',
    label: { en: 'realized FDI in 2024, a record', vi: 'vốn FDI thực hiện năm 2024, mức kỷ lục' },
    note: { en: 'Vietnam\'s own series. UNCTAD\'s inflow series shows US$20.2B; never mix the two.', vi: 'Số liệu của Việt Nam. Theo UNCTAD là 20,2 tỷ USD; không trộn hai chuỗi số liệu.' },
    source: { title: 'GSO / FIA via US-ASEAN', url: 'https://www.usasean.org/article/vietnams-robust-economic-performance-2024' },
    status: 'verified',
  },
  {
    factId: 'vn-surplus',
    value: 'US$24.77B',
    label: { en: 'goods trade surplus in 2024, the 9th in a row', vi: 'thặng dư thương mại hàng hóa năm 2024, năm thứ 9 liên tiếp' },
    note: { en: 'The FDI sector earns the surplus (+US$50.3B); domestic firms run a deficit (−US$25.5B).', vi: 'Khu vực FDI xuất siêu (+50,3 tỷ USD); khu vực trong nước nhập siêu (−25,5 tỷ USD).' },
    source: { title: 'GSO via Vietnam Briefing', url: 'https://www.vietnam-briefing.com/news/vietnam-economy-2024-gdp-trade-fdi.html/' },
    status: 'verified',
  },
]

export const IFC_QUOTE = {
  factId: 'ifc-gpn',
  text: 'Poor records related to these matters should preclude the contractor from qualifying, regardless of technical aspects or price.',
  vi: 'Hồ sơ an toàn và môi trường – xã hội kém cần khiến nhà thầu không đủ điều kiện sơ tuyển, bất kể yếu tố kỹ thuật hay giá.',
  cite: 'IFC, Good Practice Note: Managing Contractors’ E&S Performance (2017), ¶34',
  url: 'https://www.ifc.org/content/dam/ifc/doc/mgrt/p-gpn-escontractormanagement.pdf',
}

// level: strong | case | discovery | test | weak | none
export const HYPOTHESES = [
  { level: 'weak', claim: { en: 'Vietnam loses national FDI mainly because of workplace safety', vi: 'Việt Nam mất FDI cấp quốc gia chủ yếu vì an toàn lao động' } },
  { level: 'strong', claim: { en: 'Poor safety records can make a contractor fail prequalification', vi: 'Hồ sơ an toàn kém có thể khiến nhà thầu không qua sơ tuyển' } },
  { level: 'case', claim: { en: 'Fatal safety failures can lead to contract suspension or termination', vi: 'Sự cố an toàn nghiêm trọng có thể dẫn tới đình chỉ hoặc chấm dứt hợp đồng' } },
  { level: 'strong', claim: { en: 'International buyers and lenders require suppliers to manage OHS', vi: 'Bên mua và bên cho vay quốc tế yêu cầu nhà cung cấp quản lý ATVSLĐ' } },
  { level: 'discovery', claim: { en: 'Vietnamese firms need to digitise their safety evidence', vi: 'Doanh nghiệp Việt Nam cần số hóa bằng chứng an toàn' } },
  { level: 'strong', claim: { en: 'Computer vision can automate PPE and hazard checks', vi: 'Thị giác máy tính có thể tự động kiểm tra PPE và mối nguy' } },
  { level: 'none', claim: { en: 'Computer vision by itself wins international contracts', vi: 'Riêng thị giác máy tính giúp thắng hợp đồng quốc tế' } },
  { level: 'test', claim: { en: 'A detection → remediation → audit-evidence platform creates value', vi: 'Nền tảng nối phát hiện → khắc phục → bằng chứng kiểm toán tạo ra giá trị' } },
]

export const LEVELS = {
  strong: { tone: 'good', en: 'Strong', vi: 'Mạnh' },
  case: { tone: 'good', en: 'Strong in specific cases', vi: 'Mạnh ở một số trường hợp' },
  discovery: { tone: 'warning', en: 'Plausible: needs customer discovery', vi: 'Hợp lý: cần khảo sát khách hàng' },
  test: { tone: 'warning', en: 'Worth testing commercially', vi: 'Đáng kiểm chứng thương mại' },
  weak: { tone: 'critical', en: 'Weak / unproven', vi: 'Yếu / chưa chứng minh' },
  none: { tone: 'critical', en: 'No evidence', vi: 'Chưa có bằng chứng' },
}

// UNCTAD WIR 2025 annex table 1 (US$ millions, 2024). Population: approx. 2024, millions (World Bank).
export const COMPARATORS = [
  {
    country: { en: 'Vietnam', vi: 'Việt Nam' },
    fdi: 20170,
    pop: 100.99,
    safety: { en: '8,286 accidents, 727 deaths (2024)', vi: '8.286 vụ tai nạn, 727 người chết (2024)' },
    consequence: { en: 'No public dataset of contracts lost because of OHS', vi: 'Chưa có dữ liệu công khai về hợp đồng bị mất vì ATVSLĐ' },
    home: true,
  },
  {
    country: { en: 'Malaysia', vi: 'Malaysia' },
    fdi: 11259,
    pop: 35.56,
    safety: { en: '324 deaths, 2.05 per 100k workers (2023)', vi: '324 người chết, 2,05/100.000 lao động (2023)' },
    consequence: { en: 'Highest FDI per head in the group despite fatalities', vi: 'FDI/người cao nhất nhóm dù vẫn có tử vong' },
  },
  {
    country: { en: 'Thailand', vi: 'Thái Lan' },
    fdi: 10580,
    pop: 71.67,
    safety: { en: 'National statistics not comparable with Vietnam', vi: 'Thống kê quốc gia không so sánh trực tiếp với Việt Nam' },
    consequence: { en: 'Jan 2026 crane disasters (~30 deaths): termination ordered, contracts suspended', vi: 'Sập cần cẩu 1/2026 (~30 người chết): lệnh chấm dứt hợp đồng, tạm đình chỉ' },
  },
  {
    country: { en: 'Indonesia', vi: 'Indonesia' },
    fdi: 24212,
    pop: 283.49,
    safety: { en: 'Multi-agency OSH data', vi: 'Dữ liệu ATVSLĐ từ nhiều cơ quan' },
    consequence: { en: 'Morowali smelter blast 2023 (21 deaths); investment continued', vi: 'Nổ lò Morowali 2023 (21 người chết); đầu tư vẫn tiếp tục' },
  },
  {
    country: { en: 'China', vi: 'Trung Quốc' },
    fdi: 116238,
    pop: 1409.0,
    safety: { en: 'Officially reported accidents falling', vi: 'Số vụ tai nạn chính thức giảm' },
    consequence: { en: 'Jinjiang shoe-factory fire, Jul 2026 (28 deaths)', vi: 'Cháy xưởng giày Tấn Giang, 7/2026 (28 người chết)' },
  },
  {
    country: { en: 'Bangladesh', vi: 'Bangladesh' },
    fdi: 1270,
    pop: 173.56,
    safety: { en: 'Rates hard to harmonise; building and fire safety in garments', vi: 'Khó chuẩn hóa tỷ lệ; an toàn kết cấu và PCCC ngành may' },
    consequence: { en: 'Rana Plaza → 200+ brands sign the Accord; low FDI has other main causes', vi: 'Rana Plaza → hơn 200 thương hiệu ký Accord; FDI thấp chủ yếu do nguyên nhân khác' },
  },
]

export const CASES = [
  {
    key: 'ifc',
    factId: 'ifc-gpn',
    year: '2017',
    title: { en: 'IFC contractor prequalification', vi: 'Sơ tuyển nhà thầu theo IFC' },
    fact: {
      en: 'Missing H&S records, unacceptable past performance or regulator sanctions are listed as grounds to disqualify a contractor.',
      vi: 'Không cung cấp hồ sơ an toàn, thành tích quá khứ không chấp nhận được hoặc bị cơ quan quản lý xử phạt là căn cứ loại nhà thầu.',
    },
    caveat: {
      en: 'This is guidance for IFC-financed projects, not law. A missing answer usually means a zero score, not automatic exclusion.',
      vi: 'Đây là hướng dẫn cho dự án do IFC tài trợ, không phải luật. Thiếu thông tin thường bị chấm 0 điểm chứ không tự động bị loại.',
    },
  },
  {
    key: 'thailand',
    factId: 'th-blacklist',
    year: '2026',
    title: { en: 'Thailand crane collapses', vi: 'Sập cần cẩu tại Thái Lan' },
    fact: {
      en: 'After two crane collapses killed about 30 people, the Prime Minister ordered the contractor’s contracts terminated and blacklisted; all related contracts were suspended.',
      vi: 'Sau hai vụ sập cần cẩu làm khoảng 30 người chết, Thủ tướng ra lệnh chấm dứt hợp đồng và đưa nhà thầu vào danh sách đen; các hợp đồng liên quan bị tạm đình chỉ.',
    },
    caveat: {
      en: 'Final termination was referred to the Attorney-General; the blacklisting is not confirmed.',
      vi: 'Việc chấm dứt cuối cùng được chuyển Văn phòng Tổng chưởng lý xem xét; chưa xác nhận đã vào danh sách đen.',
    },
  },
  {
    key: 'rana',
    factId: 'bd-accord',
    year: '2013',
    title: { en: 'Rana Plaza and the Accord', vi: 'Rana Plaza và Accord' },
    fact: {
      en: '1,134 deaths led 200+ global brands to sign a binding Accord with factory inspections and remediation across their suppliers.',
      vi: '1.134 người chết khiến hơn 200 thương hiệu toàn cầu ký Accord ràng buộc, kiểm tra và khắc phục nhà máy trong chuỗi cung ứng.',
    },
    caveat: {
      en: 'Buyers stayed in Bangladesh but imposed governance on suppliers. Safety reshaped sourcing, not the FDI total.',
      vi: 'Bên mua không rời Bangladesh mà áp đặt cơ chế quản trị lên nhà cung cấp. An toàn thay đổi cách mua hàng, không phải tổng FDI.',
    },
  },
  {
    key: 'eu',
    factId: 'eu-csddd',
    year: '2029',
    title: { en: 'EU due-diligence law (CSDDD)', vi: 'Luật thẩm định chuỗi cung ứng EU (CSDDD)' },
    fact: {
      en: 'Large EU-linked companies must manage human-rights and environmental harm in their value chains, including suppliers.',
      vi: 'Doanh nghiệp lớn liên quan tới EU phải quản lý tác động về nhân quyền và môi trường trong chuỗi giá trị, kể cả nhà cung cấp.',
    },
    caveat: {
      en: 'Omnibus I (2026) cut the scope to >5,000 employees and >€1.5B turnover, and it applies only from July 2029. A weak near-term driver.',
      vi: 'Omnibus I (2026) thu hẹp phạm vi còn >5.000 nhân viên và >1,5 tỷ EUR doanh thu, chỉ áp dụng từ 7/2029. Động lực ngắn hạn yếu.',
    },
  },
]

export const EVIDENCE_FLOW = [
  { en: 'Field work', vi: 'Hiện trường' },
  { en: 'Safety events', vi: 'Sự kiện an toàn' },
  { en: 'Corrective action', vi: 'Khắc phục' },
  { en: 'Evidence & audit trail', vi: 'Bằng chứng & nhật ký' },
  { en: 'Safety KPIs & history', vi: 'KPI & lịch sử an toàn' },
  { en: 'Prequalification dossier', vi: 'Hồ sơ sơ tuyển' },
  { en: 'International buyer', vi: 'Đối tác quốc tế' },
]
export const FAILURE_FLOW = [
  { en: 'No records', vi: 'Không có ghi nhận' },
  { en: 'Missing evidence', vi: 'Thiếu bằng chứng' },
  { en: 'Audit friction / low score', vi: 'Khó kiểm toán / điểm thấp' },
  { en: 'Fails qualification', vi: 'Trượt sơ tuyển' },
]

export const COMPETITORS = [
  { name: 'Intenseye', does: { en: 'AI EHS platform on existing cameras, many hazard classes', vi: 'Nền tảng EHS AI trên camera sẵn có, nhiều loại mối nguy' }, url: 'https://www.intenseye.com' },
  { name: 'Protex AI', does: { en: 'Configurable vision rules: PPE, zones, vehicles', vi: 'Quy tắc thị giác tùy biến: PPE, khu vực, phương tiện' }, url: 'https://www.protex.ai' },
  { name: 'viAct', does: { en: 'Construction CV: PPE, work at height, restricted zones', vi: 'CV cho xây dựng: PPE, làm việc trên cao, vùng cấm' }, url: 'https://www.viact.ai' },
  { name: 'Voxel', does: { en: 'Camera analytics: vehicles, PPE, ergonomics', vi: 'Phân tích camera: phương tiện, PPE, công thái học' }, url: 'https://www.voxelai.com' },
  { name: 'Do & Pham, 2026', does: { en: 'Vietnamese YOLOv8 helmet detection: 97% precision at mAP@0.5', vi: 'Nhận diện mũ bảo hộ YOLOv8 của tác giả Việt: precision 97% tại mAP@0.5' }, url: 'https://arxiv.org/abs/2610.05756' },
]

export const MOAT_LADDER = [
  { tier: { en: 'Weak', vi: 'Yếu' }, body: { en: 'Own YOLO model · helmet detection · generic CCTV dashboard', vi: 'Mô hình YOLO riêng · nhận diện mũ · dashboard CCTV chung chung' } },
  { tier: { en: 'Stronger', vi: 'Mạnh hơn' }, body: { en: 'Vietnam-specific site dataset · edge deployment know-how · few false alerts', vi: 'Dữ liệu công trường Việt Nam · kinh nghiệm triển khai edge · ít cảnh báo sai' } },
  { tier: { en: 'Stronger still', vi: 'Mạnh hơn nữa' }, body: { en: 'Safety workflow · contractor graph · historical records · audit evidence', vi: 'Quy trình an toàn · mạng lưới nhà thầu · lịch sử hồ sơ · bằng chứng kiểm toán' } },
  { tier: { en: 'Strongest', vi: 'Mạnh nhất' }, body: { en: 'International owners trust safety data supplied by Vietnamese contractors through us', vi: 'Chủ đầu tư quốc tế tin dữ liệu an toàn do nhà thầu Việt cung cấp qua nền tảng' } },
]

export const CLAIMS_WE_DONT_MAKE = [
  {
    claim: { en: '“Vietnam loses FDI because its workplaces are unsafe.”', vi: '“Việt Nam mất FDI vì nơi làm việc không an toàn.”' },
    why: { en: 'Record realized FDI (US$25.35B) and a US$24.77B trade surplus in 2024. No causal study isolates safety.', vi: 'FDI thực hiện kỷ lục (25,35 tỷ USD) và thặng dư 24,77 tỷ USD năm 2024. Chưa có nghiên cứu nhân quả tách riêng yếu tố an toàn.' },
  },
  {
    claim: { en: '“Our AI makes you ISO 45001 compliant.”', vi: '“AI của chúng tôi giúp bạn đạt ISO 45001.”' },
    why: { en: 'ISO 45001 is a management-system standard certified by audit, and it is being revised for 2027. We supply evidence, not certificates.', vi: 'ISO 45001 là tiêu chuẩn hệ thống quản lý, chứng nhận qua đánh giá, và đang được sửa đổi cho 2027. Chúng tôi cung cấp bằng chứng, không cấp chứng nhận.' },
  },
  {
    claim: { en: '“Accidents fall 50% within 3 months.”', vi: '“Tai nạn giảm 50% sau 3 tháng.”' },
    why: { en: 'Serious accidents are rare events; a small pilot cannot show that statistically. We track leading indicators instead.', vi: 'Tai nạn nghiêm trọng hiếm khi xảy ra; một pilot nhỏ không đủ để chứng minh thống kê. Chúng tôi theo dõi chỉ số dẫn dắt.' },
  },
  {
    claim: { en: '“No one has built AI safety monitoring.”', vi: '“Chưa ai làm giám sát an toàn bằng AI.”' },
    why: { en: 'Intenseye, Protex AI, viAct and Voxel sell it today, and papers report 97% helmet-detection precision. Detection is a commodity.', vi: 'Intenseye, Protex AI, viAct, Voxel đã thương mại hóa; nghiên cứu báo cáo precision 97%. Phát hiện đã là hàng phổ thông.' },
  },
  {
    claim: { en: '“EU law forces suppliers to buy this now.”', vi: '“Luật EU buộc nhà cung cấp phải mua ngay.”' },
    why: { en: 'CSDDD was narrowed in 2026 and applies from July 2029 to very large firms only.', vi: 'CSDDD bị thu hẹp năm 2026, chỉ áp dụng từ 7/2029 cho doanh nghiệp rất lớn.' },
  },
]

export const PILOT_METRICS = [
  { area: { en: 'AI quality', vi: 'Chất lượng AI' }, metric: { en: 'False alerts per 100 camera-hours', vi: 'Cảnh báo sai / 100 giờ camera' } },
  { area: { en: 'Operations', vi: 'Vận hành' }, metric: { en: 'Median alert → closure time; % closed within SLA', vi: 'Thời gian trung vị từ cảnh báo → đóng; % đóng đúng hạn' } },
  { area: { en: 'Productivity', vi: 'Năng suất' }, metric: { en: 'Report preparation hours, before vs after', vi: 'Số giờ chuẩn bị báo cáo, trước và sau' } },
  { area: { en: 'Compliance', vi: 'Tuân thủ' }, metric: { en: '% of required evidence available at audit', vi: '% bằng chứng yêu cầu sẵn có khi kiểm toán' } },
  { area: { en: 'Commercial', vi: 'Thương mại' }, metric: { en: 'Prequalification pass rate (the core hypothesis)', vi: 'Tỷ lệ qua sơ tuyển (giả thuyết cốt lõi)' } },
  { area: { en: 'Outcome', vi: 'Kết quả' }, metric: { en: 'Repeat violations and near-miss recurrence', vi: 'Vi phạm lặp lại và tái diễn sự cố suýt xảy ra' } },
]

export const SOURCES = [
  { title: 'IFC — Good Practice Note: Managing Contractors’ E&S Performance (2017)', url: 'https://www.ifc.org/content/dam/ifc/doc/mgrt/p-gpn-escontractormanagement.pdf', status: 'verified' },
  { title: 'IFC — Performance Standard 2: Labor and Working Conditions', url: 'https://www.ifc.org/content/dam/ifc/doc/2010/2012-ifc-performance-standard-2-en.pdf', status: 'unverified' },
  { title: 'UNCTAD — World Investment Report 2025, annex table 1', url: 'https://unctad.org/system/files/official-document/wir2025_annex-tables_en.pdf', status: 'verified' },
  { title: 'GSO 2024 trade & FDI (via Vietnam Briefing)', url: 'https://www.vietnam-briefing.com/news/vietnam-economy-2024-gdp-trade-fdi.html/', status: 'verified' },
  { title: 'MOLISA 2024 workplace-accident report (via VNNIOSH)', url: 'https://vnniosh.vn/so-vu-tai-nan-lao-dong-tang-trong-nam-2024/', status: 'verified' },
  { title: 'DOSM — National Occupational Injury and Disease Statistics 2023 (Malaysia)', url: 'https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-national-occupational-injury-and-disease-statistics-', status: 'verified' },
  { title: 'Nation Thailand — SRT refers ITD contract issue to Attorney-General', url: 'https://www.nationthailand.com/news/general/40061863', status: 'verified' },
  { title: 'Clean Clothes Campaign — Rana Plaza', url: 'https://cleanclothes.org/campaigns/past/rana-plaza', status: 'verified' },
  { title: 'Clifford Chance — Omnibus I concludes CSDDD reform (2026)', url: 'https://www.cliffordchance.com/insights/resources/blogs/business-and-human-rights-insights/2026/02/omnibus-i-the-european-union-concludes-csddd-and-csrd-reforms.html', status: 'verified' },
  { title: 'DQS — ISO 45001 revision at a glance', url: 'https://www.dqsglobal.com/en/explore/focus-area/iso-45001-revision-at-a-glance', status: 'verified' },
  { title: 'Do & Pham (2026) — Vision-enabled detection of safety helmet compliance, arXiv:2610.05756', url: 'https://arxiv.org/abs/2610.05756', status: 'verified' },
  { title: 'Kucera — Core labour standards and FDI, International Labour Review', url: 'https://researchrepository.ilo.org/', status: 'unverified' },
]
