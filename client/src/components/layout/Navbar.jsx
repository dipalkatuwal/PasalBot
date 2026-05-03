import { NavLink, useLocation } from 'react-router-dom'
import { useUI } from '@/context/UIContext'
import { Button } from '@/components/ui/Button'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products',  label: 'Products'  },
  { to: '/orders',    label: 'Orders'    },
  { to: '/bot',       label: '🤖 Bot'    },
  { to: '/themes',    label: '🎨 Themes' },
]

export function Navbar() {
  const { openDemoShop } = useUI()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏪</span>
          <span className={styles.logoText}>PasalBot</span>
          <span className={styles.versionBadge}>v1.1</span>
        </NavLink>

        {/* Links – hidden on landing */}
        {!isLanding && (
          <div className={styles.links}>
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.linkActive : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button variant="primary" size="sm" onClick={openDemoShop}>
          🛍️ Visit My Shop
        </Button>
      </div>
    </nav>
  )
}
