import { CAMERAS, SITES, VIOLATION_TYPES } from '../data/mockData'

const DAY = 86400_000

export const isOpen = (incident) => incident.status !== 'resolved'

export const forSite = (list, siteId) => (siteId === 'all' ? list : list.filter((x) => x.siteId === siteId))

export function camerasOnline(siteId = 'all') {
  const cams = forSite(CAMERAS, siteId)
  return { online: cams.filter((c) => c.status === 'online').length, total: cams.length }
}

/** Demo heuristic: 100 minus weighted penalties for unresolved risk. */
export function safetyScore(siteId, alerts, incidents, now = Date.now()) {
  let score = 100
  forSite(incidents, siteId)
    .filter(isOpen)
    .forEach((i) => (score -= i.severity === 'high' ? 7 : 4))
  forSite(alerts, siteId).forEach((a) => {
    if (a.status === 'new') score -= 3
    else if (a.status === 'confirmed' && now - a.timestamp < 7 * DAY) score -= 1
  })
  const sites = siteId === 'all' ? SITES.length : 1
  return Math.max(35, Math.min(100, Math.round(100 - (100 - score) / sites)))
}

/** Confirmed + pending alerts per day for the last `days` days, split by violation type. */
export function violationsByDay(alerts, days = 7, now = Date.now()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const buckets = Array.from({ length: days }, (_, i) => {
    const day = start.getTime() - (days - 1 - i) * DAY
    return { day, counts: Object.fromEntries(VIOLATION_TYPES.map((t) => [t, 0])), total: 0 }
  })
  alerts
    .filter((a) => a.status !== 'dismissed')
    .forEach((a) => {
      const b = buckets.find((x) => a.timestamp >= x.day && a.timestamp < x.day + DAY)
      if (b) {
        b.counts[a.type]++
        b.total++
      }
    })
  return buckets
}

export function actionProgress(incidents) {
  const actions = incidents.flatMap((i) => i.actions)
  return { done: actions.filter((a) => a.done).length, total: actions.length }
}
