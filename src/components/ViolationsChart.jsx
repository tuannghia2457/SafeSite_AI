import { useState } from 'react'
import { VIOLATIONS, VIOLATION_TYPES } from '../data/mockData'
import { fmtWeekday } from '../lib/format'
import { useDemo } from '../state/DemoStore'

// Fixed categorical order (validated for dark surfaces, CVD-safe): color follows the violation type.
export const SERIES_COLOR = {
  no_helmet: 'var(--color-series-1)',
  no_vest: 'var(--color-series-2)',
  restricted_zone: 'var(--color-series-3)',
}

const HEIGHT = 180

/** Stacked daily bar chart of non-dismissed detections, with hover tooltip and table view. */
export default function ViolationsChart({ data }) {
  const { lang, t } = useDemo()
  const [hover, setHover] = useState(null)
  const [asTable, setAsTable] = useState(false)
  const max = Math.max(4, Math.ceil(Math.max(...data.map((d) => d.total)) / 2) * 2)
  const ticks = [0, max / 2, max]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-4 text-xs text-mist">
          {VIOLATION_TYPES.map((type) => (
            <li key={type} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: SERIES_COLOR[type] }} aria-hidden />
              {VIOLATIONS[type].label[lang]}
            </li>
          ))}
        </ul>
        <button className="text-xs font-medium text-fog hover:text-frost" onClick={() => setAsTable((v) => !v)}>
          {asTable ? t('chart.showChart') : t('chart.showTable')}
        </button>
      </div>

      {asTable ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-fog">
              <th className="py-2 font-medium">{t('chart.day')}</th>
              {VIOLATION_TYPES.map((type) => (
                <th key={type} className="py-2 text-right font-medium">{VIOLATIONS[type].label[lang]}</th>
              ))}
              <th className="py-2 text-right font-medium">{t('chart.total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {data.map((d) => (
              <tr key={d.day} className="text-frost tabular-nums">
                <td className="py-2">{fmtWeekday(d.day, lang)}</td>
                {VIOLATION_TYPES.map((type) => (
                  <td key={type} className="py-2 text-right">{d.counts[type]}</td>
                ))}
                <td className="py-2 text-right font-medium">{d.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex gap-3">
          {/* y axis */}
          <div className="relative w-5 text-right text-[11px] text-fog tabular-nums" style={{ height: HEIGHT }}>
            {ticks.map((v) => (
              <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: HEIGHT - (v / max) * HEIGHT }}>
                {v}
              </span>
            ))}
          </div>
          <div className="flex-1">
            <div className="relative" style={{ height: HEIGHT }}>
              {ticks.map((v) => (
                <span key={v} className="absolute inset-x-0 h-px bg-edge/60" style={{ top: HEIGHT - (v / max) * HEIGHT }} aria-hidden />
              ))}
              <div className="absolute inset-0 flex items-end justify-around gap-2">
                {data.map((d, i) => (
                  <div
                    key={d.day}
                    className="relative flex h-full w-full max-w-10 cursor-default flex-col justify-end"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div className={`flex flex-col-reverse gap-[2px] transition-opacity ${hover != null && hover !== i ? 'opacity-50' : ''}`}>
                      {VIOLATION_TYPES.filter((type) => d.counts[type] > 0).map((type, k, arr) => (
                        <div
                          key={type}
                          style={{ height: (d.counts[type] / max) * HEIGHT - 2, background: SERIES_COLOR[type] }}
                          className={k === arr.length - 1 ? 'rounded-t-[4px]' : ''}
                        />
                      ))}
                    </div>
                    {hover === i && (
                      <div className="glass-modal pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 p-3 text-xs">
                        <p className="mb-2 font-medium text-ice">{fmtWeekday(d.day, lang)} · {t('chart.total')} {d.total}</p>
                        {VIOLATION_TYPES.map((type) => (
                          <p key={type} className="flex items-center justify-between gap-2 text-mist">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-sm" style={{ background: SERIES_COLOR[type] }} />
                              {VIOLATIONS[type].label[lang]}
                            </span>
                            <span className="text-frost tabular-nums">{d.counts[type]}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex justify-around gap-2 text-[11px] text-fog">
              {data.map((d) => (
                <span key={d.day} className="w-full max-w-10 text-center">{fmtWeekday(d.day, lang)}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
