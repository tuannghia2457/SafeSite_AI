import { NavLink, Outlet, Link } from 'react-router-dom'
import { BellRing, Cctv, ClipboardCheck, FileText, House, LayoutDashboard, Pause, Play, RotateCcw } from 'lucide-react'
import Logo from './Logo'
import Toasts from './Toasts'
import { GuideBanner, WorkflowStepper } from './Workflow'
import { UserAvatar } from './ui'
import { CURRENT_USER, USERS, byId } from '../data/mockData'
import { isOpen } from '../lib/selectors'
import { useDemo } from '../state/DemoStore'

export function LangToggle() {
  const { lang, setLang } = useDemo()
  return (
    <div className="hairline flex rounded-full p-0.5 text-xs font-medium" role="group" aria-label="Language">
      {['vi', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? 'bg-blueprint/15 text-white' : 'text-fog hover:text-frost'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function SimulationToggle() {
  const { state, t, toggleSimulation } = useDemo()
  const on = state.simulation
  return (
    <button onClick={toggleSimulation} className="btn btn-outline btn-sm" title={t('sim.hint')}>
      {on ? (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-good" />
        </span>
      ) : (
        <span className="size-2 rounded-full bg-fog" />
      )}
      <span className="hidden sm:inline">{on ? t('sim.on') : t('sim.off')}</span>
      {on ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
    </button>
  )
}

export default function Layout() {
  const { state, lang, t, reset } = useDemo()
  const newAlerts = state.alerts.filter((a) => a.status === 'new').length
  const openIncidents = state.incidents.filter(isOpen).length
  const me = byId(USERS, CURRENT_USER)

  const nav = [
    { to: '/dashboard', label: t('nav.dashboard'), Icon: LayoutDashboard },
    { to: '/monitoring', label: t('nav.monitoring'), Icon: Cctv },
    { to: '/alerts', label: t('nav.alerts'), Icon: BellRing, badge: newAlerts },
    { to: '/incidents', label: t('nav.incidents'), Icon: ClipboardCheck, badge: openIncidents },
    { to: '/reports', label: t('nav.reports'), Icon: FileText },
  ]

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'hairline bg-blueprint/10 text-white' : 'text-mist hover:bg-blueprint/5 hover:text-frost'
    }`

  return (
    <div className="relative min-h-screen">
      <div className="bg-blueprint-grid pointer-events-none fixed inset-0 print:hidden" aria-hidden />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-edge bg-canvas/80 px-4 py-5 backdrop-blur lg:flex print:hidden">
        <Link to="/" className="mb-8 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, Icon, badge }) => (
            <NavLink key={to} to={to} className={linkCls}>
              <Icon size={17} aria-hidden />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-blueprint/15 px-2 text-xs text-ice tabular-nums">{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-edge pt-4">
          <NavLink to="/" end className={linkCls}>
            <House size={17} aria-hidden /> {t('nav.overview')}
          </NavLink>
        </div>

        <div className="mt-auto space-y-3">
          <button onClick={reset} className="btn btn-outline btn-sm w-full" title={t('nav.resetHint')}>
            <RotateCcw size={13} aria-hidden /> {t('nav.reset')}
          </button>
          <div className="hairline flex items-center gap-3 rounded-2xl p-3">
            <UserAvatar userId={me.id} size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ice">{me.name}</p>
              <p className="truncate text-xs text-fog">{me.role[lang]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative lg:pl-60 print:pl-0">
        <header className="sticky top-0 z-10 border-b border-edge bg-canvas/80 backdrop-blur print:hidden">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
            <Link to="/" className="lg:hidden">
              <Logo />
            </Link>
            <div className="hidden sm:block">
              <WorkflowStepper />
            </div>
            <div className="flex items-center gap-2">
              <SimulationToggle />
              <LangToggle />
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
            {nav.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={linkCls}>
                <Icon size={15} aria-hidden /> {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8 print:max-w-none print:p-0">
          <GuideBanner />
          <Outlet />
        </main>
      </div>

      <Toasts />
    </div>
  )
}
