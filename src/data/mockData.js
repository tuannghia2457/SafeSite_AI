// Simulated data for the SafeSite AI prototype. No real camera or CV model is involved:
// "detections" are generated scenes that mimic what a YOLO-style detector would output.

export const VIOLATIONS = {
  no_helmet: {
    severity: 'high',
    label: { en: 'Missing safety helmet', vi: 'Không đội mũ bảo hộ' },
    tag: 'NO HELMET',
    action: {
      en: 'Stop work, issue a helmet and re-brief the worker on PPE rules',
      vi: 'Tạm dừng công việc, cấp mũ bảo hộ và nhắc lại quy định PPE cho công nhân',
    },
  },
  no_vest: {
    severity: 'medium',
    label: { en: 'Missing safety vest', vi: 'Không mặc áo phản quang' },
    tag: 'NO VEST',
    action: {
      en: 'Issue a high-visibility vest and check PPE stock at the entrance',
      vi: 'Cấp áo phản quang và kiểm tra tồn kho PPE tại cổng ra vào',
    },
  },
  restricted_zone: {
    severity: 'high',
    label: { en: 'Restricted zone entry', vi: 'Xâm nhập khu vực hạn chế' },
    tag: 'RESTRICTED',
    action: {
      en: 'Reinforce zone barriers and signage; review access permits',
      vi: 'Gia cố rào chắn và biển báo khu vực; rà soát giấy phép ra vào',
    },
  },
}

export const VIOLATION_TYPES = Object.keys(VIOLATIONS)

export const SEVERITY = {
  high: { en: 'High', vi: 'Cao' },
  medium: { en: 'Medium', vi: 'Trung bình' },
  low: { en: 'Low', vi: 'Thấp' },
}

export const INCIDENT_STATUS = {
  open: { en: 'Open', vi: 'Mới mở' },
  in_progress: { en: 'In progress', vi: 'Đang xử lý' },
  resolved: { en: 'Resolved', vi: 'Đã khắc phục' },
}

export const USERS = [
  { id: 'U1', name: 'Nguyễn Văn An', role: { en: 'Safety Officer', vi: 'Cán bộ an toàn' } },
  { id: 'U2', name: 'Trần Thị Bình', role: { en: 'Site Manager', vi: 'Chỉ huy trưởng công trường' } },
  { id: 'U3', name: 'Lê Minh Cường', role: { en: 'HSE Supervisor', vi: 'Giám sát HSE' } },
  { id: 'U4', name: 'Phạm Thu Hà', role: { en: 'Warehouse Lead', vi: 'Trưởng kho' } },
  { id: 'U5', name: 'Đỗ Quang Huy', role: { en: 'Foreman', vi: 'Tổ trưởng thi công' } },
]
export const CURRENT_USER = 'U1'

export const SITES = [
  {
    id: 'S1',
    name: { en: 'Thu Duc Riverside Tower', vi: 'Tòa nhà Thủ Đức Riverside' },
    type: 'construction',
    location: 'Thủ Đức, TP. Hồ Chí Minh',
    manager: 'U2',
    workers: 186,
  },
  {
    id: 'S2',
    name: { en: 'Binh Duong Steel Fabrication Plant', vi: 'Nhà máy Gia công Thép Bình Dương' },
    type: 'factory',
    location: 'KCN VSIP I, Bình Dương',
    manager: 'U3',
    workers: 240,
  },
  {
    id: 'S3',
    name: { en: 'Long Hau Logistics Warehouse', vi: 'Kho Logistics Long Hậu' },
    type: 'warehouse',
    location: 'KCN Long Hậu, Long An',
    manager: 'U4',
    workers: 72,
  },
]

