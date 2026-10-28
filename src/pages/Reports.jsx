import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Loader, Printer, Sparkles } from 'lucide-react'
import CameraFrame from '../components/CameraFrame'
import Logo from '../components/Logo'
import { Card, Field, PageHeader } from '../components/ui'
import { CAMERAS, CURRENT_USER, INCIDENT_STATUS, SEVERITY, SITES, USERS, VIOLATIONS, VIOLATION_TYPES, byId } from '../data/mockData'
import { bi, fmtDate, fmtDateTime, fmtTime, pct } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const DAY = 86400_000

// The report itself is always bilingual (Vietnamese first, English second), independent of the UI language.
const R = {
  title: { vi: 'Báo cáo An toàn Lao động', en: 'Workplace Safety Report' },
  ref: { vi: 'Số tham chiếu', en: 'Reference' },
  period: { vi: 'Kỳ báo cáo', en: 'Reporting period' },
  site: { vi: 'Công trường / Nhà máy', en: 'Site' },
  generated: { vi: 'Ngày lập', en: 'Generated' },
  s1: { vi: 'Tóm tắt', en: 'Executive summary' },
  s2: { vi: 'Phân loại vi phạm', en: 'Violations by type' },
  s3: { vi: 'Sổ theo dõi sự cố', en: 'Incident register' },
  s4: { vi: 'Hình ảnh bằng chứng', en: 'Supporting evidence' },
  s5: { vi: 'Xác nhận', en: 'Sign-off' },
  detections: { vi: 'Phát hiện bởi AI', en: 'AI detections' },
  confirmed: { vi: 'Vi phạm đã xác nhận', en: 'Confirmed violations' },
  falsePos: { vi: 'Cảnh báo sai (đã loại)', en: 'False positives (dismissed)' },
  incidents: { vi: 'Sự cố ghi nhận', en: 'Incidents recorded' },
  resolved: { vi: 'Tỷ lệ đã khắc phục', en: 'Resolution rate' },
  actions: { vi: 'Hành động khắc phục hoàn thành', en: 'Corrective actions completed' },
  type: { vi: 'Loại vi phạm', en: 'Violation type' },
  count: { vi: 'Số lượng', en: 'Count' },
  share: { vi: 'Tỷ trọng', en: 'Share' },
  id: { vi: 'Mã', en: 'ID' },
  date: { vi: 'Ngày', en: 'Date' },
  severity: { vi: 'Mức độ', en: 'Severity' },
  status: { vi: 'Trạng thái', en: 'Status' },
  action: { vi: 'Hành động khắc phục', en: 'Corrective action' },
  none: { vi: 'Không có sự cố trong kỳ.', en: 'No incidents in this period.' },
  preparedBy: { vi: 'Người lập', en: 'Prepared by' },
  approvedBy: { vi: 'Người phê duyệt', en: 'Approved by' },
  footer: {
    vi: 'Báo cáo được tạo tự động bởi SafeSite AI từ dữ liệu giám sát và quản lý sự cố. Bản demo sử dụng dữ liệu mô phỏng.',
    en: 'Generated automatically by SafeSite AI from monitoring and incident-management records. This demo uses simulated data.',
  },
}

/** Vietnamese label on top, English below. */
function Bi({ v, className = '', sub = 'text-fog print:text-gray-500' }) {
  return (
    <span className={className}>
      {v.vi}
      <span className={`block text-[0.85em] font-normal ${sub}`}>{v.en}</span>
    </span>
  )
}

function SectionTitle({ n, v }) {
  return (
    <h3 className="mb-4 flex items-baseline gap-3 border-b border-edge pb-2 print:border-gray-300">
      <span className="font-mono text-xs text-fog print:text-gray-500">0{n}</span>
      <span className="font-medium text-ice print:text-black">
        {v.vi} <span className="font-normal text-fog print:text-gray-500">/ {v.en}</span>
      </span>
    </h3>
  )
}

