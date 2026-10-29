import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileSpreadsheet, Loader, Printer, Sparkles } from 'lucide-react'
import { request } from '../backend/api'
import Logo from '../components/Logo'
import { Bi, SectionTitle, downloadCsv } from '../components/report'
import { Card, EmptyState, Field } from '../components/ui'
import { COMPANY_ROLE, HAZARD_CATEGORIES, PPE_ITEMS, companyById } from '../data/companies'
import { CURRENT_USER, INCIDENT_STATUS, SEVERITY, SITES, USERS, VIOLATIONS, byId } from '../data/mockData'
import { bi, fmtDate, fmtTime, pct } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const rate = (r) => (r == null ? '—' : pct(r))
const dayLabel = (key) => fmtDate(new Date(`${key}T12:00:00`).getTime(), 'vi')

// Report labels — the report is always bilingual, Vietnamese first.
const R = {
  title: { vi: 'Báo cáo Hiệu suất An toàn Nhà thầu', en: 'Contractor Safety Performance Report' },
  ref: { vi: 'Số tham chiếu', en: 'Reference' },
  company: { vi: 'Doanh nghiệp', en: 'Company' },
  taxCode: { vi: 'Mã số thuế', en: 'Tax code' },
  site: { vi: 'Công trường', en: 'Site' },
  period: { vi: 'Kỳ báo cáo', en: 'Reporting period' },
  generated: { vi: 'Ngày lập', en: 'Generated' },
  s1: { vi: 'Tóm tắt', en: 'Summary' },
  s2: { vi: 'Hợp đồng & yêu cầu của khách hàng', en: 'Contracts & client requirements' },
  s3: { vi: 'Nhật ký check-in trước ca', en: 'Daily pre-shift register' },
  s4: { vi: 'Tuân thủ PPE & sức khỏe', en: 'PPE & fitness compliance' },
  s5: { vi: 'Mối nguy do công nhân báo cáo', en: 'Hazards reported by workers' },
  s6: { vi: 'Sự cố & hành động khắc phục', en: 'Incidents & corrective actions' },
  s7: { vi: 'Xác nhận & tính toàn vẹn dữ liệu', en: 'Sign-off & data integrity' },
  workforce: { vi: 'Quân số', en: 'Workforce' },
  checkinRate: { vi: 'Tỷ lệ check-in trước ca', en: 'Pre-shift check-in rate' },
  onTime: { vi: 'Check-in đúng giờ', en: 'On-time check-ins' },
  firstClear: { vi: 'Đạt PPE ngay lần đầu', en: 'Cleared first time' },
  aiVerified: { vi: 'PPE được AI xác nhận', en: 'PPE verified by AI' },
  blocked: { vi: 'Lượt bị chặn vào ca', en: 'Shift starts blocked' },
  hazards: { vi: 'Mối nguy được báo cáo', en: 'Hazards reported' },
  closure: { vi: 'Tỷ lệ khắc phục có xác minh', en: 'Verified safety closure rate' },
  client: { vi: 'Khách hàng', en: 'Client' },
  project: { vi: 'Dự án', en: 'Project' },
  value: { vi: 'Giá trị', en: 'Value' },
  requirements: { vi: 'Yêu cầu an toàn', en: 'Safety requirements' },
  date: { vi: 'Ngày', en: 'Date' },
  expected: { vi: 'Theo kế hoạch', en: 'Expected' },
  checkedIn: { vi: 'Đã check-in', en: 'Checked in' },
  flagged: { vi: 'Cần xem xét', en: 'Flagged' },
  blockedShort: { vi: 'Bị chặn', en: 'Blocked' },
  sentHome: { vi: 'Cho về', en: 'Sent home' },
  item: { vi: 'Hạng mục', en: 'Item' },
  missingCount: { vi: 'Số lượt thiếu', en: 'Times missing' },
  unfit: { vi: 'Khai báo không đủ sức khỏe', en: 'Declared unfit for work' },
  category: { vi: 'Loại', en: 'Category' },
  status: { vi: 'Trạng thái', en: 'Status' },
  open: { vi: 'Đang mở', en: 'Open' },
  resolved: { vi: 'Đã xử lý', en: 'Resolved' },
  none: { vi: 'Không có trong kỳ.', en: 'None in this period.' },
  incident: { vi: 'Sự cố', en: 'Incident' },
  severity: { vi: 'Mức độ', en: 'Severity' },
  actions: { vi: 'Hành động', en: 'Actions' },
  preparedBy: { vi: 'Người lập', en: 'Prepared by' },
  approvedBy: { vi: 'Đại diện nhà thầu', en: 'For the contractor' },
  integrity: {
    vi: 'Số liệu được tổng hợp tự động từ các lượt check-in có dấu thời gian, ảnh, kết quả kiểm tra PPE và sự kiện camera. Sự cố được gán cho nhà thầu theo khu vực làm việc, không dùng nhận diện khuôn mặt. Bản demo sử dụng dữ liệu mô phỏng.',
    en: 'Figures are compiled automatically from timestamped check-ins, photos, PPE checks and camera events. Incidents are attributed to the contractor by work zone, never by facial recognition. This demo uses simulated data.',
  },
}

