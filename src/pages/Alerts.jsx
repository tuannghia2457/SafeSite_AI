import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, BellRing, Ban, CircleCheck, HardHat, Shirt, X } from 'lucide-react'
import CameraFrame from '../components/CameraFrame'
import { AlertStatusChip, Card, EmptyState, Field, Modal, PageHeader, SeverityChip, Tabs, UserLabel } from '../components/ui'
import { CAMERAS, SITES, USERS, VIOLATIONS, byId } from '../data/mockData'
import { bi, fmtDateTime, timeAgo, toDateInput } from '../lib/format'
import { useDemo } from '../state/DemoStore'

export const VIOLATION_ICON = { no_helmet: HardHat, no_vest: Shirt, restricted_zone: Ban }

function CreateIncidentModal({ alert, onClose }) {
  const { lang, t, confirmAlert } = useDemo()
  const navigate = useNavigate()
  const v = VIOLATIONS[alert.type]
  const site = byId(SITES, alert.siteId)
  const [form, setForm] = useState({
    severity: v.severity,
    assignee: site.manager,
    dueDate: Date.now() + 2 * 86400_000,
    notes: '',
    action: v.action[lang],
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = () => {
    // Keep the suggested action bilingual unless the officer rewrote it.
    const action = form.action.trim() === v.action[lang] ? v.action : form.action.trim()
    const id = confirmAlert(alert.id, { ...form, action })
    navigate(`/incidents/${id}`)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('alerts.modal.title')}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-cta" onClick={submit}>
            {t('alerts.modal.submit')} <ArrowRight size={15} aria-hidden />
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="hairline rounded-lg p-3 text-sm">
          <p className="font-medium text-ice">{v.label[lang]}</p>
          <p className="text-xs text-fog">
            {alert.id} · {alert.cameraId} · {bi(site.name, lang)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('common.severity')}>
            <select className="field" value={form.severity} onChange={set('severity')}>
              {['high', 'medium', 'low'].map((s) => (
                <option key={s} value={s}>
                  {t(`severity.${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('common.dueDate')}>
            <input
              type="date"
              className="field"
              value={toDateInput(form.dueDate)}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: new Date(e.target.value).getTime() || f.dueDate }))}
            />
          </Field>
        </div>
        <Field label={t('common.assignee')}>
          <select className="field" value={form.assignee} onChange={set('assignee')}>
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role[lang]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('alerts.modal.action')} hint={t('alerts.modal.actionHint')}>
          <textarea className="field min-h-20" value={form.action} onChange={set('action')} />
        </Field>
        <Field label={t('common.notes')}>
          <textarea className="field min-h-16" value={form.notes} onChange={set('notes')} placeholder={t('alerts.modal.notesPh')} />
        </Field>
      </div>
    </Modal>
  )
}

function AlertDetail({ alert }) {
  const { lang, t, dismissAlert } = useDemo()
  const [creating, setCreating] = useState(false)
  const camera = byId(CAMERAS, alert.cameraId)
  const site = byId(SITES, alert.siteId)
  const v = VIOLATIONS[alert.type]

  return (
    <Card className="!p-0">
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        <CameraFrame scene={camera.scene} workers={alert.snapshot.workers} zone={camera.zone} highlightId={alert.snapshot.targetId} />
        <span className="absolute top-2 left-2 rounded bg-canvas/75 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {t('alerts.evidence')} · {alert.cameraId} · {fmtDateTime(alert.timestamp, lang)}
        </span>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow !text-[11px]">{alert.id}</p>
            <h2 className="mt-1 font-display text-2xl font-medium text-ice">{v.label[lang]}</h2>
          </div>
          <div className="flex gap-2">
            <SeverityChip severity={v.severity} />
            <AlertStatusChip status={alert.status} />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-fog">{t('common.site')}</dt>
            <dd className="mt-0.5 text-frost">{bi(site.name, lang)}</dd>
          </div>
          <div>
            <dt className="text-xs text-fog">{t('common.camera')}</dt>
            <dd className="mt-0.5 text-frost">{bi(camera.name, lang)}</dd>
          </div>
          <div>
            <dt className="text-xs text-fog">{t('alerts.detectedAt')}</dt>
            <dd className="mt-0.5 text-frost">{fmtDateTime(alert.timestamp, lang)}</dd>
          </div>
          <div>
            <dt className="text-xs text-fog">{t('alerts.confidence')}</dt>
            <dd className="mt-0.5 text-frost tabular-nums">{Math.round(alert.confidence * 100)}%</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-edge pt-5">
          {alert.status === 'new' && (
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-cta" onClick={() => setCreating(true)}>
                <CircleCheck size={15} aria-hidden /> {t('alerts.confirm')}
              </button>
              <button className="btn btn-ghost" onClick={() => dismissAlert(alert.id)}>
                <X size={15} aria-hidden /> {t('alerts.dismiss')}
              </button>
            </div>
          )}
          {alert.status === 'confirmed' && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-mist">
              <span>
                {t('alerts.confirmedBy')} <UserLabel userId={alert.reviewedBy} /> · {fmtDateTime(alert.reviewedAt, lang)}
              </span>
              <Link to={`/incidents/${alert.incidentId}`} className="btn btn-ghost btn-sm">
                {t('alerts.openIncident', { id: alert.incidentId })} <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          )}
          {alert.status === 'dismissed' && (
            <p className="text-sm text-mist">
              {t('alerts.dismissedBy')} <UserLabel userId={alert.reviewedBy} /> · {fmtDateTime(alert.reviewedAt, lang)}
            </p>
          )}
        </div>
      </div>
      {creating && <CreateIncidentModal alert={alert} onClose={() => setCreating(false)} />}
    </Card>
  )
}

export default function Alerts() {
  const { state, lang, t } = useDemo()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState('new')

  const sorted = [...state.alerts].sort((a, b) => b.timestamp - a.timestamp)
  const count = (s) => state.alerts.filter((a) => a.status === s).length
  const list = tab === 'all' ? sorted : sorted.filter((a) => a.status === tab)
  const selected = byId(state.alerts, params.get('id')) ?? list[0]

  return (
    <>
      <PageHeader title={t('alerts.title')} subtitle={t('alerts.subtitle')} />
      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'new', label: t('alertStatus.new'), count: count('new') },
            { value: 'confirmed', label: t('alertStatus.confirmed'), count: count('confirmed') },
            { value: 'dismissed', label: t('alertStatus.dismissed'), count: count('dismissed') },
            { value: 'all', label: t('common.all'), count: state.alerts.length },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="max-h-[720px] overflow-y-auto !p-2">
          {list.length === 0 ? (
            <EmptyState icon={BellRing} title={t('alerts.empty')} body={t('alerts.emptyBody')} />
          ) : (
            <ul className="space-y-1">
              {list.map((a) => {
                const Icon = VIOLATION_ICON[a.type]
                const active = selected?.id === a.id
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => setParams({ id: a.id })}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        active ? 'hairline bg-blueprint/10' : 'hover:bg-blueprint/5'
                      }`}
                    >
                      <span className="hairline flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Icon size={16} className={a.status === 'new' ? 'text-critical' : 'text-fog'} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ice">{VIOLATIONS[a.type].label[lang]}</span>
                        <span className="block truncate text-xs text-fog">
                          {a.id} · {a.cameraId} · {timeAgo(a.timestamp, lang)}
                        </span>
                      </span>
                      {a.status === 'new' ? <SeverityChip severity={VIOLATIONS[a.type].severity} /> : <AlertStatusChip status={a.status} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {selected ? (
          <AlertDetail key={selected.id} alert={selected} />
        ) : (
          <Card>
            <EmptyState icon={BellRing} title={t('alerts.select')} />
          </Card>
        )}
      </div>
    </>
  )
}
