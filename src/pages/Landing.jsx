import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Cctv, ClipboardCheck, Factory, FileText, Globe, Handshake, Warehouse } from 'lucide-react'
import Logo from '../components/Logo'
import CameraFrame from '../components/CameraFrame'
import SiteHeader, { scrollTo } from '../components/SiteHeader'
import { Eyebrow } from '../components/ui'
import { WORKFLOW } from '../components/Workflow'
import { CAMERAS, buildLiveWorkers } from '../data/mockData'
import { useDemo } from '../state/DemoStore'

const HERO_CAMERA = CAMERAS[0]
const heroWorkers = buildLiveWorkers(HERO_CAMERA).map((w, i) => (i === 0 ? { ...w, x: 245, y: 150 } : w))

export default function Landing() {
  const { t } = useDemo()

  const features = [
    { key: 'monitoring', Icon: Cctv },
    { key: 'management', Icon: ClipboardCheck },
    { key: 'reporting', Icon: FileText },
  ]
  const customers = [
    { key: 'construction', Icon: Building2 },
    { key: 'factories', Icon: Factory },
    { key: 'parks', Icon: Warehouse },
    { key: 'suppliers', Icon: Handshake },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="bg-blueprint-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[600px]" aria-hidden />

      <SiteHeader
        sections={[
          { id: 'workflow', label: t('landing.nav.workflow') },
          { id: 'features', label: t('landing.nav.features') },
          { id: 'customers', label: t('landing.nav.customers') },
        ]}
        pages={[{ to: '/evidence', label: t('landing.nav.evidence') }]}
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-24 text-center">
          <Eyebrow>{t('landing.eyebrow')}</Eyebrow>
          <h1 className="mt-6 font-display text-6xl leading-[1.05] font-medium text-skywash md:text-8xl">SafeSite AI</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-mist">{t('landing.subtitle')}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/monitoring" className="btn btn-cta">
              {t('landing.start')} <ArrowRight size={16} aria-hidden />
            </Link>
            <button onClick={() => scrollTo('workflow')} className="btn btn-ghost">
              {t('landing.seeWorkflow')}
            </button>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="glass-modal overflow-hidden p-2">
              <div className="relative overflow-hidden rounded-xl">
                <div className="aspect-video">
                  <CameraFrame scene={HERO_CAMERA.scene} workers={heroWorkers} zone={HERO_CAMERA.zone} highlightId={0} />
                </div>
                <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-canvas/75 px-2 py-1 font-mono text-xs text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-critical" /> LIVE · CAM-01
                </span>
              </div>
            </div>
            <div className="glass-modal absolute -right-4 -bottom-8 hidden w-72 p-4 text-left md:block">
              <p className="eyebrow !text-[11px] !text-critical">{t('landing.heroAlert.eyebrow')}</p>
              <p className="mt-1 font-medium text-ice">{t('landing.heroAlert.title')}</p>
              <p className="mt-1 text-xs text-fog">{t('landing.heroAlert.body')}</p>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="mx-auto max-w-[1200px] scroll-mt-8 px-6 py-24 text-center">
          <Eyebrow>{t('landing.workflow.eyebrow')}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium text-ice md:text-[44px]">{t('landing.workflow.title')}</h2>
          <p className="mx-auto mt-4 max-w-[640px] text-mist">{t('landing.workflow.body')}</p>

          <ol className="relative mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
            <span className="absolute top-8 right-[10%] left-[10%] hidden h-px bg-edge md:block" aria-hidden />
            {WORKFLOW.map(({ key, to, Icon }, i) => (
              <li key={key} className="relative flex flex-col items-center">
                <Link
                  to={to}
                  className="hairline relative flex size-16 items-center justify-center rounded-full bg-canvas transition-colors hover:bg-blueprint/10"
                >
                  <Icon size={24} className="text-frost" strokeWidth={1.5} aria-hidden />
                </Link>
                <p className="eyebrow mt-5 !text-[11px]">0{i + 1}</p>
                <h3 className="mt-1 font-medium text-ice">{t(`workflow.${key}.title`)}</h3>
                <p className="mt-2 max-w-[240px] text-sm text-fog">{t(`workflow.${key}.desc`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-[1200px] scroll-mt-8 px-6 py-24 text-center">
          <Eyebrow>{t('landing.features.eyebrow')}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium text-ice md:text-[44px]">{t('landing.features.title')}</h2>
          <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
            {features.map(({ key, Icon }) => (
              <div key={key} className="glass-card p-6">
                <span className="hairline flex size-12 items-center justify-center rounded-full bg-blueprint/5">
                  <Icon size={20} className="text-frost" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-medium text-ice">{t(`landing.features.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{t(`landing.features.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Customers */}
        <section id="customers" className="mx-auto max-w-[1200px] scroll-mt-8 px-6 py-24 text-center">
          <Eyebrow>{t('landing.customers.eyebrow')}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium text-ice md:text-[44px]">{t('landing.customers.title')}</h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {customers.map(({ key, Icon }) => (
              <div key={key} className="glass-card flex items-center gap-3 p-5 text-left">
                <Icon size={20} className="shrink-0 text-frost" strokeWidth={1.5} aria-hidden />
                <span className="text-sm text-mist">{t(`landing.customers.${key}`)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <div className="glass-card px-6 py-16">
            <Globe size={28} className="mx-auto text-frost" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-6 font-display text-4xl font-medium text-skywash md:text-[44px]">{t('landing.closing.title')}</h2>
            <p className="mx-auto mt-4 max-w-[640px] text-mist">{t('landing.closing.body')}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard" className="btn btn-cta">
                {t('landing.openDemo')} <ArrowRight size={16} aria-hidden />
              </Link>
              <Link to="/evidence" className="btn btn-ghost">
                {t('landing.seeEvidence')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-edge">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-fog">
          <Logo />
          <span>{t('landing.footer')}</span>
        </div>
      </footer>
    </div>
  )
}
