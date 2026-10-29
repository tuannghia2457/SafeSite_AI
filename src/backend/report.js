import { CONTRACTS, PPE_ITEMS, companyById } from '../data/companies'
import { CAMERAS, byId } from '../data/mockData'
import { db, dayKey, lastDays } from './db'

const ratio = (a, b) => (b ? a / b : null)

/**
 * Builds a contractor safety-performance report from the database.
 * `incidents` come from the demo store (camera incidents are attributed to a company by work zone).
 */
export async function buildCompanyReport(companyId, days, { incidents = [], now = Date.now() } = {}) {
  const company = companyById(companyId)
  if (!company) return null
  const keys = lastDays(days, now)
  const from = keys[0]
  const to = keys[keys.length - 1]
  const fromTs = new Date(`${from}T00:00:00`).getTime()

  const [workers, checkins, hazards] = await Promise.all([
    db.workers.where('companyId').equals(companyId).toArray(),
    db.checkins.where('[companyId+date]').between([companyId, from], [companyId, to], true, true).toArray(),
    db.hazards.where('companyId').equals(companyId).filter((h) => h.createdAt >= fromTs).toArray(),
  ])

  const byDay = new Map(keys.map((k) => [k, []]))
  checkins.forEach((c) => byDay.get(c.date)?.push(c))

  const today = dayKey(now)
  const daily = keys
    .filter((k) => byDay.get(k).length > 0 || (new Date(`${k}T12:00:00`).getDay() !== 0 && k !== today))
    .map((k) => {
      const list = byDay.get(k)
      return {
        date: k,
        expected: workers.length,
        checkedIn: list.length,
        onTime: list.filter((c) => c.onTime).length,
        firstTimeClear: list.filter((c) => c.initialStatus === 'cleared').length,
        flagged: list.filter((c) => c.initialStatus === 'flagged').length,
        blocked: list.filter((c) => c.initialStatus === 'blocked').length,
        sentHome: list.filter((c) => c.status === 'sent_home').length,
        pending: list.filter((c) => c.status === 'blocked' || c.status === 'flagged').length,
      }
    })

  const sum = (key) => daily.reduce((n, d) => n + d[key], 0)
  const expected = sum('expected')
  const checkedIn = sum('checkedIn')

  const ppeMissing = Object.fromEntries(PPE_ITEMS.map((p) => [p.key, checkins.filter((c) => !c.ppe[p.key]).length]))
  const aiVerified = checkins.filter((c) => c.ai?.helmet && c.ai?.vest).length
  const unfit = checkins.filter((c) => !c.fitness.fit).length

  const companyIncidents = incidents
    .filter((i) => byId(CAMERAS, i.cameraId)?.companyId === companyId && i.createdAt >= fromTs)
    .sort((a, b) => a.createdAt - b.createdAt)
  const actions = companyIncidents.flatMap((i) => i.actions)
  const highRisk = companyIncidents.filter((i) => i.severity === 'high')
  const verifiedClosed = highRisk.filter(
    (i) => i.status === 'resolved' && i.actions.length > 0 && i.actions.every((a) => a.done) && i.resolvedAt <= i.dueDate,
  )

  return {
    company,
    contracts: CONTRACTS.filter((k) => k.companyId === companyId),
    period: { from, to, days },
    generatedAt: now,
    workforce: workers.length,
    workdays: daily.length,
    summary: {
      expected,
      checkedIn,
      checkinRate: ratio(checkedIn, expected),
      onTimeRate: ratio(sum('onTime'), checkedIn),
      firstTimeClearRate: ratio(sum('firstTimeClear'), checkedIn),
      aiVerifiedRate: ratio(aiVerified, checkedIn),
      blocked: sum('blocked'),
      flagged: sum('flagged'),
      sentHome: sum('sentHome'),
      unfit,
      hazards: hazards.length,
      hazardsResolved: hazards.filter((h) => h.status === 'resolved').length,
      incidents: companyIncidents.length,
      incidentsResolved: companyIncidents.filter((i) => i.status === 'resolved').length,
      actionsDone: actions.filter((a) => a.done).length,
      actionsTotal: actions.length,
      verifiedClosureRate: ratio(verifiedClosed.length, highRisk.length),
    },
    ppeMissing,
    daily,
    hazards: hazards.sort((a, b) => b.createdAt - a.createdAt),
    incidents: companyIncidents,
    checkins,
    workers,
  }
}
