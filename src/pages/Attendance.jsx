import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CircleCheck, House, Smartphone, TriangleAlert, Users } from 'lucide-react'
import { request } from '../backend/api'
import { db, dayKey, lastDays } from '../backend/db'
import { CheckinPhoto, CheckinStatusChip, PpeIcons } from '../components/checkin'
import { Card, CardTitle, EmptyState, Modal, PageHeader, Tabs } from '../components/ui'
import { COMPANIES, HAZARD_CATEGORIES, UNFIT_REASONS, companyById } from '../data/companies'
import { bi, fmtDate, fmtTime, timeAgo } from '../lib/format'
import { useDemo } from '../state/DemoStore'

function ReviewModal({ row, onClose }) {
  const { lang, t, notify } = useDemo()
  const { worker, checkin } = row
  const [busy, setBusy] = useState(false)
  const decide = async (decision) => {
    setBusy(true)
    await request('PATCH', `/api/checkins/${checkin.id}`, { decision, by: 'U1' })
    notify(decision === 'sent_home' ? 'toast.sentHome' : 'toast.cleared', { name: worker.name })
    onClose()
  }
  const pending = checkin.status === 'blocked' || checkin.status === 'flagged'

  return (
    <Modal
      open
      onClose={onClose}
      title={worker.name}
      footer={
        pending && (
          <>
            <button className="btn btn-outline" disabled={busy} onClick={() => decide('sent_home')}>
              <House size={15} aria-hidden /> {t('att.sendHome')}
            </button>
            {checkin.fitness.fit && (
              <button className="btn btn-cta" disabled={busy} onClick={() => decide('corrected')}>
                <CircleCheck size={15} aria-hidden /> {t('att.clearAfterFix')}
              </button>
            )}
          </>
        )
      }
    >
      <div className="space-y-4 text-sm">
        <div className="flex gap-4">
          <CheckinPhoto checkin={checkin} className="size-28 shrink-0 rounded-xl" />
          <div className="min-w-0 space-y-1.5">
            <CheckinStatusChip status={checkin.status} />
            <p className="text-mist">
              {bi(companyById(worker.companyId).name, lang)} · {bi(worker.trade, lang)}
            </p>
            <p className="text-fog">
              {fmtTime(checkin.submittedAt, lang).slice(0, 5)} · {checkin.onTime ? t('checkin.onTime') : t('checkin.late')}
            </p>
            <p className="font-mono text-[11px] text-fog">{checkin.id}</p>
          </div>
        </div>
        <dl className="hairline grid grid-cols-2 gap-3 rounded-xl p-4">
          <div>
            <dt className="text-xs text-fog">{t('att.declared')}</dt>
            <dd className="mt-1"><PpeIcons ppe={checkin.ppe} size={16} /></dd>
          </div>
          <div>
            <dt className="text-xs text-fog">{t('att.aiCheck')}</dt>
            <dd className="mt-1 text-frost">
              {checkin.ai.helmet ? '✓' : '✗'} {t('att.helmet')} · {checkin.ai.vest ? '✓' : '✗'} {t('att.vest')}
              <span className="ml-1 text-xs text-fog">({Math.round(checkin.ai.confidence * 100)}%)</span>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-fog">{t('checkin.fitness')}</dt>
            <dd className={`mt-1 ${checkin.fitness.fit ? 'text-good' : 'text-critical'}`}>
              {checkin.fitness.fit ? t('checkin.fit') : `${t('checkin.unfit')} — ${bi(UNFIT_REASONS[checkin.fitness.reason], lang) ?? ''}`}
            </dd>
          </div>
        </dl>
        {checkin.reasons.filter((r) => r.level !== 'note').length > 0 && (
          <ul className="space-y-1">
            {checkin.reasons.filter((r) => r.level !== 'note').map((r) => (
              <li key={r.code} className={`rounded-lg px-3 py-2 ${r.level === 'blocked' ? 'bg-critical/10 text-critical' : 'bg-warning/10 text-warning'}`}>
                {t(`reason.${r.code}`)}
              </li>
            ))}
          </ul>
        )}
        {checkin.review && (
          <p className="text-xs text-fog">
            {t(`att.outcome.${checkin.review.outcome}`)} · {fmtTime(checkin.review.at, lang).slice(0, 5)}
          </p>
        )}
        {pending && <p className="text-xs text-fog">{checkin.fitness.fit ? t('att.reviewHint') : t('att.unfitHint')}</p>}
      </div>
    </Modal>
  )
}

