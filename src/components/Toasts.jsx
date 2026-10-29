import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Siren, TriangleAlert, X } from 'lucide-react'
import { CAMERAS, VIOLATIONS, byId } from '../data/mockData'
import { bi } from '../lib/format'
import { useDemo } from '../state/DemoStore'

function Toast({ toast }) {
  const { state, lang, t, dropToast } = useDemo()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => dropToast(toast.id), toast.kind === 'alert' ? 7000 : 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.kind, dropToast])

  let Icon = toast.kind === 'warning' ? TriangleAlert : CircleCheck
  let title = t(toast.key ?? '', toast.vars)
  let body = null
  let onClick = null

  if (toast.kind === 'alert') {
    const alert = byId(state.alerts, toast.alertId)
    if (!alert) return null
    Icon = Siren
    title = `${t('toast.newAlert')}: ${VIOLATIONS[alert.type].label[lang]}`
    body = `${alert.cameraId} · ${bi(byId(CAMERAS, alert.cameraId).name, lang)} · ${Math.round(alert.confidence * 100)}%`
    onClick = () => {
      navigate(`/alerts?id=${alert.id}`)
      dropToast(toast.id)
    }
  }

  return (
    <div className="glass-modal animate-toast-in flex w-80 items-start gap-3 p-4">
      <Icon size={18} className={`mt-0.5 shrink-0 ${{ alert: 'text-critical', warning: 'text-warning' }[toast.kind] ?? 'text-good'}`} aria-hidden />
      <button className="min-w-0 flex-1 text-left" onClick={onClick ?? undefined} disabled={!onClick}>
        <p className="text-sm font-medium text-ice">{title}</p>
        {body && <p className="mt-0.5 truncate text-xs text-fog">{body}</p>}
        {onClick && <p className="mt-1 text-xs font-medium text-blueprint">{t('toast.review')} →</p>}
      </button>
      <button onClick={() => dropToast(toast.id)} className="text-fog hover:text-frost" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toasts() {
  const { state } = useDemo()
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2 print:hidden" aria-live="polite">
      {state.toasts.slice(-3).map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
