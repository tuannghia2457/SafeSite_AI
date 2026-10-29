import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Ban,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  ExternalLink,
  PenLine,
  Quote,
  TriangleAlert,
} from 'lucide-react'
import Logo from '../components/Logo'
import SiteHeader from '../components/SiteHeader'
import { Eyebrow } from '../components/ui'
import {
  CASES,
  CLAIMS_WE_DONT_MAKE,
  COMPARATORS,
  COMPETITORS,
  EVIDENCE_FLOW,
  FAILURE_FLOW,
  HYPOTHESES,
  IFC_QUOTE,
  LEVELS,
  MOAT_LADDER,
  PILOT_METRICS,
  SOURCES,
  STATS,
} from '../data/evidence'
import { bi, pct } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const TONE = {
  good: { cls: 'text-good bg-good/12', Icon: CircleCheck },
  warning: { cls: 'text-warning bg-warning/12', Icon: CircleAlert },
  critical: { cls: 'text-critical bg-critical/12', Icon: TriangleAlert },
}

function FactStatus({ status }) {
  const { t } = useDemo()
  const { cls, Icon } = {
    verified: { cls: 'text-good bg-good/12', Icon: CircleCheck },
    corrected: { cls: 'text-warning bg-warning/12', Icon: PenLine },
    unverified: { cls: 'text-fog bg-steel/60', Icon: CircleHelp },
  }[status]
  return (
    <span className={`chip ${cls}`} title={t(`evidence.status.${status}Hint`)}>
      <Icon size={12} aria-hidden /> {t(`evidence.status.${status}`)}
    </span>
  )
}

function LevelBadge({ level }) {
  const { lang } = useDemo()
  const { tone, ...label } = LEVELS[level]
  const { cls, Icon } = TONE[tone]
  return (
    <span className={`chip ${cls} whitespace-normal`}>
      <Icon size={12} className="shrink-0" aria-hidden /> {label[lang]}
    </span>
  )
}

function Section({ id, eyebrow, title, body, children }) {
  return (
    <section id={id} className="mx-auto max-w-[1200px] scroll-mt-8 px-6 py-20">
      <div className="text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 font-display text-3xl font-medium text-ice md:text-[44px] md:leading-tight">{title}</h2>
        {body && <p className="mx-auto mt-4 max-w-[640px] text-mist">{body}</p>}
      </div>
      <div className="mt-12">{children}</div>
    </section>
  )
}

