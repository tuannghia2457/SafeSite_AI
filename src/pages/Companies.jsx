import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Building2, Globe2 } from 'lucide-react'
import { buildCompanyReport } from '../backend/report'
import { Card, PageHeader, ProgressBar } from '../components/ui'
import { COMPANIES, COMPANY_ROLE, CONTRACTS, companyById } from '../data/companies'
import { SITES, byId } from '../data/mockData'
import { bi, pct } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const fmtRate = (r) => (r == null ? '—' : pct(r))

export default function Companies() {
  const { state, lang, t } = useDemo()
  const reports = useLiveQuery(
    () => Promise.all(COMPANIES.map((c) => buildCompanyReport(c.id, 30, { incidents: state.incidents }))),
    [state.incidents],
  )

  return (
    <>
      <PageHeader title={t('co.title')} subtitle={t('co.subtitle')} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COMPANIES.map((c, i) => {
          const r = reports?.[i]
          const contracts = CONTRACTS.filter((k) => k.companyId === c.id)
          const metrics = r && [
            [t('co.m.checkin'), r.summary.checkinRate],
            [t('co.m.firstClear'), r.summary.firstTimeClearRate],
            [t('co.m.closure'), r.summary.verifiedClosureRate],
          ]
          return (
            <Link key={c.id} to={`/companies/${c.id}`} className="group">
              <Card className="flex h-full flex-col !p-5 transition-colors group-hover:bg-blueprint/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ice">{c.name.vi}</p>
                    <p className="text-xs text-fog">{c.name.en}</p>
                  </div>
                  <span className="chip shrink-0">{COMPANY_ROLE[c.role][lang]}</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-mist">
                  <Building2 size={12} aria-hidden /> {bi(byId(SITES, c.siteId).name, lang)}
                  {c.parentId && <span className="text-fog">· {t('co.under', { name: companyById(c.parentId).short })}</span>}
                </p>
                <ul className="mt-2 space-y-1">
                  {contracts.map((k) => (
                    <li key={k.id} className="flex items-center gap-1.5 text-xs text-mist">
                      <Globe2 size={12} className="shrink-0 text-fog" aria-hidden />
                      <span className="truncate">
                        {k.via ? `${k.via} → ${k.client}` : k.client}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex-1 space-y-3">
                  {metrics
                    ? metrics.map(([label, value]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs">
                            <span className="text-fog">{label}</span>
                            <span className="text-frost tabular-nums">{fmtRate(value)}</span>
                          </div>
                          <ProgressBar value={value ?? 0} total={1} className="mt-1" />
                        </div>
                      ))
                    : <p className="text-xs text-fog">…</p>}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-edge pt-3 text-xs">
                  <span className="text-fog">
                    {r ? t('co.footer', { workers: r.workforce, incidents: r.summary.incidents, hazards: r.summary.hazards }) : ''}
                  </span>
                  <ArrowRight size={14} className="text-fog group-hover:text-frost" aria-hidden />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
      <p className="mt-6 text-xs text-fog">{t('co.disclaimer')}</p>
    </>
  )
}
