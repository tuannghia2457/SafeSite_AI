import { useEffect } from 'react'
import { Check, CircleAlert, CircleCheck, Hourglass, TriangleAlert, X } from 'lucide-react'
import { INCIDENT_STATUS, SEVERITY, USERS, byId } from '../data/mockData'
import { useDemo } from '../state/DemoStore'

export function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className="h-px w-16 bg-linear-to-r from-transparent to-edge" />
      <span className="eyebrow">{children}</span>
      <span className="h-px w-16 bg-linear-to-l from-transparent to-edge" />
    </div>
  )
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`glass-card p-6 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ children, action, className = '' }) {
  return (
    <div className={`mb-4 flex items-center justify-between gap-4 ${className}`}>
      <h3 className="text-base font-semibold text-ice">{children}</h3>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-medium text-skywash">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fog">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const SEVERITY_STYLE = {
  high: { cls: 'text-critical bg-critical/12', Icon: TriangleAlert },
  medium: { cls: 'text-warning bg-warning/12', Icon: CircleAlert },
  low: { cls: 'text-good bg-good/12', Icon: CircleCheck },
}

export function SeverityChip({ severity }) {
  const { lang } = useDemo()
  const { cls, Icon } = SEVERITY_STYLE[severity]
  return (
    <span className={`chip ${cls}`}>
      <Icon size={12} aria-hidden /> {SEVERITY[severity][lang]}
    </span>
  )
}

const STATUS_STYLE = {
  open: { cls: 'text-critical bg-critical/12', Icon: CircleAlert },
  in_progress: { cls: 'text-warning bg-warning/12', Icon: Hourglass },
  resolved: { cls: 'text-good bg-good/12', Icon: CircleCheck },
}

export function IncidentStatusChip({ status }) {
  const { lang } = useDemo()
  const { cls, Icon } = STATUS_STYLE[status]
  return (
    <span className={`chip ${cls}`}>
      <Icon size={12} aria-hidden /> {INCIDENT_STATUS[status][lang]}
    </span>
  )
}

export function AlertStatusChip({ status }) {
  const { t } = useDemo()
  const style = {
    new: 'text-ice bg-blueprint/15',
    confirmed: 'text-good bg-good/12',
    dismissed: 'text-fog bg-steel/60',
  }[status]
  const Icon = { new: CircleAlert, confirmed: Check, dismissed: X }[status]
  return (
    <span className={`chip ${style}`}>
      <Icon size={12} aria-hidden /> {t(`alertStatus.${status}`)}
    </span>
  )
}

export function UserAvatar({ userId, size = 28 }) {
  const user = byId(USERS, userId)
  if (!user) return null
  const initials = user.name.split(' ').slice(-1)[0][0]
  return (
    <span
      className="hairline inline-flex shrink-0 items-center justify-center rounded-full bg-blueprint/10 text-xs font-semibold text-frost"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function UserLabel({ userId, showRole = false }) {
  const { lang, t } = useDemo()
  if (userId === 'AI') return <span className="text-mist">{t('common.aiEngine')}</span>
  const user = byId(USERS, userId)
  if (!user) return null
  return (
    <span className="inline-flex items-center gap-2">
      <UserAvatar userId={userId} size={22} />
      <span className="text-frost">{user.name}</span>
      {showRole && <span className="text-fog">· {user.role[lang]}</span>}
    </span>
  )
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="hairline inline-flex flex-wrap rounded-full p-1" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            value === it.value ? 'bg-blueprint/12 text-white' : 'text-fog hover:text-frost'
          }`}
        >
          {it.label}
          {it.count != null && (
            <span className="rounded-full bg-blueprint/10 px-1.5 text-xs text-mist tabular-nums">{it.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <span className="hairline flex size-14 items-center justify-center rounded-full bg-blueprint/5">
          <Icon size={22} className="text-frost" aria-hidden />
        </span>
      )}
      <p className="font-medium text-ice">{title}</p>
      {body && <p className="max-w-sm text-sm text-fog">{body}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-modal flex max-h-[90vh] w-full max-w-lg flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-display text-xl font-medium text-ice">{title}</h2>
          <button className="btn btn-outline btn-sm !px-2" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-2">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pt-4 pb-6">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-fog">{hint}</span>}
    </label>
  )
}

export function ProgressBar({ value, total, className = '' }) {
  const ratio = total ? value / total : 0
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-blueprint/10 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={total}>
      <div className="h-full rounded-full bg-good transition-all" style={{ width: `${ratio * 100}%` }} />
    </div>
  )
}