// Scene coordinates use a 320 x 180 viewBox. `zone` is a restricted area on the floor.
// `companyId` is the contractor responsible for the camera's work area: incidents are attributed by zone, never by face.
export const CAMERAS = [
  { id: 'CAM-01', companyId: 'C1', siteId: 'S1', scene: 'construction', status: 'online', name: { en: 'Tower crane base', vi: 'Chân cẩu tháp' }, zone: { x: 196, y: 118, w: 108, h: 52 } },
  { id: 'CAM-02', companyId: 'C2', siteId: 'S1', scene: 'construction', status: 'online', name: { en: 'Level 12 slab', vi: 'Sàn tầng 12' }, zone: null },
  { id: 'CAM-03', companyId: 'C1', siteId: 'S1', scene: 'construction', status: 'offline', name: { en: 'Main gate', vi: 'Cổng chính' }, zone: null },
  { id: 'CAM-04', companyId: 'C3', siteId: 'S2', scene: 'factory', status: 'online', name: { en: 'Cutting line A', vi: 'Dây chuyền cắt A' }, zone: { x: 18, y: 116, w: 110, h: 54 } },
  { id: 'CAM-05', companyId: 'C4', siteId: 'S2', scene: 'factory', status: 'online', name: { en: 'Welding bay', vi: 'Khu hàn' }, zone: null },
  { id: 'CAM-06', companyId: 'C5', siteId: 'S3', scene: 'warehouse', status: 'online', name: { en: 'Loading dock', vi: 'Bến xếp dỡ' }, zone: { x: 170, y: 120, w: 130, h: 50 } },
  { id: 'CAM-07', companyId: 'C5', siteId: 'S3', scene: 'warehouse', status: 'online', name: { en: 'Racking aisle 3', vi: 'Lối kệ hàng số 3' }, zone: null },
]

export const byId = (list, id) => list.find((x) => x.id === id)

// ---------------------------------------------------------------- randomness

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const hashString = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)

// ---------------------------------------------------------------- scenes

export const inZone = (w, zone) =>
  !!zone && w.x >= zone.x && w.x <= zone.x + zone.w && w.y >= zone.y && w.y <= zone.y + zone.h

export function violationsOf(worker, zone) {
  const v = []
  if (!worker.helmet) v.push('no_helmet')
  if (!worker.vest) v.push('no_vest')
  if (inZone(worker, zone)) v.push('restricted_zone')
  return v
}

function placeOutsideZone(rand, zone) {
  let x, y
  do {
    x = 24 + rand() * 272
    y = 116 + rand() * 52
  } while (inZone({ x, y }, zone))
  return { x, y }
}

/** Builds a frozen evidence frame where worker 0 commits the given violation. */
export function buildSnapshot(rand, camera, type) {
  const count = 2 + Math.floor(rand() * 3)
  const workers = Array.from({ length: count }, (_, i) => ({
    id: i,
    ...placeOutsideZone(rand, camera.zone),
    helmet: true,
    vest: true,
  }))
  const target = workers[0]
  if (type === 'no_helmet') target.helmet = false
  if (type === 'no_vest') target.vest = false
  if (type === 'restricted_zone' && camera.zone) {
    const z = camera.zone
    target.x = z.x + 14 + rand() * (z.w - 28)
    target.y = z.y + z.h * 0.45 + rand() * z.h * 0.45
  }
  return { workers, targetId: target.id }
}

/** Initial live scene for a camera feed (mostly compliant workers). */
export function buildLiveWorkers(camera) {
  const rand = mulberry32(hashString(camera.id))
  const count = 3 + Math.floor(rand() * 2)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    ...placeOutsideZone(rand, camera.zone),
    vx: (rand() - 0.5) * 6,
    vy: (rand() - 0.5) * 1.5,
    helmet: !(i === 1 && rand() < 0.35),
    vest: !(i === 2 && rand() < 0.35),
  }))
}

function pickType(rand, camera) {
  const types = camera.zone ? VIOLATION_TYPES : VIOLATION_TYPES.filter((t) => t !== 'restricted_zone')
  return types[Math.floor(rand() * types.length)]
}