function SafetyReport({ siteId, days, generatedAt }) {
  const { state } = useDemo()
  const from = generatedAt - days * DAY
  const site = byId(SITES, siteId)
  const inSite = (x) => siteId === 'all' || x.siteId === siteId
  const alerts = state.alerts.filter((a) => inSite(a) && a.timestamp >= from && a.timestamp <= generatedAt)
  const incidents = state.incidents.filter((i) => inSite(i) && i.createdAt >= from).sort((a, b) => a.createdAt - b.createdAt)
  const confirmed = alerts.filter((a) => a.status === 'confirmed')
  const dismissed = alerts.filter((a) => a.status === 'dismissed')
  const resolved = incidents.filter((i) => i.status === 'resolved')
  const actions = incidents.flatMap((i) => i.actions)
  const actionsDone = actions.filter((a) => a.done)
  const evidence = incidents.slice(-4).map((i) => ({ incident: i, alert: byId(state.alerts, i.alertId) })).filter((e) => e.alert)
  const ref = `SSR-${new Date(generatedAt).getFullYear()}-${siteId === 'all' ? 'ALL' : siteId}-${String(days).padStart(2, '0')}D`
  const preparer = byId(USERS, CURRENT_USER)
  const approver = byId(USERS, site?.manager ?? 'U2')

  const stats = [
    [R.detections, alerts.length],
    [R.confirmed, confirmed.length],
    [R.falsePos, dismissed.length],
    [R.incidents, incidents.length],
    [R.resolved, incidents.length ? pct(resolved.length / incidents.length) : '—'],
    [R.actions, `${actionsDone.length}/${actions.length}`],
  ]

  const cell = 'px-3 py-2 align-top'
  return (
    <article className="glass-modal p-8 text-sm print:rounded-none print:bg-white print:p-0 print:text-black print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-edge pb-6 print:border-gray-300">
        <div>
          <Logo />
          <h2 className="mt-6 font-display text-3xl font-medium text-skywash print:text-black">{R.title.vi}</h2>
          <p className="font-display text-lg text-mist print:text-gray-600">{R.title.en}</p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-2 text-xs">
          {[
            [R.ref, ref],
            [R.site, site ? `${site.name.vi}` : 'Tất cả / All sites'],
            [R.period, `${fmtDate(from, 'vi')} – ${fmtDate(generatedAt, 'vi')}`],
            [R.generated, `${fmtDate(generatedAt, 'vi')} ${fmtTime(generatedAt, 'vi').slice(0, 5)}`],
          ].map(([k, v]) => (
            <div key={k.en} className="contents">
              <dt className="text-fog print:text-gray-500">
                {k.vi} / {k.en}
              </dt>
              <dd className="text-right text-frost print:text-black">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={1} v={R.s1} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label.en} className="hairline rounded-xl p-4 print:border print:border-gray-300 print:shadow-none">
              <p className="font-display text-2xl font-medium text-ice tabular-nums print:text-black">{value}</p>
              <Bi v={label} className="mt-1 block text-xs text-mist print:text-gray-700" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={2} v={R.s2} />
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-fog print:text-gray-500">
              <th className={cell}><Bi v={R.type} sub="" /></th>
              <th className={`${cell} text-right`}><Bi v={R.count} sub="" /></th>
              <th className={`${cell} w-1/3`}><Bi v={R.share} sub="" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge print:divide-gray-200">
            {VIOLATION_TYPES.map((type) => {
              const n = confirmed.filter((a) => a.type === type).length
              const share = confirmed.length ? n / confirmed.length : 0
              return (
                <tr key={type}>
                  <td className={cell}>
                    <Bi v={VIOLATIONS[type].label} className="text-ice print:text-black" />
                  </td>
                  <td className={`${cell} text-right text-frost tabular-nums print:text-black`}>{n}</td>
                  <td className={cell}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blueprint/10 print:bg-gray-200">
                        <div className="h-full rounded-full bg-frost print:bg-gray-700" style={{ width: `${share * 100}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-fog tabular-nums">{pct(share)}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <SectionTitle n={3} v={R.s3} />
        {incidents.length === 0 ? (
          <Bi v={R.none} className="text-mist" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-fog print:text-gray-500">
                  {[R.id, R.date, R.type, R.severity, R.action, R.status].map((h) => (
                    <th key={h.en} className={cell}><Bi v={h} sub="" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-edge print:divide-gray-200">
                {incidents.map((i) => (
                  <tr key={i.id} className="break-inside-avoid">
                    <td className={`${cell} font-mono text-xs text-mist print:text-black`}>{i.id}</td>
                    <td className={`${cell} text-mist tabular-nums print:text-black`}>{fmtDate(i.createdAt, 'vi')}</td>
                    <td className={cell}><Bi v={VIOLATIONS[i.type].label} className="text-ice print:text-black" /></td>
                    <td className={cell}><Bi v={SEVERITY[i.severity]} className="text-frost print:text-black" /></td>
                    <td className={`${cell} max-w-64`}>
                      {i.actions.map((a) => (
                        <p key={a.id} className="mb-1 text-xs text-mist print:text-black">
                          {a.done ? '✓' : '○'} {typeof a.text === 'string' ? a.text : (
                            <>
                              {a.text.vi}
                              <span className="block pl-3 text-fog print:text-gray-500">{a.text.en}</span>
                            </>
                          )}
                        </p>
                      ))}
                    </td>
                    <td className={cell}><Bi v={INCIDENT_STATUS[i.status]} className="text-frost print:text-black" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {evidence.length > 0 && (
        <section className="mt-8 break-inside-avoid">
          <SectionTitle n={4} v={R.s4} />
          <div className="grid grid-cols-2 gap-4">
            {evidence.map(({ incident, alert }) => {
              const camera = byId(CAMERAS, incident.cameraId)
              return (
                <figure key={incident.id}>
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <CameraFrame scene={camera.scene} workers={alert.snapshot.workers} zone={camera.zone} highlightId={alert.snapshot.targetId} />
                  </div>
                  <figcaption className="mt-1.5 text-xs text-fog print:text-gray-600">
                    {incident.id} · {camera.id} · {fmtDateTime(alert.timestamp, 'vi')} · {Math.round(alert.confidence * 100)}%
                    <span className="block">
                      {VIOLATIONS[incident.type].label.vi} / {VIOLATIONS[incident.type].label.en}
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={5} v={R.s5} />
        <div className="grid grid-cols-2 gap-6">
          {[
            [R.preparedBy, preparer],
            [R.approvedBy, approver],
          ].map(([label, user]) => (
            <div key={label.en}>
              <p className="text-xs text-fog print:text-gray-500">
                {label.vi} / {label.en}
              </p>
              <div className="mt-10 border-t border-edge pt-2 print:border-gray-400">
                <p className="font-medium text-ice print:text-black">{user.name}</p>
                <p className="text-xs text-fog print:text-gray-600">
                  {user.role.vi} / {user.role.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-edge pt-4 text-xs text-fog print:border-gray-300 print:text-gray-500">
        <Bi v={R.footer} sub="text-fog print:text-gray-500" />
      </footer>
    </article>
  )
}

export default function Reports() {
  const { lang, t } = useDemo()
  const [params] = useSearchParams()
  const [siteId, setSiteId] = useState(params.get('site') ?? 'all')
  const [days, setDays] = useState(7)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = () => {
    setLoading(true)
    setReport(null)
    setTimeout(() => {
      setReport({ siteId, days, generatedAt: Date.now() })
      setLoading(false)
    }, 1200)
  }

  // Auto-generate when arriving from an incident ("Add to report").
  useEffect(() => {
    if (params.get('site')) generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={t('rep.title')}
          subtitle={t('rep.subtitle')}
          actions={
            report && (
              <button className="btn btn-ghost" onClick={() => window.print()}>
                <Printer size={15} aria-hidden /> {t('rep.print')}
              </button>
            )
          }
        />
        <Card className="mb-6 flex flex-wrap items-end gap-4 !p-5">
          <div className="min-w-56 flex-1">
            <Field label={t('common.site')}>
              <select className="field" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <option value="all">{t('common.allSites')}</option>
                {SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {bi(s.name, lang)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="w-48">
            <Field label={t('rep.period')}>
              <select className="field" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>{t('rep.last7')}</option>
                <option value={30}>{t('rep.last30')}</option>
              </select>
            </Field>
          </div>
          <button className="btn btn-cta" onClick={generate} disabled={loading}>
            {loading ? <Loader size={15} className="animate-spin" aria-hidden /> : <Sparkles size={15} aria-hidden />}
            {loading ? t('rep.generating') : t('rep.generate')}
          </button>
        </Card>
      </div>

      {report ? (
        <SafetyReport {...report} />
      ) : (
        <Card className="print:hidden">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="hairline flex size-14 items-center justify-center rounded-full bg-blueprint/5">
              {loading ? <Loader size={22} className="animate-spin text-frost" /> : <FileText size={22} className="text-frost" />}
            </span>
            <p className="font-medium text-ice">{loading ? t('rep.generating') : t('rep.emptyTitle')}</p>
            <p className="max-w-md text-sm text-fog">{t('rep.emptyBody')}</p>
          </div>
        </Card>
      )}
    </>
  )
}
