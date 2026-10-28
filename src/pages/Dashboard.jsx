import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Cctv, ClipboardCheck, Gauge, MapPin } from 'lucide-react'
import { Card, CardTitle, PageHeader, ProgressBar, SeverityChip, AlertStatusChip } from '../components/ui'
import ViolationsChart from '../components/ViolationsChart'
import { CAMERAS, SITES, VIOLATIONS, byId } from '../data/mockData'
import { bi, fmtDate, timeAgo } from '../lib/format'
import { actionProgress, camerasOnline, forSite, isOpen, safetyScore, violationsByDay } from '../lib/selectors'
import { useDemo } from '../state/DemoStore'

function Kpi({ Icon, label, value, sub, to }) {
  const content = (
    <Card className="h-full !p-5 transition-colors hover:bg-blueprint/5">
      <div className="flex items-center justify-between text-fog">
        <span className="text-sm">{label}</span>
        <Icon size={16} aria-hidden />
      </div>
      <p className="mt-3 font-display text-4xl font-medium text-ice tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-fog">{sub}</p>
    </Card>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function Dashboard() {
  const { state, lang, t } = useDemo()
  const [siteId, setSiteId] = useState('all')

  const alerts = forSite(state.alerts, siteId)
  const incidents = forSite(state.incidents, siteId)
  const cams = camerasOnline(siteId)
  const newAlerts = alerts.filter((a) => a.status === 'new')
  const open = incidents.filter(isOpen)
  const score = safetyScore(siteId, state.alerts, state.incidents)
  const progress = actionProgress(open)
  const recent = [...alerts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6)

  return (
    <>
      <PageHeader
        title={t('dash.title')}
        subtitle={`${fmtDate(Date.now(), lang)} · ${t('dash.subtitle')}`}
        actions={
          <select className="field !w-auto !rounded-full !px-4" value={siteId} onChange={(e) => setSiteId(e.target.value)} aria-label={t('common.site')}>
            <option value="all">{t('common.allSites')}</option>
            {SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {bi(s.name, lang)}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi Icon={Gauge} label={t('dash.kpi.score')} value={`${score}`} sub={t('dash.kpi.scoreSub')} />
        <Kpi Icon={BellRing} label={t('dash.kpi.newAlerts')} value={newAlerts.length} sub={t('dash.kpi.newAlertsSub')} to="/alerts" />
        <Kpi
          Icon={ClipboardCheck}
          label={t('dash.kpi.openIncidents')}
          value={open.length}
          sub={t('dash.kpi.actionsDone', { done: progress.done, total: progress.total })}
          to="/incidents"
        />
        <Kpi Icon={Cctv} label={t('dash.kpi.cameras')} value={`${cams.online}/${cams.total}`} sub={t('dash.kpi.camerasSub')} to="/monitoring" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle>{t('dash.chart.title')}</CardTitle>
          <ViolationsChart data={violationsByDay(alerts)} />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle
            action={
              <Link to="/alerts" className="flex items-center gap-1 text-xs font-medium text-blueprint hover:text-ice">
                {t('common.viewAll')} <ArrowRight size={12} aria-hidden />
              </Link>
            }
          >
            {t('dash.recent')}
          </CardTitle>
          <ul className="divide-y divide-edge">
            {recent.map((a) => (
              <li key={a.id}>
                <Link to={`/alerts?id=${a.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ice">{VIOLATIONS[a.type].label[lang]}</p>
                    <p className="truncate text-xs text-fog">
                      {a.cameraId} · {bi(byId(CAMERAS, a.cameraId).name, lang)} · {timeAgo(a.timestamp, lang)}
                    </p>
                  </div>
                  <AlertStatusChip status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-base font-semibold text-ice">{t('dash.sites')}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {SITES.filter((s) => siteId === 'all' || s.id === siteId).map((s) => {
          const siteOpen = state.incidents.filter((i) => i.siteId === s.id && isOpen(i))
          const siteNew = state.alerts.filter((a) => a.siteId === s.id && a.status === 'new').length
          const c = camerasOnline(s.id)
          const sScore = safetyScore(s.id, state.alerts, state.incidents)
          const worst = siteOpen.find((i) => i.severity === 'high')
          return (
            <Card key={s.id} className="!p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ice">{bi(s.name, lang)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-fog">
                    <MapPin size={12} aria-hidden /> {s.location}
                  </p>
                </div>
                <span className="font-display text-2xl font-medium text-ice tabular-nums">{sScore}</span>
              </div>
              <ProgressBar value={sScore} total={100} className="mt-4" />
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-fog">{t('dash.site.cameras')}</dt>
                  <dd className="mt-0.5 text-frost tabular-nums">{c.online}/{c.total}</dd>
                </div>
                <div>
                  <dt className="text-fog">{t('dash.site.newAlerts')}</dt>
                  <dd className="mt-0.5 text-frost tabular-nums">{siteNew}</dd>
                </div>
                <div>
                  <dt className="text-fog">{t('dash.site.open')}</dt>
                  <dd className="mt-0.5 text-frost tabular-nums">{siteOpen.length}</dd>
                </div>
              </dl>
              {worst && (
                <div className="mt-4 flex items-center gap-2 border-t border-edge pt-3">
                  <SeverityChip severity="high" />
                  <Link to={`/incidents/${worst.id}`} className="truncate text-xs text-mist hover:text-ice">
                    {worst.id} · {VIOLATIONS[worst.type].label[lang]}
                  </Link>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
