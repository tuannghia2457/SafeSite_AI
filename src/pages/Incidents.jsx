import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { Card, EmptyState, IncidentStatusChip, PageHeader, ProgressBar, SeverityChip, Tabs, UserLabel } from '../components/ui'
import { SITES, VIOLATIONS, byId } from '../data/mockData'
import { bi, fmtDate } from '../lib/format'
import { useDemo } from '../state/DemoStore'

export default function Incidents() {
  const { state, lang, t } = useDemo()
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')

  const sorted = [...state.incidents].sort((a, b) => b.createdAt - a.createdAt)
  const filters = {
    active: (i) => i.status !== 'resolved',
    open: (i) => i.status === 'open',
    in_progress: (i) => i.status === 'in_progress',
    resolved: (i) => i.status === 'resolved',
    all: () => true,
  }
  const list = sorted.filter(filters[tab])
  const now = Date.now()

  return (
    <>
      <PageHeader title={t('inc.title')} subtitle={t('inc.subtitle')} />
      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={['active', 'open', 'in_progress', 'resolved', 'all'].map((k) => ({
            value: k,
            label: t(`inc.tab.${k}`),
            count: state.incidents.filter(filters[k]).length,
          }))}
        />
      </div>

      <Card className="overflow-x-auto !p-0">
        {list.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title={t('inc.empty')} body={t('inc.emptyBody')} />
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-edge text-left text-xs text-fog">
                <th className="px-5 py-3 font-medium">{t('inc.col.id')}</th>
                <th className="px-3 py-3 font-medium">{t('inc.col.violation')}</th>
                <th className="px-3 py-3 font-medium">{t('common.site')}</th>
                <th className="px-3 py-3 font-medium">{t('common.severity')}</th>
                <th className="px-3 py-3 font-medium">{t('common.assignee')}</th>
                <th className="px-3 py-3 font-medium">{t('common.dueDate')}</th>
                <th className="px-3 py-3 font-medium">{t('inc.col.actions')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {list.map((i) => {
                const done = i.actions.filter((a) => a.done).length
                const overdue = i.status !== 'resolved' && i.dueDate < now
                return (
                  <tr
                    key={i.id}
                    onClick={() => navigate(`/incidents/${i.id}`)}
                    className="cursor-pointer transition-colors hover:bg-blueprint/5"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-mist">{i.id}</td>
                    <td className="px-3 py-3.5 text-ice">{VIOLATIONS[i.type].label[lang]}</td>
                    <td className="max-w-48 truncate px-3 py-3.5 text-mist">{bi(byId(SITES, i.siteId).name, lang)}</td>
                    <td className="px-3 py-3.5">
                      <SeverityChip severity={i.severity} />
                    </td>
                    <td className="px-3 py-3.5">
                      <UserLabel userId={i.assignee} />
                    </td>
                    <td className={`px-3 py-3.5 tabular-nums ${overdue ? 'text-critical' : 'text-mist'}`}>
                      {fmtDate(i.dueDate, lang)}
                      {overdue && <span className="ml-1 text-xs">({t('inc.overdue')})</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={done} total={i.actions.length} className="w-16" />
                        <span className="text-xs text-fog tabular-nums">
                          {done}/{i.actions.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <IncidentStatusChip status={i.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}
