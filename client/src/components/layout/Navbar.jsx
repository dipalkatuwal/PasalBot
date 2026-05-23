import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useUI }  from '@/context/UIContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products',  label: 'Products'  },
  { to: '/orders',    label: 'Orders'    },
  { to: '/bot',       label: '🤖 Bot'    },
  { to: '/themes',    label: '🎨 Themes' },
  { to: '/shop-setup', label: 'My Shop'  },
]

export function Navbar() {
  const { demoShopOpen, openDemoShop, closeDemoShop } = useUI()
  const { user, logout }    = useAuth()
  const location            = useLocation()
  const navigate            = useNavigate()
  const isLanding           = location.pathname === '/'

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to={user ? '/dashboard' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>🏪</span>
          <span className={styles.logoText}>PasalBot</span>
          <span className={styles.versionBadge}>v1.1</span>
        </NavLink>

        {!isLanding && user && (
          <div className={styles.links}>
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Button 
                variant={demoShopOpen ? "primary" : "secondary"} 
                size="sm" 
                onClick={() => demoShopOpen ? closeDemoShop() : openDemoShop()}
              >
                {demoShopOpen ? 'Hide Preview' : '🛍️ My Shop'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
              Get Started →
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
