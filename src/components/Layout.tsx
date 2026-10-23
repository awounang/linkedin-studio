import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Logo, NavIcon } from './Logo'
import { Modal } from './Ui'

type NavItem = { to: string; label: string; icon?: string }

const NAV: NavItem[] = [
  { to: '/app', label: 'Accueil', icon: 'home' },
  { to: '/app/strategie', label: 'Stratégie', icon: 'strategy' },
  { to: '/app/creer', label: 'Créer', icon: 'create' },
  { to: '/app/calendrier', label: 'Calendrier', icon: 'calendar' },
  { to: '/app/bibliotheque', label: 'Bibliothèque', icon: 'library' },
]

const MORE: NavItem[] = [
  { to: '/app/revue', label: 'Revue de contenu' },
  { to: '/app/profil', label: 'Profil et positionnement' },
  { to: '/app/parametres', label: 'Paramètres et export' },
]

export function AppLayout() {
  const { account, state, dispatch } = useStore()
  const [more, setMore] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMore(false)
  }, [location.pathname])

  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo />
        <nav>
          {[...NAV, ...MORE].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon ? <NavIcon name={item.icon} /> : <span />}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }} className="muted tiny">
          {account?.name}
        </div>
      </aside>
      <div>
        <header className="topbar">
          <Logo compact />
          <strong style={{ fontFamily: 'var(--display)' }}>Studio</strong>
          <button className="btn btn-ghost menu-btn" type="button" onClick={() => setMore(true)}>
            Menu
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
        <nav className="bottom-nav">
          {NAV.slice(0, 4).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/app'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <NavIcon name={item.icon ?? 'home'} />
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="nav-link" onClick={() => setMore(true)}>
            <NavIcon name="library" />
            Plus
          </button>
        </nav>
      </div>
      <Modal open={more} title="Plus" onClose={() => setMore(false)}>
        <div className="more-sheet">
          {MORE.concat(NAV.slice(4)).map((item) => (
            <a
              key={item.to}
              href={item.to}
              onClick={(event) => {
                event.preventDefault()
                navigate(item.to)
              }}
            >
              {item.label}
              <span>→</span>
            </a>
          ))}
        </div>
      </Modal>
      <div className="app-toasts">
        {state.toasts.map((toast) => (
          <button
            key={toast.id}
            className="toast"
            type="button"
            onClick={() => dispatch({ type: 'dismiss-toast', id: toast.id })}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </div>
  )
}
