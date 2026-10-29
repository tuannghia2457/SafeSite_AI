import { Fragment, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronDown, ChevronRight, Cpu, Database, FileText, HardDrive, Monitor, Server, ShieldCheck, Smartphone } from 'lucide-react'
import { TABLE_INFO, db } from '../backend/db'
import { Card, CardTitle, PageHeader, Tabs } from '../components/ui'
import { bi, fmtTime } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const ENDPOINTS = [
  ['POST', '/api/checkins', 'sys.ep.checkin'],
  ['PATCH', '/api/checkins/:id', 'sys.ep.review'],
  ['PATCH', '/api/hazards/:id', 'sys.ep.hazard'],
  ['GET', '/api/companies/:id/report?days=30', 'sys.ep.report'],
  ['POST', '/api/admin/reset', 'sys.ep.reset'],
]

const METHOD_STYLE = { GET: 'text-good', POST: 'text-blueprint', PATCH: 'text-warning' }

function Arch() {
  const { t } = useDemo()
  const Box = ({ Icon, title, sub }) => (
    <div className="hairline flex min-w-0 items-start gap-3 rounded-xl bg-blueprint/5 p-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-frost" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ice">{title}</p>
        <p className="text-xs text-fog">{sub}</p>
      </div>
    </div>
  )
  const Arrow = () => <ChevronRight size={16} className="mx-auto hidden shrink-0 self-center text-fog lg:block" aria-hidden />
  return (
    <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr_auto_1fr]">
      <Box Icon={Smartphone} title={t('sys.arch.app')} sub={t('sys.arch.appSub')} />
      <Arrow />
      <div className="space-y-2">
        <Box Icon={Server} title={t('sys.arch.api')} sub="POST /api/checkins" />
        <div className="grid grid-cols-2 gap-2">
          <Box Icon={ShieldCheck} title={t('pipeline.validate')} sub={t('sys.arch.validateSub')} />
          <Box Icon={Cpu} title={t('pipeline.ai')} sub={t('sys.arch.aiSub')} />
        </div>
      </div>
      <Arrow />
      <div className="space-y-2">
        <Box Icon={Database} title={t('sys.arch.db')} sub={t('sys.arch.dbSub')} />
        <Box Icon={HardDrive} title={t('sys.arch.storage')} sub={t('sys.arch.storageSub')} />
      </div>
      <Arrow />
      <div className="space-y-2">
        <Box Icon={Monitor} title={t('sys.arch.board')} sub={t('sys.arch.boardSub')} />
        <Box Icon={FileText} title={t('sys.arch.reports')} sub={t('sys.arch.reportsSub')} />
      </div>
    </div>
  )
}

