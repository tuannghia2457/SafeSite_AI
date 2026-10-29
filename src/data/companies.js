// Contractor companies (fictional) — Vietnamese firms that win contracts from international clients,
// employ the workers, and must prove safety performance to keep those clients.

export const COMPANIES = [
  {
    id: 'C1',
    name: { vi: 'Công ty CP Xây dựng Sao Việt', en: 'Sao Viet Construction JSC' },
    short: 'Sao Việt',
    role: 'main',
    siteId: 'S1',
    taxCode: '0312 845 671',
    hseManager: 'U2',
    // Behaviour profile used only to seed realistic history
    profile: { checkin: 0.97, onTime: 0.94, ppeIssue: 0.03, unfit: 0.01, hazard: 0.05 },
  },
  {
    id: 'C2',
    name: { vi: 'Công ty TNHH Giàn giáo Hùng Phát', en: 'Hung Phat Scaffolding Co., Ltd.' },
    short: 'Hùng Phát',
    role: 'sub',
    parentId: 'C1',
    siteId: 'S1',
    taxCode: '0315 220 948',
    hseManager: 'U5',
    profile: { checkin: 0.8, onTime: 0.72, ppeIssue: 0.13, unfit: 0.03, hazard: 0.02 },
  },
  {
    id: 'C3',
    name: { vi: 'Công ty CP Kết cấu thép Phú An', en: 'Phu An Steel Structures JSC' },
    short: 'Phú An',
    role: 'main',
    siteId: 'S2',
    taxCode: '3702 518 334',
    hseManager: 'U3',
    profile: { checkin: 0.93, onTime: 0.9, ppeIssue: 0.05, unfit: 0.015, hazard: 0.05 },
  },
  {
    id: 'C4',
    name: { vi: 'Công ty TNHH Cơ điện Đông Á', en: 'Dong A M&E Services Co., Ltd.' },
    short: 'Đông Á M&E',
    role: 'sub',
    parentId: 'C3',
    siteId: 'S2',
    taxCode: '3702 904 117',
    hseManager: 'U3',
    profile: { checkin: 0.88, onTime: 0.82, ppeIssue: 0.08, unfit: 0.02, hazard: 0.03 },
  },
  {
    id: 'C5',
    name: { vi: 'Công ty CP Dịch vụ Logistics Long Hậu', en: 'Long Hau Logistics Services JSC' },
    short: 'Long Hậu Logistics',
    role: 'main',
    siteId: 'S3',
    taxCode: '1101 667 052',
    hseManager: 'U4',
    profile: { checkin: 0.95, onTime: 0.92, ppeIssue: 0.04, unfit: 0.01, hazard: 0.06 },
  },
]

export const COMPANY_ROLE = {
  main: { en: 'Main contractor', vi: 'Nhà thầu chính' },
  sub: { en: 'Subcontractor', vi: 'Nhà thầu phụ' },
}

// International clients (fictional) and the contracts that make safety evidence matter.
export const CONTRACTS = [
  {
    id: 'K-2026-014',
    companyId: 'C1',
    client: 'Nordvik Development AS',
    country: { en: 'Norway', vi: 'Na Uy' },
    project: { en: 'Riverside Tower — structure & envelope', vi: 'Tòa Riverside — kết cấu & bao che' },
    valueUsd: 18_400_000,
    requirements: ['IFC PS2', 'ISO 45001', { en: 'Monthly HSE KPI report', vi: 'Báo cáo KPI HSE hằng tháng' }],
  },
  {
    id: 'K-2026-021',
    companyId: 'C2',
    client: 'Sao Viet Construction JSC',
    via: 'Nordvik Development AS',
    country: { en: 'Vietnam (for Norwegian owner)', vi: 'Việt Nam (cho chủ đầu tư Na Uy)' },
    project: { en: 'Riverside Tower — scaffolding & access', vi: 'Tòa Riverside — giàn giáo & lối tiếp cận' },
    valueUsd: 1_250_000,
    requirements: [{ en: 'Main contractor HSE plan', vi: 'Kế hoạch HSE của nhà thầu chính' }, { en: 'Daily PPE check', vi: 'Kiểm tra PPE hằng ngày' }],
  },
  {
    id: 'K-2025-088',
    companyId: 'C3',
    client: 'Kaito Heavy Industries Co.',
    country: { en: 'Japan', vi: 'Nhật Bản' },
    project: { en: 'Steel frames for export plant', vi: 'Khung thép cho nhà máy xuất khẩu' },
    valueUsd: 6_900_000,
    requirements: ['ISO 45001', { en: 'Annual supplier EHS audit', vi: 'Đánh giá EHS nhà cung cấp hằng năm' }],
  },
  {
    id: 'K-2026-007',
    companyId: 'C4',
    client: 'Phu An Steel Structures JSC',
    via: 'Kaito Heavy Industries Co.',
    country: { en: 'Vietnam (for Japanese buyer)', vi: 'Việt Nam (cho bên mua Nhật Bản)' },
    project: { en: 'Plant electrical & welding maintenance', vi: 'Bảo trì điện & hàn nhà máy' },
    valueUsd: 420_000,
    requirements: [{ en: 'Permit-to-work records', vi: 'Hồ sơ giấy phép làm việc' }, { en: 'Daily PPE check', vi: 'Kiểm tra PPE hằng ngày' }],
  },
  {
    id: 'K-2026-033',
    companyId: 'C5',
    client: 'Meridian Retail Group Pte. Ltd.',
    country: { en: 'Singapore', vi: 'Singapore' },
    project: { en: 'Regional distribution & cross-docking', vi: 'Phân phối khu vực & cross-dock' },
    valueUsd: 3_100_000,
    requirements: [{ en: 'Supplier code of conduct audit', vi: 'Đánh giá bộ quy tắc ứng xử nhà cung cấp' }, { en: 'Forklift safety records', vi: 'Hồ sơ an toàn xe nâng' }],
  },
]

