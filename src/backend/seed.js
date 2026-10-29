import { COMPANIES, HAZARD_CATEGORIES, UNFIT_REASONS, buildWorkers } from '../data/companies'
import { hashString, mulberry32 } from '../data/mockData'
import { db, dayKey, lastDays, shiftStart } from './db'
import { evaluateCheckin, simulatePpeDetection } from './rules'

const HISTORY_DAYS = 30
const MIN = 60_000

const HAZARD_TEXT = {
  scaffold: { en: 'Missing toe board on level 9 scaffold', vi: 'Thiếu ván chắn chân trên giàn giáo tầng 9' },
  electrical: { en: 'Temporary cable lying in standing water', vi: 'Cáp điện tạm nằm trong vũng nước' },
  housekeeping: { en: 'Pallets blocking the emergency exit', vi: 'Pallet chắn lối thoát hiểm' },
  equipment: { en: 'Grinder guard is cracked', vi: 'Tấm chắn máy mài bị nứt' },
  other: { en: 'Poor lighting in stairwell B', vi: 'Thiếu ánh sáng ở cầu thang B' },
}
const HAZARD_KEYS = Object.keys(HAZARD_CATEGORIES)
const UNFIT_KEYS = Object.keys(UNFIT_REASONS)

/** Generates check-ins (and hazards) for the given days. Deterministic per worker + day. */
function generateDays(days, workers, now) {
  const today = dayKey(now)
  const checkins = []
  const hazards = []

  for (const key of days) {
    const isToday = key === today
    if (new Date(`${key}T12:00:00`).getDay() === 0 && !isToday) continue // Sundays off

    for (const w of workers) {
      const p = COMPANIES.find((c) => c.id === w.companyId).profile
      const rand = mulberry32(hashString(`${w.id}|${key}`))
      // Today: hold some workers back so the attendance board has people still to check in.
      if (rand() > p.checkin * (isToday ? 0.88 : 1)) continue

      const onTime = rand() < p.onTime
      const submittedAt = shiftStart(key) + (onTime ? -(2 + rand() * 73) : 1 + rand() * 34) * MIN
      if (submittedAt > now) continue

      const ppe = { helmet: true, vest: true, boots: true, gloves: true }
      if (rand() < p.ppeIssue) {
        const r = rand()
        ppe[r < 0.5 ? 'gloves' : r < 0.75 ? 'vest' : r < 0.9 ? 'helmet' : 'boots'] = false
      }
      const unfit = rand() < p.unfit
      const fitness = unfit
        ? { fit: false, rested: rand() > 0.5, noAlcohol: true, healthy: false, reason: UNFIT_KEYS[Math.floor(rand() * UNFIT_KEYS.length)] }
        : { fit: true, rested: true, noAlcohol: true, healthy: true }
      const force = rand() < p.ppeIssue / 3 ? (rand() < 0.5 ? 'no_helmet' : 'no_vest') : 'auto'
      const ai = simulatePpeDetection(ppe, { force, rand })
      const { status, reasons } = evaluateCheckin({ ppe, fitness, ai })

      const record = {
        id: `CHK-${key.replaceAll('-', '')}-${w.id}`,
        date: key,
        workerId: w.id,
        companyId: w.companyId,
        siteId: w.siteId,
        submittedAt: Math.round(submittedAt),
        onTime,
        ppe,
        fitness,
        ai,
        photoId: null,
        status,
        initialStatus: status,
        reasons,
        hazardId: null,
        review: null,
        source: 'seed',
      }

      // Past issues were reviewed by a supervisor; today's stay pending for the demo.
      if (status !== 'cleared' && !isToday) {
        const sendHome = !fitness.fit || rand() < 0.15
        record.status = sendHome ? 'sent_home' : 'cleared'
        record.review = { outcome: sendHome ? 'sent_home' : 'corrected', at: record.submittedAt + 12 * MIN, by: 'U1' }
      }

      if (rand() < p.hazard) {
        const category = HAZARD_KEYS[Math.floor(rand() * HAZARD_KEYS.length)]
        const resolved = !isToday && rand() < 0.8
        const hazard = {
          id: `HZ-${key.replaceAll('-', '')}-${w.id}`,
          checkinId: record.id,
          workerId: w.id,
          companyId: w.companyId,
          siteId: w.siteId,
          category,
          text: HAZARD_TEXT[category],
          createdAt: record.submittedAt,
          status: resolved ? 'resolved' : 'open',
          resolvedAt: resolved ? record.submittedAt + (4 + rand() * 40) * 3600_000 : null,
        }
        record.hazardId = hazard.id
        hazards.push(hazard)
      }
      checkins.push(record)
    }
  }
  return { checkins, hazards }
}

/** Seeds an empty database, or tops up simulated history for days since the last visit. */
export async function ensureSeeded(now = Date.now()) {
  const meta = await db.meta.get('seededThrough')
  const today = dayKey(now)
  if (meta?.value === today) return

  if (!meta) {
    const workers = buildWorkers(mulberry32(42))
    const { checkins, hazards } = generateDays(lastDays(HISTORY_DAYS, now), workers, now)
    await db.transaction('rw', db.tables, async () => {
      await db.companies.bulkPut(COMPANIES.map(({ profile, ...c }) => c))
      await db.workers.bulkPut(workers)
      await db.checkins.bulkPut(checkins)
      await db.hazards.bulkPut(hazards)
      await db.meta.put({ key: 'seededThrough', value: today })
      await db.meta.put({ key: 'createdAt', value: now })
      await db.apiLog.add({
        at: now,
        method: 'POST',
        path: '/api/admin/seed',
        status: 201,
        ms: 0,
        request: { days: HISTORY_DAYS },
        response: { companies: COMPANIES.length, workers: workers.length, checkins: checkins.length, hazards: hazards.length },
      })
    })
    return
  }

  // Returning visitor: simulate the days that passed so "today" is never empty.
  const workers = await db.workers.toArray()
  const missing = lastDays(HISTORY_DAYS, now).filter((k) => k > meta.value)
  const { checkins, hazards } = generateDays(missing, workers, now)
  await db.transaction('rw', db.checkins, db.hazards, db.meta, async () => {
    // Never overwrite real submissions made in the demo.
    const existing = new Set((await db.checkins.where('date').anyOf(missing).toArray()).map((c) => c.workerId + c.date))
    await db.checkins.bulkPut(checkins.filter((c) => !existing.has(c.workerId + c.date)))
    await db.hazards.bulkPut(hazards)
    await db.meta.put({ key: 'seededThrough', value: today })
  })
}

export async function resetDatabase() {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
  })
  await ensureSeeded()
}
