import { db, dayKey } from './db'
import { evaluateCheckin, simulatePpeDetection } from './rules'
import { buildCompanyReport } from './report'
import { resetDatabase } from './seed'

// Mock REST API. Every call goes through `request()`, which runs a handler, simulates network/processing
// time and writes the call to the `apiLog` table, so the Backend & data page can show how the server
// would handle each request. Swap `request()` for `fetch()` when a real backend exists.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (base) => Math.round(base * (0.7 + Math.random() * 0.6))

class HttpError extends Error {
  constructor(status, code) {
    super(code)
    this.status = status
  }
}

/** Replaces bulky values (photos) with a short description before logging. */
function redact(value) {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.length > 8 ? `[${value.length} rows]` : value.map(redact)
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      if (typeof v === 'string' && v.startsWith('data:image')) return [k, `<${v.slice(5, v.indexOf(';'))}, ${Math.round((v.length * 3) / 4 / 1024)} KB>`]
      return [k, redact(v)]
    }),
  )
}

// ------------------------------------------------------------------ handlers

async function postCheckin(body) {
  const steps = []
  const step = async (key, base, fn) => {
    const ms = jitter(base)
    await sleep(ms)
    const data = await fn()
    steps.push({ key, ms, data })
    return data
  }

  const now = Date.now()
  const date = dayKey(now)

  const worker = await step('validate', 60, async () => {
    const w = await db.workers.get(body?.workerId)
    if (!w) throw new HttpError(400, 'unknown_worker')
    if (w.companyId !== body.companyId) throw new HttpError(403, 'wrong_company')
    if (!body.ppe || !body.fitness) throw new HttpError(422, 'incomplete_form')
    const existing = await db.checkins.where('[workerId+date]').equals([w.id, date]).first()
    if (existing) throw new HttpError(409, 'already_checked_in')
    return { workerId: w.id, companyId: w.companyId, date }
  }).then(async () => db.workers.get(body.workerId))

  const photoId = await step('photo', 140, async () => {
    if (!body.photo) return null
    const id = `PH-${now}-${worker.id}`
    await db.photos.put({ id, dataUrl: body.photo, takenAt: now, bytes: Math.round((body.photo.length * 3) / 4) })
    return id
  })

  const ai = await step('ai', 420, async () => simulatePpeDetection(body.ppe, { force: body.aiForce }))
  const verdict = await step('rules', 50, async () => evaluateCheckin({ ppe: body.ppe, fitness: body.fitness, ai }))

  const shift = new Date(`${date}T07:00:00`).getTime()
  const record = {
    id: `CHK-${date.replaceAll('-', '')}-${worker.id}`,
    date,
    workerId: worker.id,
    companyId: worker.companyId,
    siteId: worker.siteId,
    submittedAt: now,
    onTime: now <= shift,
    ppe: body.ppe,
    fitness: body.fitness,
    ai,
    photoId,
    status: verdict.status,
    initialStatus: verdict.status,
    reasons: verdict.reasons,
    hazardId: null,
    review: null,
    source: 'app',
  }

  await step('save', 90, async () => {
    let hazard = null
    if (body.hazard?.category) {
      hazard = {
        id: `HZ-${now}-${worker.id}`,
        checkinId: record.id,
        workerId: worker.id,
        companyId: worker.companyId,
        siteId: worker.siteId,
        category: body.hazard.category,
        text: body.hazard.text || '',
        location: body.hazard.location || '',
        createdAt: now,
        status: 'open',
        resolvedAt: null,
      }
      record.hazardId = hazard.id
    }
    await db.transaction('rw', db.checkins, db.hazards, async () => {
      await db.checkins.add(record)
      if (hazard) await db.hazards.add(hazard)
    })
    return { table: 'checkins', id: record.id, hazardId: record.hazardId }
  })

  await step('notify', 70, async () => ({
    supervisor: record.status !== 'cleared',
    hse: !!record.hazardId,
  }))

  return { status: 201, body: { checkin: record }, steps }
}

async function patchCheckin(body, { id }) {
  const c = await db.checkins.get(id)
  if (!c) throw new HttpError(404, 'not_found')
  if (!['corrected', 'sent_home', 'cleared'].includes(body?.decision)) throw new HttpError(422, 'invalid_decision')
  // A fitness problem cannot be "corrected" on the spot: an unfit worker can only be sent home.
  if (!c.fitness.fit && body.decision !== 'sent_home') throw new HttpError(409, 'unfit_worker_cannot_be_cleared')
  const review = { outcome: body.decision, at: Date.now(), by: body.by ?? 'U1' }
  const status = body.decision === 'sent_home' ? 'sent_home' : 'cleared'
  await db.checkins.update(id, { status, review })
  return { status: 200, body: { id, status, review } }
}

async function patchHazard(body, { id }) {
  const h = await db.hazards.get(id)
  if (!h) throw new HttpError(404, 'not_found')
  const resolved = body?.status === 'resolved'
  await db.hazards.update(id, { status: resolved ? 'resolved' : 'open', resolvedAt: resolved ? Date.now() : null })
  return { status: 200, body: { id, status: resolved ? 'resolved' : 'open' } }
}

async function getCompanyReport(_body, { id }, query, ctx) {
  const report = await buildCompanyReport(id, Number(query.get('days')) || 30, { incidents: ctx.incidents })
  if (!report) throw new HttpError(404, 'not_found')
  return { status: 200, body: report }
}

async function postReset() {
  await resetDatabase()
  return { status: 200, body: { ok: true } }
}

const ROUTES = [
  ['POST', /^\/api\/checkins$/, postCheckin],
  ['PATCH', /^\/api\/checkins\/(?<id>[^/]+)$/, patchCheckin],
  ['PATCH', /^\/api\/hazards\/(?<id>[^/]+)$/, patchHazard],
  ['GET', /^\/api\/companies\/(?<id>[^/]+)\/report$/, getCompanyReport],
  ['POST', /^\/api\/admin\/reset$/, postReset],
]

/** Mock HTTP entry point: `await request('POST', '/api/checkins', body)`. */
export async function request(method, url, body = null, ctx = {}) {
  const started = performance.now()
  const at = Date.now()
  const [path, qs = ''] = url.split('?')
  const query = new URLSearchParams(qs)
  let res
  try {
    const route = ROUTES.find(([m, re]) => m === method && re.test(path))
    if (!route) throw new HttpError(404, 'no_route')
    const params = path.match(route[1]).groups ?? {}
    if (method === 'GET') await sleep(jitter(120))
    res = await route[2](body, params, query, ctx)
  } catch (err) {
    res = { status: err.status ?? 500, body: { error: err.message } }
  }
  const ms = Math.round(performance.now() - started)

  const logBody =
    method === 'GET' && res.status === 200
      ? { summary: res.body.summary, rows: { daily: res.body.daily?.length, checkins: res.body.checkins?.length } }
      : redact(res.body)
  if (method !== 'POST' || path !== '/api/admin/reset') {
    await db.apiLog.add({ at, method, path: url, status: res.status, ms, request: redact(body), response: logBody, steps: res.steps })
  }
  return { ...res, ms }
}