export default function Attendance() {
  const { lang, t } = useDemo()
  const days = lastDays(7)
  const [date, setDate] = useState(days[days.length - 1])
  const [companyId, setCompanyId] = useState('all')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const workers = useLiveQuery(() => db.workers.toArray(), []) ?? []
  const checkins = useLiveQuery(() => db.checkins.where('date').equals(date).toArray(), [date]) ?? []
  const hazards = useLiveQuery(() => db.hazards.where('status').equals('open').reverse().sortBy('createdAt'), []) ?? []

  const rows = useMemo(() => {
    const byWorker = new Map(checkins.map((c) => [c.workerId, c]))
    return workers
      .filter((w) => companyId === 'all' || w.companyId === companyId)
      .map((w) => ({ worker: w, checkin: byWorker.get(w.id) ?? null }))
      .map((r) => ({ ...r, status: r.checkin?.status ?? 'missing' }))
      .sort((a, b) => {
        const order = { blocked: 0, flagged: 1, missing: 2, sent_home: 3, cleared: 4 }
        return order[a.status] - order[b.status] || a.worker.name.localeCompare(b.worker.name)
      })
  }, [workers, checkins, companyId])

  const count = (s) => rows.filter((r) => (s === 'pending' ? ['blocked', 'flagged'].includes(r.status) : r.status === s)).length
  const checkedIn = rows.filter((r) => r.checkin).length
  const onTime = rows.filter((r) => r.checkin?.onTime).length
  const visible = rows.filter((r) => filter === 'all' || (filter === 'pending' ? ['blocked', 'flagged'].includes(r.status) : r.status === filter))
  const isToday = date === dayKey(Date.now())
  const visibleHazards = hazards.filter((h) => companyId === 'all' || h.companyId === companyId)

  const kpis = [
    { label: t('att.kpi.checkedIn'), value: `${checkedIn}/${rows.length}`, sub: rows.length ? `${Math.round((checkedIn / rows.length) * 100)}%` : '—' },
    { label: t('att.kpi.onTime'), value: onTime, sub: checkedIn ? `${Math.round((onTime / checkedIn) * 100)}% ${t('att.kpi.ofCheckedIn')}` : '—' },
    { label: t('att.kpi.pending'), value: count('pending'), sub: t('att.kpi.pendingSub'), tone: count('pending') ? 'text-warning' : '' },
    { label: t('att.kpi.missing'), value: count('missing'), sub: isToday ? t('att.kpi.missingToday') : t('att.kpi.missingPast') },
  ]

  return (
    <>
      <PageHeader
        title={t('att.title')}
        subtitle={t('att.subtitle')}
        actions={
          <>
            <select className="field !w-auto !rounded-full !px-4" value={date} onChange={(e) => setDate(e.target.value)} aria-label={t('att.date')}>
              {[...days].reverse().map((d) => (
                <option key={d} value={d}>
                  {fmtDate(new Date(`${d}T12:00:00`).getTime(), lang)}
                  {d === days[days.length - 1] ? ` · ${t('att.today')}` : ''}
                </option>
              ))}
            </select>
            <select className="field !w-auto !rounded-full !px-4" value={companyId} onChange={(e) => setCompanyId(e.target.value)} aria-label={t('checkin.company')}>
              <option value="all">{t('att.allCompanies')}</option>
              {COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short}
                </option>
              ))}
            </select>
            <Link to="/checkin" className="btn btn-ghost">
              <Smartphone size={15} aria-hidden /> {t('att.openApp')}
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="!p-5">
            <p className="text-sm text-fog">{k.label}</p>
            <p className={`mt-2 font-display text-3xl font-medium tabular-nums ${k.tone || 'text-ice'}`}>{k.value}</p>
            <p className="mt-1 text-xs text-fog">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="!p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge p-4">
            <Tabs
              value={filter}
              onChange={setFilter}
              items={[
                { value: 'all', label: t('common.all'), count: rows.length },
                { value: 'pending', label: t('att.tab.pending'), count: count('pending') },
                { value: 'missing', label: t('checkinStatus.missing'), count: count('missing') },
                { value: 'cleared', label: t('checkinStatus.cleared'), count: count('cleared') },
              ]}
            />
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={Users} title={t('att.empty')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-edge text-left text-xs text-fog">
                    <th className="px-4 py-3 font-medium">{t('checkin.worker')}</th>
                    <th className="px-3 py-3 font-medium">{t('checkin.company')}</th>
                    <th className="px-3 py-3 font-medium">{t('att.time')}</th>
                    <th className="px-3 py-3 font-medium">PPE</th>
                    <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {visible.map((r) => (
                    <tr
                      key={r.worker.id}
                      onClick={() => r.checkin && setSelected(r)}
                      className={r.checkin ? 'cursor-pointer transition-colors hover:bg-blueprint/5' : ''}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          {r.checkin ? (
                            <CheckinPhoto checkin={r.checkin} className="size-9 shrink-0 rounded-full" />
                          ) : (
                            <span className="hairline size-9 shrink-0 rounded-full" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-ice">{r.worker.name}</p>
                            <p className="truncate text-xs text-fog">{bi(r.worker.trade, lang)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-mist">{companyById(r.worker.companyId).short}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {r.checkin ? (
                          <span className={r.checkin.onTime ? 'text-mist' : 'text-warning'}>
                            {fmtTime(r.checkin.submittedAt, lang).slice(0, 5)}
                            {!r.checkin.onTime && <span className="ml-1 text-xs">({t('checkin.late')})</span>}
                          </span>
                        ) : (
                          <span className="text-fog">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">{r.checkin ? <PpeIcons ppe={r.checkin.ppe} /> : <span className="text-fog">—</span>}</td>
                      <td className="px-4 py-2.5">
                        <CheckinStatusChip status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="h-fit">
          <CardTitle>
            <span className="flex items-center gap-2">
              <TriangleAlert size={16} className="text-warning" aria-hidden /> {t('att.hazards')}
            </span>
          </CardTitle>
          {visibleHazards.length === 0 ? (
            <p className="text-sm text-fog">{t('att.noHazards')}</p>
          ) : (
            <ul className="space-y-3">
              {visibleHazards.slice(0, 8).map((h) => (
                <li key={h.id} className="hairline rounded-xl p-3">
                  <p className="text-sm text-ice">{bi(HAZARD_CATEGORIES[h.category], lang)}</p>
                  {h.text && <p className="mt-0.5 text-xs text-mist">{bi(h.text, lang)}</p>}
                  <p className="mt-1 text-xs text-fog">
                    {companyById(h.companyId).short} · {timeAgo(h.createdAt, lang)}
                  </p>
                  <button className="btn btn-outline btn-sm mt-2" onClick={() => request('PATCH', `/api/hazards/${h.id}`, { status: 'resolved' })}>
                    {t('att.resolveHazard')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {selected && <ReviewModal row={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
