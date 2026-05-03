import { useNavigate } from 'react-router-dom'
import { useUI } from '@/context/UIContext'
import { Button } from '@/components/ui/Button'
import styles from './Hero.module.css'

const STATS = [
  { value: '500+',     label: 'Active Sellers'      },
  { value: '12,000+',  label: 'Orders Processed'    },
  { value: 'NPR 45L+', label: 'Revenue Generated'   },
  { value: '4.9★',     label: 'Seller Rating'       },
]

export function Hero() {
  const navigate = useNavigate()
  const { openDemoShop } = useUI()

  return (
    <section className={styles.hero}>
      {/* Glow blobs */}
      <div className={styles.blobLeft}  aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      <div className={styles.badge}>
        <span className={styles.dot} />
        Now live for Nepali sellers · Free 14-day trial
      </div>

      <h1 className={styles.headline}>
        Turn your DM chaos<br />
        <span className={styles.gradient}>into a real business.</span>
      </h1>

      <p className={styles.sub}>
        PasalBot is the chat-first shop platform built for Nepali sellers on Facebook &amp; Instagram.
        Set up in 5 minutes. Sell like a pro.
      </p>

      <div className={styles.ctas}>
        <Button size="lg" onClick={() => navigate('/dashboard')}>
          Start Free Trial →
        </Button>
        <Button size="lg" variant="ghost" onClick={openDemoShop}>
          🛍️ See Live Demo
        </Button>
      </div>

      <p className={styles.noCard}>No credit card · No setup fee · Cancel anytime</p>

      <div className={styles.statsBar}>
        {STATS.map(({ value, label }) => (
          <div key={label} className={styles.stat}>
            <span className={styles.statVal}>{value}</span>
            <span className={styles.statLab}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
