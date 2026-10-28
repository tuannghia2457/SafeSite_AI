const LOCALES = { en: 'en-GB', vi: 'vi-VN' }

/** Resolves a bilingual value ({ en, vi }) or passes a plain string through. */
export const bi = (value, lang) => (value == null || typeof value === 'string' ? value ?? '' : value[lang] ?? value.en)

const pad = (n) => String(n).padStart(2, '0')

/** "dd/mm, hh:mm" in both languages (vi-VN's Intl output puts the time first). */
export const fmtDateTime = (ts) => {
  const d = new Date(ts)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const fmtDate = (ts, lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { day: '2-digit', month: '2-digit', year: 'numeric' }).format(ts)

export const fmtTime = (ts, lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(ts)

export const fmtWeekday = (ts, lang) => new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'short' }).format(ts)

export function timeAgo(ts, lang, now = Date.now()) {
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang], { numeric: 'auto' })
  const sec = Math.round((ts - now) / 1000)
  const abs = Math.abs(sec)
  if (abs < 60) return rtf.format(sec, 'second')
  if (abs < 3600) return rtf.format(Math.round(sec / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour')
  return rtf.format(Math.round(sec / 86400), 'day')
}

export const pct = (n) => `${Math.round(n * 100)}%`

export const toDateInput = (ts) => new Date(ts - new Date(ts).getTimezoneOffset() * 60000).toISOString().slice(0, 10)
