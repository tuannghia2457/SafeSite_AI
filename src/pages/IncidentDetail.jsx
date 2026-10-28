import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, CircleCheck, Play, Plus, RotateCcw } from 'lucide-react'
import CameraFrame from '../components/CameraFrame'
import { Card, CardTitle, EmptyState, IncidentStatusChip, ProgressBar, SeverityChip, UserLabel } from '../components/ui'
import { CAMERAS, SITES, USERS, VIOLATIONS, byId } from '../data/mockData'
import { bi, fmtDate, fmtDateTime, toDateInput } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const STAGES = ['open', 'in_progress', 'resolved']

function StatusTrack({ status }) {
  const { t } = useDemo()
  const current = STAGES.indexOf(status)
  return (
    <ol className="flex items-center">
      {STAGES.map((s, i) => (
        <li key={s} className="flex items-center">
          {i > 0 && <span className={`mx-2 h-px w-6 sm:w-10 ${i <= current ? 'bg-good' : 'bg-edge'}`} />}
          <span className={`flex items-center gap-2 text-xs font-medium ${i <= current ? 'text-ice' : 'text-fog'}`}>
            <span
              className={`flex size-5 items-center justify-center rounded-full ${
                i < current || status === 'resolved' ? 'bg-good text-canvas' : i === current ? 'bg-frost text-canvas' : 'hairline'
              }`}
            >
              {i < current || status === 'resolved' ? <Check size={11} strokeWidth={3} /> : <span className="font-mono text-[10px]">{i + 1}</span>}
            </span>
            {t(`incStatus.${s}`)}
          </span>
        </li>
      ))}
    </ol>
  )
}

function AddActionForm({ incident }) {
  const { t, lang, addAction } = useDemo()
  const [text, setText] = useState('')
  const [assignee, setAssignee] = useState(incident.assignee)
  const [due, setDue] = useState(Date.now() + 86400_000)

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addAction(incident.id, { text: text.trim(), assignee, due })
    setText('')
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2 border-t border-edge pt-4">
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('incd.newActionPh')} />
      <div className="flex flex-wrap gap-2">
        <select className="field !w-auto flex-1" value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label={t('common.assignee')}>
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.role[lang]}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="field !w-auto"
          value={toDateInput(due)}
          onChange={(e) => setDue(new Date(e.target.value).getTime() || due)}
          aria-label={t('common.dueDate')}
        />
        <button type="submit" className="btn btn-ghost" disabled={!text.trim()}>
          <Plus size={15} aria-hidden /> {t('incd.addAction')}
        </button>
      </div>
    </form>
  )
}

