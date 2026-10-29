import Dexie from 'dexie'

// The demo "database". In production this would be PostgreSQL + object storage behind a real API;
// here it is IndexedDB (via Dexie) so the static demo can show real tables, indexes and persistence.
export const db = new Dexie('safesite-demo')

db.version(1).stores({
  companies: 'id, siteId, role',
  workers: 'id, companyId, siteId',
  checkins: 'id, date, workerId, companyId, siteId, status, [workerId+date], [companyId+date]',
  photos: 'id',
  hazards: 'id, companyId, siteId, status, createdAt',
  apiLog: '++seq, at, path',
  meta: 'key',
})

/** Short description of each table, shown on the Backend & data page. */
export const TABLE_INFO = {
  companies: { en: 'Contractor companies (tenants)', vi: 'Doanh nghiệp nhà thầu (khách hàng)' },
  workers: { en: 'Employees of each contractor', vi: 'Người lao động của từng nhà thầu' },
  checkins: { en: 'Daily pre-shift check-ins (one per worker per day)', vi: 'Check-in trước ca hằng ngày (mỗi người một lần/ngày)' },
  photos: { en: 'Check-in photos (object storage)', vi: 'Ảnh check-in (lưu trữ đối tượng)' },
  hazards: { en: 'Hazards reported by workers', vi: 'Mối nguy do công nhân báo cáo' },
  apiLog: { en: 'Request log of the mock API', vi: 'Nhật ký yêu cầu của API mô phỏng' },
  meta: { en: 'Seed and sync metadata', vi: 'Siêu dữ liệu khởi tạo và đồng bộ' },
}

const pad = (n) => String(n).padStart(2, '0')

/** Local calendar day key, e.g. "2026-10-28". */
export const dayKey = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const dayStart = (key) => new Date(`${key}T00:00:00`).getTime()

/** Timestamp of the shift start (07:00) on a given day key. */
export const shiftStart = (key) => new Date(`${key}T07:00:00`).getTime()

/** Day keys from `days - 1` days ago up to and including `now`'s day. */
export function lastDays(days, now = Date.now()) {
  const out = []
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) out.push(dayKey(d.getTime() - i * 86400_000))
  return out
}