export const TRADES = {
  construction: [
    { en: 'Rebar fixer', vi: 'Thợ cốt thép' },
    { en: 'Concrete worker', vi: 'Thợ bê tông' },
    { en: 'Formwork carpenter', vi: 'Thợ cốp pha' },
    { en: 'Crane signaller', vi: 'Xi nhan cẩu' },
  ],
  scaffolding: [
    { en: 'Scaffolder', vi: 'Thợ giàn giáo' },
    { en: 'Rigger', vi: 'Thợ móc cáp' },
  ],
  factory: [
    { en: 'Welder', vi: 'Thợ hàn' },
    { en: 'Cutting operator', vi: 'Vận hành máy cắt' },
    { en: 'Steel fitter', vi: 'Thợ lắp dựng thép' },
  ],
  mne: [
    { en: 'Electrician', vi: 'Thợ điện' },
    { en: 'Maintenance welder', vi: 'Thợ hàn bảo trì' },
  ],
  warehouse: [
    { en: 'Forklift driver', vi: 'Lái xe nâng' },
    { en: 'Picker', vi: 'Nhân viên soạn hàng' },
    { en: 'Loader', vi: 'Bốc xếp' },
  ],
}

export const WORKFORCE = [
  { companyId: 'C1', count: 12, trades: 'construction' },
  { companyId: 'C2', count: 8, trades: 'scaffolding' },
  { companyId: 'C3', count: 10, trades: 'factory' },
  { companyId: 'C4', count: 6, trades: 'mne' },
  { companyId: 'C5', count: 9, trades: 'warehouse' },
]

export const PPE_ITEMS = [
  { key: 'helmet', required: true, label: { en: 'Safety helmet', vi: 'Mũ bảo hộ' } },
  { key: 'vest', required: true, label: { en: 'Hi-vis vest', vi: 'Áo phản quang' } },
  { key: 'boots', required: true, label: { en: 'Safety boots', vi: 'Giày bảo hộ' } },
  { key: 'gloves', required: false, label: { en: 'Gloves', vi: 'Găng tay' } },
]

export const FITNESS_CHECKS = [
  { key: 'rested', label: { en: 'I slept at least 6 hours', vi: 'Tôi đã ngủ ít nhất 6 tiếng' } },
  { key: 'noAlcohol', label: { en: 'No alcohol in the last 12 hours', vi: 'Không uống rượu bia trong 12 giờ qua' } },
  { key: 'healthy', label: { en: 'No illness, injury or dizziness', vi: 'Không ốm, chấn thương hay chóng mặt' } },
]

export const UNFIT_REASONS = {
  fever: { en: 'Fever / illness', vi: 'Sốt / ốm' },
  fatigue: { en: 'Fatigue', vi: 'Mệt mỏi' },
  injury: { en: 'Injury', vi: 'Chấn thương' },
}

export const HAZARD_CATEGORIES = {
  scaffold: { en: 'Unsafe scaffold / edge', vi: 'Giàn giáo / mép sàn không an toàn' },
  electrical: { en: 'Exposed wiring', vi: 'Dây điện hở' },
  housekeeping: { en: 'Blocked exit / slippery floor', vi: 'Lối thoát bị chặn / sàn trơn' },
  equipment: { en: 'Faulty equipment', vi: 'Thiết bị hỏng' },
  other: { en: 'Other', vi: 'Khác' },
}

export const CHECKIN_STATUS = {
  cleared: { en: 'Cleared', vi: 'Đạt' },
  flagged: { en: 'Flagged', vi: 'Cần xem xét' },
  blocked: { en: 'Blocked', vi: 'Không được vào ca' },
  sent_home: { en: 'Sent home', vi: 'Cho về' },
  missing: { en: 'Not checked in', vi: 'Chưa check-in' },
}

export const SHIFT_START = { hour: 7, minute: 0 }

const FAMILY = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương']
const MIDDLE = ['Văn', 'Đức', 'Minh', 'Quốc', 'Thanh', 'Hữu', 'Ngọc', 'Thị']
const GIVEN = ['An', 'Bảo', 'Cường', 'Dũng', 'Hải', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Thắng', 'Tuấn', 'Việt', 'Hà', 'Lan', 'Mai', 'Thảo', 'Trung', 'Lộc', 'Khánh', 'Phúc']

/** Deterministic worker roster (stored in the demo database on first load). */
export function buildWorkers(rand) {
  const workers = []
  let n = 1
  for (const { companyId, count, trades } of WORKFORCE) {
    const company = COMPANIES.find((c) => c.id === companyId)
    for (let i = 0; i < count; i++) {
      const pick = (arr) => arr[Math.floor(rand() * arr.length)]
      workers.push({
        id: `W-${String(n++).padStart(3, '0')}`,
        name: `${pick(FAMILY)} ${pick(MIDDLE)} ${pick(GIVEN)}`,
        companyId,
        siteId: company.siteId,
        trade: TRADES[trades][i % TRADES[trades].length],
        phone: `09${Math.floor(rand() * 9e7 + 1e7)}`,
      })
    }
  }
  return workers
}

export const companyById = (id) => COMPANIES.find((c) => c.id === id)