function ApiLog() {
  const { lang, t } = useDemo()
  const [open, setOpen] = useState(null)
  const log = useLiveQuery(() => db.apiLog.orderBy('seq').reverse().limit(40).toArray(), []) ?? []

  return (
    <Card className="!p-0">
      <div className="flex items-center justify-between border-b border-edge px-6 py-4">
        <h3 className="font-semibold text-ice">{t('sys.log')}</h3>
        <span className="text-xs text-fog">{t('sys.logHint')}</span>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-9" />
            <col className="w-20" />
            <col className="w-16" />
            <col />
            <col className="w-12" />
            <col className="w-20" />
          </colgroup>
          <tbody className="divide-y divide-edge">
            {log.map((e) => (
              <Fragment key={e.seq}>
                <tr className="cursor-pointer hover:bg-blueprint/5" onClick={() => setOpen(open === e.seq ? null : e.seq)}>
                  <td className="w-6 py-2.5 pl-4 text-fog">{open === e.seq ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                  <td className="px-2 py-2.5 font-mono text-xs text-fog tabular-nums">{fmtTime(e.at, lang)}</td>
                  <td className={`px-2 py-2.5 font-mono text-xs font-semibold ${METHOD_STYLE[e.method]}`}>{e.method}</td>
                  <td className="truncate px-2 py-2.5 font-mono text-xs text-frost" title={e.path}>{e.path}</td>
                  <td className={`px-2 py-2.5 font-mono text-xs ${e.status < 300 ? 'text-good' : 'text-critical'}`}>{e.status}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs text-fog tabular-nums">{e.ms} ms</td>
                </tr>
                {open === e.seq && (
                  <tr>
                    <td colSpan={6} className="px-4 pb-4">
                      <div className="grid gap-3 lg:grid-cols-2">
                        {[
                          ['sys.request', e.request],
                          ['sys.response', e.response],
                        ].map(([label, body]) => (
                          <div key={label}>
                            <p className="mb-1 text-xs text-fog">{t(label)}</p>
                            <pre className="max-h-64 overflow-auto rounded-lg bg-canvas/70 p-3 font-mono text-[11px] leading-relaxed text-mist">
                              {JSON.stringify(body ?? null, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                      {e.steps && (
                        <p className="mt-2 font-mono text-[11px] text-fog">
                          {e.steps.map((s) => `${s.key} ${s.ms}ms`).join('  →  ')}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

const cellText = (v) => {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  if (typeof v === 'string' && v.startsWith('data:image')) return `<image ${Math.round((v.length * 3) / 4 / 1024)} KB>`
  // Epoch-millisecond timestamps are stored as numbers; show them readably.
  if (typeof v === 'number' && v > 1e12) return new Date(v).toISOString().replace('T', ' ').slice(0, 19)
  return String(v)
}

function DbBrowser() {
  const { lang, t } = useDemo()
  const [table, setTable] = useState('checkins')
  const counts = useLiveQuery(() => Promise.all(db.tables.map((tb) => tb.count())), []) ?? []
  const rows =
    useLiveQuery(() => {
      const tb = db.table(table)
      const pk = tb.schema.primKey.name
      return (pk === 'seq' ? tb.orderBy('seq').reverse() : tb.toCollection().reverse()).limit(25).toArray()
    }, [table]) ?? []
  const schema = db.table(table).schema
  const cols = rows[0] ? Object.keys(rows[0]).slice(0, 9) : []

  return (
    <Card className="!p-0">
      <div className="space-y-3 border-b border-edge px-6 py-4">
        <h3 className="font-semibold text-ice">{t('sys.db')}</h3>
        <Tabs value={table} onChange={setTable} items={db.tables.map((tb, i) => ({ value: tb.name, label: tb.name, count: counts[i] }))} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 px-6 py-3 text-xs text-fog">
        <span>{bi(TABLE_INFO[table], lang)}</span>
        <span>
          {t('sys.pk')}: <span className="font-mono text-frost">{schema.primKey.name}</span>
        </span>
        <span>
          {t('sys.indexes')}: <span className="font-mono text-frost">{schema.indexes.map((i) => i.name).join(', ') || '—'}</span>
        </span>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-canvas">
            <tr className="text-left text-fog">
              {cols.map((c) => (
                <th key={c} className="px-3 py-2 font-mono font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.map((r, i) => (
              <tr key={i} className="font-mono text-mist">
                {cols.map((c) => (
                  <td key={c} className="max-w-56 truncate px-3 py-1.5" title={cellText(r[c])}>
                    {cellText(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-6 py-8 text-center text-sm text-fog">{t('sys.emptyTable')}</p>}
      </div>
    </Card>
  )
}

export default function System() {
  const { t } = useDemo()
  return (
    <>
      <PageHeader title={t('sys.title')} subtitle={t('sys.subtitle')} />
      <Card className="mb-4">
        <CardTitle>{t('sys.arch')}</CardTitle>
        <Arch />
        <p className="mt-4 text-xs text-fog">{t('sys.prodNote')}</p>
      </Card>

      <Card className="mb-4 !p-0">
        <div className="border-b border-edge px-6 py-4">
          <h3 className="font-semibold text-ice">{t('sys.endpoints')}</h3>
        </div>
        <ul className="divide-y divide-edge">
          {ENDPOINTS.map(([m, p, k]) => (
            <li key={p} className="grid gap-1 px-6 py-3 sm:grid-cols-[64px_minmax(0,320px)_1fr] sm:items-center">
              <span className={`font-mono text-xs font-semibold ${METHOD_STYLE[m]}`}>{m}</span>
              <span className="truncate font-mono text-xs text-frost">{p}</span>
              <span className="text-sm text-mist">{t(k)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <ApiLog />
        <DbBrowser />
      </div>
    </>
  )
}
