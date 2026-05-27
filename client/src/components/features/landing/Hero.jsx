import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import styles from './Hero.module.css'

const STATS = [
  { value: '2',       label: 'Live Shops Running'   },
  { value: '5 min',   label: 'Setup Time'           },
  { value: '100%',    label: 'Cash on Delivery'     },
  { value: 'Free',    label: 'To Get Started'       },
]

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      {/* Glow blobs */}
      <div className={styles.blobLeft}  aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      <div className={styles.badge}>
        <span className={styles.dot} />
        Built for Nepali sellers · No card required
      </div>

      <h1 className={styles.headline}>
        Your shop link. Your bot.<br />
        <span className={styles.gradient}>Your orders, sorted.</span>
      </h1>

      <p className={styles.sub}>
        PasalBot lets you launch a proper online shop in minutes — with a chatbot that handles
        customer questions, a link you can share anywhere, and order tracking that actually works.
        Built for sellers in Nepal.
      </p>

      <div className={styles.ctas}>
        <Button size="lg" onClick={() => navigate('/auth')}>
          Start Free →
        </Button>
        <Button size="lg" variant="ghost" onClick={() => document.getElementById('live-demos')?.scrollIntoView({ behavior: 'smooth' })}>
          🛍️ See Live Demos
        </Button>
      </div>

      <p className={styles.noCard}>No credit card · No setup fee · Works on any device</p>

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