/** Single-series horizontal bar chart: FDI inflow per inhabitant, 2024 (derived). */
function FdiPerCapitaChart() {
  const { lang, t } = useDemo()
  const [asTable, setAsTable] = useState(false)
  const [hover, setHover] = useState(null)
  const rows = COMPARATORS.map((c) => ({ ...c, perCap: c.fdi / c.pop })).sort((a, b) => b.perCap - a.perCap)
  const max = Math.max(...rows.map((r) => r.perCap))
  const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium text-ice">{t('evidence.chart.title')}</h3>
        <button className="text-xs font-medium text-fog hover:text-frost" onClick={() => setAsTable((v) => !v)}>
          {asTable ? t('chart.showChart') : t('chart.showTable')}
        </button>
      </div>
      {asTable ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-fog">
              <th className="py-2 font-medium">{t('evidence.chart.country')}</th>
              <th className="py-2 text-right font-medium">{t('evidence.chart.inflow')}</th>
              <th className="py-2 text-right font-medium">{t('evidence.chart.perCapita')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.map((r) => (
              <tr key={r.fdi} className="text-frost tabular-nums">
                <td className="py-2">{bi(r.country, lang)}</td>
                <td className="py-2 text-right">${(r.fdi / 1000).toFixed(1)}B</td>
                <td className="py-2 text-right">{fmt(r.perCap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li
              key={r.fdi}
              className="relative grid grid-cols-[96px_1fr] items-center gap-3"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className={`truncate text-sm ${r.home ? 'font-semibold text-ice' : 'text-mist'}`}>{bi(r.country, lang)}</span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-5 rounded-r-[4px] bg-series-1 transition-opacity ${hover != null && hover !== i ? 'opacity-40' : ''}`}
                  style={{ width: `max(4px, ${(r.perCap / max) * 85}%)` }}
                />
                <span className="text-xs text-frost tabular-nums">{fmt(r.perCap)}</span>
              </div>
              {hover === i && (
                <div className="glass-modal pointer-events-none absolute top-full left-24 z-10 mt-1 w-64 p-3 text-xs">
                  <p className="font-medium text-ice">{bi(r.country, lang)}</p>
                  <p className="mt-1 text-mist">
                    {t('evidence.chart.inflow')}: <span className="text-frost tabular-nums">${(r.fdi / 1000).toFixed(1)}B</span>
                  </p>
                  <p className="text-mist">{bi(r.safety, lang)}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-fog">{t('evidence.chart.note')}</p>
    </div>
  )
}

/** The product's North Star, computed live from the demo data. */
function NorthStar() {
  const { state, t } = useDemo()
  const highRisk = state.incidents.filter((i) => i.severity === 'high')
  const closed = highRisk.filter(
    (i) => i.status === 'resolved' && i.actions.length > 0 && i.actions.every((a) => a.done) && i.resolvedAt <= i.dueDate,
  )
  const rate = highRisk.length ? closed.length / highRisk.length : 0

  return (
    <div className="glass-modal flex flex-col justify-between gap-6 p-6">
      <div>
        <p className="eyebrow !text-[11px]">North Star</p>
        <h3 className="mt-2 font-display text-2xl font-medium text-ice">{t('evidence.northStar.title')}</h3>
        <p className="mt-2 text-sm text-mist">{t('evidence.northStar.def')}</p>
      </div>
      <div className="hairline rounded-xl p-4">
        <p className="text-xs text-fog">{t('evidence.northStar.live')}</p>
        <p className="mt-1 font-display text-5xl font-medium text-skywash tabular-nums">{pct(rate)}</p>
        <p className="mt-1 text-xs text-fog">{t('evidence.northStar.count', { closed: closed.length, total: highRisk.length })}</p>
      </div>
      <Link to="/incidents" className="btn btn-ghost self-start">
        {t('evidence.northStar.cta')} <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  )
}

function FlowRow({ steps, failure = false }) {
  const { lang } = useDemo()
  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {steps.map((s, i) => (
        <li key={s.en} className="flex items-center">
          {i > 0 && <ChevronRight size={14} className={failure ? 'mx-1 text-critical/70' : 'mx-1 text-fog'} aria-hidden />}
          <span
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              failure ? 'bg-critical/10 text-critical' : 'hairline bg-blueprint/5 text-frost'
            }`}
          >
            {bi(s, lang)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function Evidence() {
  const { lang, t } = useDemo()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="bg-blueprint-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[600px]" aria-hidden />

      <SiteHeader
        sections={[
          { id: 'numbers', label: t('evidence.nav.numbers') },
          { id: 'verdict', label: t('evidence.nav.verdict') },
          { id: 'claims', label: t('evidence.nav.claims') },
          { id: 'sources', label: t('evidence.nav.sources') },
        ]}
        pages={[{ to: '/', label: t('evidence.nav.product') }]}
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-6 pt-16 pb-12 text-center">
          <Eyebrow>{t('evidence.eyebrow')}</Eyebrow>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[1.1] font-medium text-skywash md:text-6xl">
            {t('evidence.title')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-mist">{t('evidence.subtitle')}</p>
          <p className="mx-auto mt-4 max-w-2xl text-xs text-fog">{t('evidence.method')}</p>
        </section>

        {/* 1. Numbers */}
        <Section id="numbers" eyebrow={t('evidence.numbers.eyebrow')} title={t('evidence.numbers.title')} body={t('evidence.numbers.body')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.factId} className="glass-card flex flex-col p-5">
                <p className="font-display text-3xl font-medium text-ice tabular-nums">
                  {s.value}
                  {s.unit && <span className="block font-sans text-xs font-normal text-mist">{bi(s.unit, lang)}</span>}
                </p>
                <p className="mt-2 text-sm text-mist">{bi(s.label, lang)}</p>
                <p className="mt-3 flex-1 text-xs text-fog">{bi(s.note, lang)}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-edge pt-3">
                  <FactStatus status={s.status} />
                  <a href={s.source.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blueprint hover:text-ice">
                    {s.source.title} <ExternalLink size={11} aria-hidden />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-mist">{t('evidence.numbers.takeaway')}</p>
        </Section>

        {/* 2. Verdict per hypothesis */}
        <Section id="verdict" eyebrow={t('evidence.verdict.eyebrow')} title={t('evidence.verdict.title')} body={t('evidence.verdict.body')}>
          <div className="glass-card overflow-hidden !p-0">
            <ul className="divide-y divide-edge">
              {HYPOTHESES.map((h) => (
                <li key={h.claim.en} className="grid items-center gap-2 px-6 py-4 sm:grid-cols-[1fr_240px]">
                  <span className="text-sm text-ice">{bi(h.claim, lang)}</span>
                  <span className="sm:justify-self-end">
                    <LevelBadge level={h.level} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 3. No simple safety → FDI pattern */}
        <Section eyebrow={t('evidence.pattern.eyebrow')} title={t('evidence.pattern.title')} body={t('evidence.pattern.body')}>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <FdiPerCapitaChart />
            </div>
            <div className="glass-card overflow-x-auto !p-0 lg:col-span-3">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-edge text-left text-xs text-fog">
                    <th className="px-5 py-3 font-medium">{t('evidence.chart.country')}</th>
                    <th className="px-3 py-3 font-medium">{t('evidence.table.safety')}</th>
                    <th className="px-5 py-3 font-medium">{t('evidence.table.consequence')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {COMPARATORS.map((c) => (
                    <tr key={c.fdi} className="align-top">
                      <td className={`px-5 py-3 ${c.home ? 'font-semibold text-ice' : 'text-frost'}`}>{bi(c.country, lang)}</td>
                      <td className="px-3 py-3 text-mist">{bi(c.safety, lang)}</td>
                      <td className="px-5 py-3 text-mist">{bi(c.consequence, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {['bias', 'reverse'].map((k) => (
              <div key={k} className="hairline flex gap-3 rounded-2xl p-5">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-ice">{t(`evidence.pattern.${k}.title`)}</p>
                  <p className="mt-1 text-sm text-fog">{t(`evidence.pattern.${k}.body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Where the pain is real */}
        <Section eyebrow={t('evidence.pain.eyebrow')} title={t('evidence.pain.title')} body={t('evidence.pain.body')}>
          <figure className="glass-modal mx-auto max-w-4xl p-8 text-center">
            <Quote size={22} className="mx-auto text-frost" aria-hidden />
            <blockquote className="mt-4 font-display text-xl leading-snug text-ice md:text-2xl">
              “{lang === 'vi' ? IFC_QUOTE.vi : IFC_QUOTE.text}”
            </blockquote>
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-fog">
              <a href={IFC_QUOTE.url} target="_blank" rel="noreferrer" className="hover:text-frost">
                {IFC_QUOTE.cite}
              </a>
              <FactStatus status="verified" />
            </figcaption>
          </figure>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {CASES.map((c) => (
              <article key={c.key} className="glass-card flex flex-col p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium text-ice">{bi(c.title, lang)}</h3>
                  <span className="font-mono text-xs text-fog">{c.year}</span>
                </div>
                <p className="mt-3 flex-1 text-sm text-mist">{bi(c.fact, lang)}</p>
                <p className="mt-4 flex gap-2 border-t border-edge pt-3 text-xs text-fog">
                  <CircleAlert size={13} className="mt-px shrink-0 text-warning" aria-hidden />
                  <span>
                    <span className="font-medium text-mist">{t('evidence.caveat')}: </span>
                    {bi(c.caveat, lang)}
                  </span>
                </p>
              </article>
            ))}
          </div>

          <div className="glass-card mt-6 space-y-4 p-6">
            <p className="eyebrow !text-[11px]">{t('evidence.flow.title')}</p>
            <FlowRow steps={EVIDENCE_FLOW} />
            <FlowRow steps={FAILURE_FLOW} failure />
          </div>
        </Section>

        {/* 5. Detection is commoditized */}
        <Section eyebrow={t('evidence.moat.eyebrow')} title={t('evidence.moat.title')} body={t('evidence.moat.body')}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card !p-0">
              <ul className="divide-y divide-edge">
                {COMPETITORS.map((c) => (
                  <li key={c.name} className="flex items-start justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-ice">{c.name}</p>
                      <p className="mt-0.5 text-xs text-fog">{bi(c.does, lang)}</p>
                    </div>
                    <a href={c.url} target="_blank" rel="noreferrer" className="mt-0.5 text-fog hover:text-frost" aria-label={c.name}>
                      <ExternalLink size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <ol className="space-y-3">
              {MOAT_LADDER.map((m, i) => (
                <li
                  key={m.tier.en}
                  className="hairline flex gap-4 rounded-2xl p-4"
                  style={{ background: `rgb(186 214 247 / ${0.02 + i * 0.03})` }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blueprint/10 font-mono text-xs text-frost">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ice">{bi(m.tier, lang)}</p>
                    <p className="mt-0.5 text-sm text-mist">{bi(m.body, lang)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* 6. Claims we don't make */}
        <Section id="claims" eyebrow={t('evidence.claims.eyebrow')} title={t('evidence.claims.title')} body={t('evidence.claims.body')}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CLAIMS_WE_DONT_MAKE.map((c) => (
              <div key={c.claim.en} className="glass-card p-6">
                <p className="flex gap-2 font-medium text-ice">
                  <Ban size={16} className="mt-1 shrink-0 text-critical" aria-hidden />
                  <span className="line-through decoration-critical/60">{bi(c.claim, lang)}</span>
                </p>
                <p className="mt-3 text-sm text-mist">{bi(c.why, lang)}</p>
              </div>
            ))}
            <div className="glass-modal flex flex-col justify-center p-6">
              <p className="eyebrow !text-[11px]">{t('evidence.claims.insteadEyebrow')}</p>
              <p className="mt-3 font-display text-lg leading-snug text-ice">{t('evidence.claims.instead')}</p>
            </div>
          </div>
        </Section>

        {/* 7. How we'll prove it */}
        <Section eyebrow={t('evidence.prove.eyebrow')} title={t('evidence.prove.title')} body={t('evidence.prove.body')}>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="glass-card !p-0 lg:col-span-3">
              <ul className="divide-y divide-edge">
                {PILOT_METRICS.map((m) => (
                  <li key={m.metric.en} className="grid gap-1 px-6 py-4 sm:grid-cols-[140px_1fr]">
                    <span className="eyebrow !text-[11px]">{bi(m.area, lang)}</span>
                    <span className="text-sm text-ice">{bi(m.metric, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <NorthStar />
            </div>
          </div>
        </Section>

        {/* 8. Sources */}
        <Section id="sources" eyebrow={t('evidence.sources.eyebrow')} title={t('evidence.sources.title')}>
          <ol className="glass-card mx-auto max-w-4xl divide-y divide-edge !p-0">
            {SOURCES.map((s, i) => (
              <li key={s.url + i} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <a href={s.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 gap-3 text-sm text-mist hover:text-ice">
                  <span className="font-mono text-xs text-fog">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </a>
                <FactStatus status={s.status} />
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-fog">{t('evidence.disclaimer')}</p>
        </Section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-[1200px] px-6 pb-24 text-center">
          <div className="glass-card px-6 py-14">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-medium text-skywash md:text-[44px] md:leading-tight">
              {t('evidence.closing.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-[640px] text-mist">{t('evidence.closing.body')}</p>
            <Link to="/dashboard" className="btn btn-cta mt-8">
              {t('landing.openDemo')} <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-edge">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-fog">
          <Logo />
          <span>{t('evidence.footer')}</span>
        </div>
      </footer>
    </div>
  )
}

