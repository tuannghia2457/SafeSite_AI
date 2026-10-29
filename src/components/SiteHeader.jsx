import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import { LangToggle } from './Layout'
import { useDemo } from '../state/DemoStore'

// In-page anchors can't use href="#id": under HashRouter that would change the route.
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Header for the public pages (landing, evidence). `sections` scroll in-page; `pages` are routes. */
export default function SiteHeader({ sections = [], pages = [] }) {
  const { t } = useDemo()
  return (
    <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-5">
      <Link to="/" aria-label="SafeSite AI">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-mist md:flex">
        {sections.map((s) => (
          <button key={s.id} onClick={() => scrollTo(s.id)} className="hover:text-white">
            {s.label}
          </button>
        ))}
        {pages.map((p) => (
          <NavLink key={p.to} to={p.to} end className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
            {p.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LangToggle />
        <Link to="/dashboard" className="btn btn-ghost">
          {t('landing.openDemo')}
        </Link>
      </div>
    </header>
  )
}

export { scrollTo }