export default function IncidentDetail() {
  const { id } = useParams()
  const { state, lang, t, setIncidentStatus, toggleAction } = useDemo()
  const incident = byId(state.incidents, id)

  if (!incident) {
    return (
      <Card>
        <EmptyState title={t('incd.notFound')} body={<Link to="/incidents" className="text-blueprint">{t('incd.back')}</Link>} />
      </Card>
    )
  }

  const alert = byId(state.alerts, incident.alertId)
  const camera = byId(CAMERAS, incident.cameraId)
  const site = byId(SITES, incident.siteId)
  const v = VIOLATIONS[incident.type]
  const done = incident.actions.filter((a) => a.done).length
  const allDone = incident.actions.length > 0 && done === incident.actions.length
  const timeline = [...incident.timeline].sort((a, b) => b.at - a.at)

  return (
    <>
      <Link to="/incidents" className="mb-4 inline-flex items-center gap-1.5 text-sm text-fog hover:text-frost">
        <ArrowLeft size={14} aria-hidden /> {t('incd.back')}
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-[11px]">{incident.id}</p>
          <h1 className="mt-1 font-display text-[28px] leading-tight font-medium text-skywash">{v.label[lang]}</h1>
          <p className="mt-1 text-sm text-fog">
            {bi(site.name, lang)} · {bi(camera.name, lang)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeverityChip severity={incident.severity} />
          <IncidentStatusChip status={incident.status} />
        </div>
      </div>

      <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 !p-4">
        <StatusTrack status={incident.status} />
        <div className="flex flex-wrap items-center gap-2">
          {incident.status === 'open' && (
            <button className="btn btn-cta" onClick={() => setIncidentStatus(incident.id, 'in_progress')}>
              <Play size={14} aria-hidden /> {t('incd.start')}
            </button>
          )}
          {incident.status === 'in_progress' && (
            <>
              {!allDone && <span className="text-xs text-fog">{t('incd.resolveHint')}</span>}
              <button className="btn btn-cta" disabled={!allDone} onClick={() => setIncidentStatus(incident.id, 'resolved')}>
                <CircleCheck size={15} aria-hidden /> {t('incd.resolve')}
              </button>
            </>
          )}
          {incident.status === 'resolved' && (
            <>
              <Link to={`/reports?site=${incident.siteId}`} className="btn btn-ghost">
                {t('incd.toReport')}
              </Link>
              <button className="btn btn-outline" onClick={() => setIncidentStatus(incident.id, 'open')}>
                <RotateCcw size={14} aria-hidden /> {t('incd.reopen')}
              </button>
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="!p-0">
            <div className="relative aspect-video overflow-hidden rounded-t-2xl">
              {alert && (
                <CameraFrame scene={camera.scene} workers={alert.snapshot.workers} zone={camera.zone} highlightId={alert.snapshot.targetId} />
              )}
              <span className="absolute top-2 left-2 rounded bg-canvas/75 px-1.5 py-0.5 font-mono text-[11px] text-white">
                {t('alerts.evidence')} · {incident.alertId} · {alert && `${Math.round(alert.confidence * 100)}%`}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 p-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-fog">{t('common.assignee')}</dt>
                <dd className="mt-1">
                  <UserLabel userId={incident.assignee} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-fog">{t('common.dueDate')}</dt>
                <dd className="mt-1 text-frost">{fmtDate(incident.dueDate, lang)}</dd>
              </div>
              <div>
                <dt className="text-xs text-fog">{t('incd.created')}</dt>
                <dd className="mt-1 text-frost">{fmtDateTime(incident.createdAt, lang)}</dd>
              </div>
              {incident.notes && (
                <div className="col-span-full">
                  <dt className="text-xs text-fog">{t('common.notes')}</dt>
                  <dd className="mt-1 whitespace-pre-line text-mist">{incident.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <CardTitle>{t('incd.timeline')}</CardTitle>
            <ol className="relative space-y-4 border-l border-edge pl-5">
              {timeline.map((e, k) => (
                <li key={k} className="relative">
                  <span className="absolute top-1.5 -left-[24.5px] size-2 rounded-full bg-frost" aria-hidden />
                  <p className="text-sm text-ice">{t(`event.${e.event}`)}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-fog">
                    {fmtDateTime(e.at, lang)} · <UserLabel userId={e.by} />
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="h-fit lg:col-span-2">
          <CardTitle action={<span className="text-xs text-fog tabular-nums">{done}/{incident.actions.length}</span>}>
            {t('incd.actions')}
          </CardTitle>
          <ProgressBar value={done} total={incident.actions.length} className="mb-4" />
          {incident.actions.length === 0 && <p className="text-sm text-fog">{t('incd.noActions')}</p>}
          <ul className="space-y-2">
            {incident.actions.map((a) => (
              <li key={a.id}>
                <label className={`hairline flex cursor-pointer gap-3 rounded-xl p-3 transition-colors hover:bg-blueprint/5 ${a.done ? 'opacity-70' : ''}`}>
                  <input
                    type="checkbox"
                    checked={a.done}
                    onChange={() => toggleAction(incident.id, a.id)}
                    disabled={incident.status === 'resolved'}
                    className="mt-0.5 size-4 shrink-0 accent-good"
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${a.done ? 'text-mist line-through' : 'text-ice'}`}>{bi(a.text, lang)}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1 text-xs text-fog">
                      <UserLabel userId={a.assignee} /> · {t('common.due')} {fmtDate(a.due, lang)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {incident.status !== 'resolved' && <AddActionForm incident={incident} />}
        </Card>
      </div>
    </>
  )
}