export function createAlert({ id, camera, type, timestamp, rand = Math.random }) {
  const t = type ?? pickType(rand, camera)
  return {
    id,
    type: t,
    cameraId: camera.id,
    siteId: camera.siteId,
    timestamp,
    confidence: Math.round((0.78 + rand() * 0.2) * 100) / 100,
    status: 'new',
    incidentId: null,
    snapshot: buildSnapshot(rand, camera, t),
  }
}

// ---------------------------------------------------------------- seed state

const HOUR = 3600_000
const DAY = 24 * HOUR

export function buildInitialState(now = Date.now()) {
  const rand = mulberry32(20261028)
  const online = CAMERAS.filter((c) => c.status === 'online')
  const alerts = []
  let alertSeq = 1001

  // ~26 alerts spread over the last 7 days, newest last
  for (let i = 0; i < 26; i++) {
    const camera = online[(i * 5) % online.length] // spread evenly across sites
    const ageHours = i < 22 ? 168 - i * 7.4 - rand() * 4 : 5 - (i - 22) * 1.2
    alerts.push(
      createAlert({ id: `ALT-${alertSeq++}`, camera, timestamp: Math.round(now - ageHours * HOUR), rand }),
    )
  }

  // Older alerts were already triaged; the most recent ones wait for review.
  const incidents = []
  let incidentSeq = 1
  const plan = [
    // [alert index, status, actions done flags]
    [2, 'resolved', [true, true]],
    [5, 'resolved', [true]],
    [8, 'resolved', [true, true]],
    [11, 'in_progress', [true, false]],
    [14, 'resolved', [true]],
    [16, 'in_progress', [false]],
    [19, 'open', [false]],
    [21, 'open', [false]],
  ]
  const planned = new Map(plan.map((p) => [p[0], p]))
  alerts.forEach((a, i) => {
    if (i >= 22) return // newest stay "new"
    if (!planned.has(i)) {
      a.status = 'dismissed'
      a.reviewedBy = CURRENT_USER
      a.reviewedAt = a.timestamp + 0.4 * HOUR
      return
    }
    const [, status, done] = planned.get(i)
    const camera = byId(CAMERAS, a.cameraId)
    const site = byId(SITES, a.siteId)
    const id = `INC-2026-${String(incidentSeq++).padStart(3, '0')}`
    const createdAt = a.timestamp + 0.5 * HOUR
    const assignee = site.manager
    const actions = done.map((isDone, k) => ({
      id: `${id}-A${k + 1}`,
      text:
        k === 0
          ? VIOLATIONS[a.type].action
          : { en: 'Hold a toolbox talk with the whole crew', vi: 'Tổ chức họp an toàn đầu ca cho toàn đội' },
      assignee: k === 0 ? assignee : 'U5',
      due: createdAt + (k + 1) * DAY,
      done: isDone,
      doneAt: isDone ? createdAt + (k + 0.6) * DAY : null,
    }))
    const timeline = [
      { at: a.timestamp, by: 'AI', event: 'detected' },
      { at: createdAt, by: CURRENT_USER, event: 'created' },
    ]
    if (status !== 'open') timeline.push({ at: createdAt + 3 * HOUR, by: assignee, event: 'started' })
    if (status === 'resolved') timeline.push({ at: createdAt + 1.5 * DAY, by: CURRENT_USER, event: 'resolved' })

    a.status = 'confirmed'
    a.reviewedBy = CURRENT_USER
    a.reviewedAt = createdAt
    a.incidentId = id
    incidents.push({
      id,
      alertId: a.id,
      type: a.type,
      siteId: a.siteId,
      cameraId: camera.id,
      severity: VIOLATIONS[a.type].severity,
      status,
      assignee,
      dueDate: createdAt + 2 * DAY,
      notes: '',
      createdAt,
      resolvedAt: status === 'resolved' ? createdAt + 1.5 * DAY : null,
      actions,
      timeline,
    })
  })

  return {
    alerts,
    incidents,
    seq: { alert: alertSeq, incident: incidentSeq },
  }
}
