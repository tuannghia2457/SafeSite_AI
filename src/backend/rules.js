import { PPE_ITEMS } from '../data/companies'

// Rules engine for a pre-shift check-in. Pure function, so it is shared by the API and the seeder.
//   blocked → worker may not start the shift until a supervisor reviews (unfit or required PPE missing)
//   flagged → may start, but a supervisor must confirm (AI disagrees with the worker's declaration)
//   cleared → ready for work
export function evaluateCheckin({ ppe, fitness, ai }) {
  const reasons = []
  if (!fitness.fit) reasons.push({ code: 'unfit', level: 'blocked' })
  PPE_ITEMS.filter((p) => p.required && !ppe[p.key]).forEach((p) => reasons.push({ code: `missing_${p.key}`, level: 'blocked' }))
  if (ppe.helmet && ai && !ai.helmet) reasons.push({ code: 'ai_helmet', level: 'flagged' })
  if (ppe.vest && ai && !ai.vest) reasons.push({ code: 'ai_vest', level: 'flagged' })
  if (!ppe.gloves) reasons.push({ code: 'no_gloves', level: 'note' })

  const status = reasons.some((r) => r.level === 'blocked')
    ? 'blocked'
    : reasons.some((r) => r.level === 'flagged')
      ? 'flagged'
      : 'cleared'
  return { status, reasons }
}

/** Simulated PPE detector on the check-in photo. `force` lets the presenter demo a miss. */
export function simulatePpeDetection(ppe, { force = 'auto', rand = Math.random } = {}) {
  return {
    model: 'ppe-detector (simulated)',
    helmet: force === 'no_helmet' ? false : !!ppe.helmet,
    vest: force === 'no_vest' ? false : !!ppe.vest,
    confidence: Math.round((0.86 + rand() * 0.12) * 100) / 100,
  }
}
