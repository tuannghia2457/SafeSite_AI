import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, BellRing, Cctv, ClipboardCheck, FileText, Smartphone } from 'lucide-react'
import { useDemo } from '../state/DemoStore'

// `also` lists extra routes that belong to the same step (they show the same guide banner).
export const WORKFLOW = [
  { key: 'checkin', to: '/checkin', also: ['/attendance'], Icon: Smartphone },
  { key: 'detect', to: '/monitoring', Icon: Cctv },
  { key: 'review', to: '/alerts', Icon: BellRing },
  { key: 'act', to: '/incidents', Icon: ClipboardCheck },
  { key: 'report', to: '/reports', also: ['/companies'], Icon: FileText },
]

export const stepIndexFor = (pathname) =>
  WORKFLOW.findIndex((s) => [s.to, ...(s.also ?? [])].some((p) => pathname.startsWith(p)))

/** Compact workflow indicator shown in the app top bar. */
export function WorkflowStepper() {
  const { t } = useDemo()
  const { pathname } = useLocation()
  const active = stepIndexFor(pathname)

  return (
    <nav aria-label={t('workflow.label')} className="flex items-center">
      {WORKFLOW.map((s, i) => {
        const isActive = i === active
        return (
          <div key={s.key} className="flex items-center">
            {i > 0 && <span className={`mx-1 h-px w-4 xl:w-8 ${i <= active ? 'bg-frost/40' : 'bg-edge'}`} />}
            <Link
              to={s.to}
              aria-current={isActive ? 'step' : undefined}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'hairline bg-blueprint/12 text-white' : 'text-fog hover:text-frost'
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full font-mono text-[10px] ${
                  isActive ? 'bg-frost text-canvas' : 'hairline'
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden md:inline">{t(`workflow.${s.key}.title`)}</span>
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

/** Per-page explainer that tells the presenter what to do and where to go next. */
export function GuideBanner() {
  const { t } = useDemo()
  const { pathname } = useLocation()
  const i = stepIndexFor(pathname)
  if (i < 0) return null
  const step = WORKFLOW[i]
  const next = WORKFLOW[i + 1]
  const { Icon } = step

  return (
    <div className="glass-card mb-6 flex flex-wrap items-center gap-4 !p-4 print:hidden">
      <span className="hairline flex size-10 shrink-0 items-center justify-center rounded-full bg-blueprint/8">
        <Icon size={18} className="text-frost" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="eyebrow !text-[11px]">{t('workflow.stepOf', { n: i + 1, total: WORKFLOW.length })}</p>
        <p className="text-sm text-mist">{t(`workflow.${step.key}.guide`)}</p>
      </div>
      {next && (
        <Link to={next.to} className="btn btn-outline btn-sm">
          {t('workflow.next')}: {t(`workflow.${next.key}.title`)} <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  )
}
