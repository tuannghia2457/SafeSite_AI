// Building blocks for the bilingual (Vietnamese first, English second) printable reports.

/** Vietnamese label on top, English below. `v` is a { vi, en } object. */
export function Bi({ v, className = '', sub = 'text-fog print:text-gray-500' }) {
  return (
    <span className={className}>
      {v.vi}
      <span className={`block text-[0.85em] font-normal ${sub}`}>{v.en}</span>
    </span>
  )
}

export function SectionTitle({ n, v }) {
  return (
    <h3 className="mb-4 flex items-baseline gap-3 border-b border-edge pb-2 print:border-gray-300">
      <span className="font-mono text-xs text-fog print:text-gray-500">{String(n).padStart(2, '0')}</span>
      <span className="font-medium text-ice print:text-black">
        {v.vi} <span className="font-normal text-fog print:text-gray-500">/ {v.en}</span>
      </span>
    </h3>
  )
}

/** Downloads rows as a UTF-8 CSV (with BOM so Excel shows Vietnamese correctly). */
export function downloadCsv(filename, header, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking immediately can cancel the download in Chromium; give it a moment.
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