function CompanyReport({ report }) {
  const { company, summary, contracts, daily, ppeMissing, hazards, incidents, period, generatedAt } = report
  const site = byId(SITES, company.siteId)
  const hse = byId(USERS, company.hseManager)
  const preparer = byId(USERS, CURRENT_USER)
  const ref = `CSR-${company.id}-${period.to.replaceAll('-', '')}-${String(period.days).padStart(2, '0')}D`
  const cell = 'px-3 py-2 align-top'
  const muted = 'text-fog print:text-gray-500'

  const tiles = [
    [R.workforce, report.workforce],
    [R.checkinRate, rate(summary.checkinRate)],
    [R.onTime, rate(summary.onTimeRate)],
    [R.firstClear, rate(summary.firstTimeClearRate)],
    [R.aiVerified, rate(summary.aiVerifiedRate)],
    [R.blocked, summary.blocked],
    [R.hazards, `${summary.hazards} (${summary.hazardsResolved} ✓)`],
    [R.closure, rate(summary.verifiedClosureRate)],
  ]

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
            [R.company, company.name.vi],
            [R.taxCode, company.taxCode],
            [R.site, site.name.vi],
            [R.period, `${dayLabel(period.from)} – ${dayLabel(period.to)}`],
            [R.generated, `${fmtDate(generatedAt, 'vi')} ${fmtTime(generatedAt, 'vi').slice(0, 5)}`],
          ].map(([k, v]) => (
            <div key={k.en} className="contents">
              <dt className={muted}>
                {k.vi} / {k.en}
              </dt>
              <dd className="text-right text-frost print:text-black">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={1} v={R.s1} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map(([label, value]) => (
            <div key={label.en} className="hairline rounded-xl p-4 print:border print:border-gray-300 print:shadow-none">
              <p className="font-display text-2xl font-medium text-ice tabular-nums print:text-black">{value}</p>
              <Bi v={label} className="mt-1 block text-xs text-mist print:text-gray-700" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={2} v={R.s2} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className={`text-left text-xs ${muted}`}>
                {[R.client, R.project, R.value, R.requirements].map((h) => (
                  <th key={h.en} className={cell}><Bi v={h} sub="" /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge print:divide-gray-200">
              {contracts.map((k) => (
                <tr key={k.id}>
                  <td className={cell}>
                    <span className="text-ice print:text-black">{k.client}</span>
                    <span className={`block text-xs ${muted}`}>
                      {k.country.vi} / {k.country.en}
                      {k.via && ` · ${k.via}`}
                    </span>
                  </td>
                  <td className={cell}><Bi v={k.project} className="text-frost print:text-black" /></td>
                  <td className={`${cell} text-frost tabular-nums print:text-black`}>US${(k.valueUsd / 1e6).toFixed(2)}M</td>
                  <td className={cell}>
                    {k.requirements.map((r) => (
                      <span key={typeof r === 'string' ? r : r.en} className="mr-1 mb-1 inline-block rounded bg-blueprint/10 px-1.5 py-0.5 text-xs text-mist print:bg-gray-100 print:text-black">
                        {typeof r === 'string' ? r : `${r.vi} / ${r.en}`}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle n={3} v={R.s3} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className={`text-left ${muted}`}>
                {[R.date, R.expected, R.checkedIn, R.onTime, R.flagged, R.blockedShort, R.sentHome].map((h, i) => (
                  <th key={h.en} className={`${cell} ${i ? 'text-right' : ''}`}><Bi v={h} sub="" /></th>
                ))}
                <th className={`${cell} w-32`}><Bi v={R.checkinRate} sub="" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge print:divide-gray-200">
              {[...daily].reverse().map((d) => {
                const r = d.expected ? d.checkedIn / d.expected : 0
                return (
                  <tr key={d.date} className="break-inside-avoid text-frost tabular-nums print:text-black">
                    <td className="px-3 py-1.5">{dayLabel(d.date)}</td>
                    <td className="px-3 py-1.5 text-right">{d.expected}</td>
                    <td className="px-3 py-1.5 text-right">{d.checkedIn}</td>
                    <td className="px-3 py-1.5 text-right">{d.onTime}</td>
                    <td className="px-3 py-1.5 text-right">{d.flagged || ''}</td>
                    <td className="px-3 py-1.5 text-right">{d.blocked || ''}</td>
                    <td className="px-3 py-1.5 text-right">{d.sentHome || ''}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blueprint/10 print:bg-gray-200">
                          <div className="h-full rounded-full bg-frost print:bg-gray-700" style={{ width: `${r * 100}%` }} />
                        </div>
                        <span className="w-9 text-right">{pct(r)}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={4} v={R.s4} />
        <div className="grid gap-6 md:grid-cols-2">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${muted}`}>
                <th className={cell}><Bi v={R.item} sub="" /></th>
                <th className={`${cell} text-right`}><Bi v={R.missingCount} sub="" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge print:divide-gray-200">
              {PPE_ITEMS.map((p) => (
                <tr key={p.key}>
                  <td className={cell}><Bi v={p.label} className="text-ice print:text-black" /></td>
                  <td className={`${cell} text-right text-frost tabular-nums print:text-black`}>{ppeMissing[p.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-3">
            {[
              [R.unfit, summary.unfit],
              [R.flagged, summary.flagged],
              [R.sentHome, summary.sentHome],
            ].map(([label, value]) => (
              <div key={label.en} className="hairline flex items-center justify-between rounded-xl px-4 py-3 print:border print:border-gray-300">
                <Bi v={label} className="text-xs text-mist print:text-black" />
                <span className="font-display text-xl text-ice tabular-nums print:text-black">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={5} v={R.s5} />
        {hazards.length === 0 ? (
          <Bi v={R.none} className="text-mist" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${muted}`}>
                {[R.date, R.category, R.status].map((h) => (
                  <th key={h.en} className={cell}><Bi v={h} sub="" /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge print:divide-gray-200">
              {hazards.slice(0, 12).map((h) => (
                <tr key={h.id}>
                  <td className={`${cell} text-mist tabular-nums print:text-black`}>{fmtDate(h.createdAt, 'vi')}</td>
                  <td className={cell}>
                    <Bi v={HAZARD_CATEGORIES[h.category]} className="text-ice print:text-black" />
                    {h.text && <span className={`mt-0.5 block text-xs ${muted}`}>{typeof h.text === 'string' ? h.text : `${h.text.vi} / ${h.text.en}`}</span>}
                  </td>
                  <td className={cell}><Bi v={h.status === 'resolved' ? R.resolved : R.open} className="text-frost print:text-black" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={6} v={R.s6} />
        {incidents.length === 0 ? (
          <Bi v={R.none} className="text-mist" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${muted}`}>
                {[R.incident, R.date, R.severity, R.actions, R.status].map((h) => (
                  <th key={h.en} className={cell}><Bi v={h} sub="" /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge print:divide-gray-200">
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td className={cell}>
                    <span className="font-mono text-xs text-mist print:text-black">{i.id}</span>
                    <Bi v={VIOLATIONS[i.type].label} className="mt-0.5 block text-ice print:text-black" />
                  </td>
                  <td className={`${cell} text-mist tabular-nums print:text-black`}>{fmtDate(i.createdAt, 'vi')}</td>
                  <td className={cell}><Bi v={SEVERITY[i.severity]} className="text-frost print:text-black" /></td>
                  <td className={`${cell} text-frost tabular-nums print:text-black`}>
                    {i.actions.filter((a) => a.done).length}/{i.actions.length}
                  </td>
                  <td className={cell}><Bi v={INCIDENT_STATUS[i.status]} className="text-frost print:text-black" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8 break-inside-avoid">
        <SectionTitle n={7} v={R.s7} />
        <div className="grid grid-cols-2 gap-6">
          {[
            [R.preparedBy, preparer],
            [R.approvedBy, hse],
          ].map(([label, user]) => (
            <div key={label.en}>
              <p className={`text-xs ${muted}`}>
                {label.vi} / {label.en}
              </p>
              <div className="mt-10 border-t border-edge pt-2 print:border-gray-400">
                <p className="font-medium text-ice print:text-black">{user.name}</p>
                <p className={`text-xs ${muted}`}>
                  {user.role.vi} / {user.role.en}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Bi v={R.integrity} className={`mt-6 block text-xs ${muted}`} sub={muted} />
      </section>
    </article>
  )
}

export default function CompanyDetail() {
  const { id } = useParams()
  const { state, lang, t } = useDemo()
  const company = companyById(id)
  const [days, setDays] = useState(30)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async (d = days) => {
    setLoading(true)
    const res = await request('GET', `/api/companies/${id}/report?days=${d}`, null, { incidents: state.incidents })
    setReport(res.status === 200 ? res.body : null)
    setLoading(false)
  }

  useEffect(() => {
    setReport(null)
    if (company) generate(30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!company) {
    return (
      <Card>
        <EmptyState title={t('co.notFound')} body={<Link to="/companies" className="text-blueprint">{t('co.back')}</Link>} />
      </Card>
    )
  }

  const exportDaily = () =>
    downloadCsv(
      `${company.id}-daily-register-${report.period.to}.csv`,
      ['date', 'expected', 'checked_in', 'on_time', 'cleared_first_time', 'flagged', 'blocked', 'sent_home', 'checkin_rate'],
      report.daily.map((d) => [d.date, d.expected, d.checkedIn, d.onTime, d.firstTimeClear, d.flagged, d.blocked, d.sentHome, d.expected ? (d.checkedIn / d.expected).toFixed(3) : '']),
    )

  const exportCheckins = () => {
    const names = new Map(report.workers.map((w) => [w.id, w]))
    downloadCsv(
      `${company.id}-checkins-${report.period.from}_${report.period.to}.csv`,
      ['checkin_id', 'date', 'submitted_at', 'worker_id', 'worker_name', 'trade', 'on_time', 'helmet', 'vest', 'boots', 'gloves', 'ai_helmet', 'ai_vest', 'ai_confidence', 'fit', 'initial_status', 'final_status', 'review', 'hazard_id'],
      [...report.checkins]
        .sort((a, b) => a.submittedAt - b.submittedAt)
        .map((c) => {
          const w = names.get(c.workerId)
          return [
            c.id, c.date, new Date(c.submittedAt).toISOString(), c.workerId, w?.name, w?.trade.en, c.onTime,
            c.ppe.helmet, c.ppe.vest, c.ppe.boots, c.ppe.gloves, c.ai?.helmet, c.ai?.vest, c.ai?.confidence,
            c.fitness.fit, c.initialStatus, c.status, c.review?.outcome ?? '', c.hazardId ?? '',
          ]
        }),
    )
  }

  return (
    <>
      <div className="print:hidden">
        <Link to="/companies" className="mb-4 inline-flex items-center gap-1.5 text-sm text-fog hover:text-frost">
          <ArrowLeft size={14} aria-hidden /> {t('co.back')}
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow !text-[11px]">{COMPANY_ROLE[company.role][lang]} · {company.taxCode}</p>
            <h1 className="mt-1 font-display text-[28px] leading-tight font-medium text-skywash">{company.name.vi}</h1>
            <p className="text-sm text-fog">{company.name.en} · {bi(byId(SITES, company.siteId).name, lang)}</p>
          </div>
        </div>

        <Card className="mb-6 flex flex-wrap items-end gap-4 !p-5">
          <div className="w-48">
            <Field label={t('rep.period')}>
              <select className="field" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>{t('rep.last7')}</option>
                <option value={30}>{t('rep.last30')}</option>
              </select>
            </Field>
          </div>
          <button className="btn btn-cta" onClick={() => generate()} disabled={loading}>
            {loading ? <Loader size={15} className="animate-spin" aria-hidden /> : <Sparkles size={15} aria-hidden />}
            {loading ? t('rep.generating') : t('co.generate')}
          </button>
          {report && (
            <div className="ml-auto flex flex-wrap gap-2">
              <button className="btn btn-ghost" onClick={() => window.print()}>
                <Printer size={15} aria-hidden /> {t('rep.print')}
              </button>
              <button className="btn btn-outline" onClick={exportDaily}>
                <FileSpreadsheet size={15} aria-hidden /> {t('co.csvDaily')}
              </button>
              <button className="btn btn-outline" onClick={exportCheckins}>
                <FileSpreadsheet size={15} aria-hidden /> {t('co.csvCheckins')}
              </button>
            </div>
          )}
        </Card>
      </div>

      {report ? (
        <CompanyReport report={report} />
      ) : (
        <Card className="print:hidden">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader size={22} className="animate-spin text-frost" aria-hidden />
            <p className="text-sm text-fog">{t('rep.generating')}</p>
          </div>
        </Card>
      )}
    </>
  )
}
