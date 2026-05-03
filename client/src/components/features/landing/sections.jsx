import { useNavigate } from 'react-router-dom'
import { FEATURES, PRICING_PLANS } from '@/data/mockData'
import { useIntersection } from '@/hooks/useIntersection'
import { Button } from '@/components/ui/Button'
import { formatNPR } from '@/utils/formatters'

/* ─── Shared ─────────────────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useIntersection()
  return (
    <div
      ref={ref}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <FadeIn style={{ textAlign: 'center', marginBottom: '3rem' }}>
      {eyebrow && (
        <p style={{ color: 'var(--color-brand)', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: '0.5rem' }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
        {title}
      </h2>
      {sub && <p style={{ color: 'var(--color-text-secondary)', fontSize: 16 }}>{sub}</p>}
    </FadeIn>
  )
}

/* ─── Problem / Solution ─────────────────────────────────────────────────── */
export function ProblemSolution() {
  const problems  = ['Lost orders buried in 300+ DMs', 'Customers asking price 10 times a day', 'No record of who ordered what', 'Manual COD tracking in notebooks', 'Missed messages = missed revenue']
  const solutions = ['Bot auto-replies to price/stock queries', 'One link — your complete shop', 'Every order tracked & confirmed', 'Customer history from phone number', 'Never lose a sale again']

  return (
    <section style={{ background: 'var(--color-bg-sunken)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        <FadeIn>
          <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: '1rem' }}>THE PROBLEM</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '1.5rem' }}>
            Social selling is <span style={{ color: '#EF4444' }}>a mess.</span>
          </h2>
          {problems.map(t => (
            <p key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 15 }}>
              <span style={{ color: '#EF4444', fontWeight: 700, flexShrink: 0 }}>✕</span> {t}
            </p>
          ))}
        </FadeIn>

        <FadeIn delay={0.15}>
          <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: '1rem' }}>THE SOLUTION</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '1.5rem' }}>
            PasalBot brings <span style={{ color: '#22C55E' }}>the order.</span>
          </h2>
          {solutions.map(t => (
            <p key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#D1FAE5', fontSize: 15 }}>
              <span style={{ color: '#22C55E', fontWeight: 700, flexShrink: 0 }}>✓</span> {t}
            </p>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Features Grid ──────────────────────────────────────────────────────── */
export function FeaturesGrid() {
  return (
    <section style={{ padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionTitle title="Everything you need, nothing you don't." sub="Built specifically for Nepal's social commerce market." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', height: '100%' }}>
                <div style={{ fontSize: 32, marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ───────────────────────────────────────────────────────── */
export function HowItWorks() {
  const steps = [
    { n: '01', title: 'Register',     desc: 'Sign up with phone + email. Pick your shop name.' },
    { n: '02', title: 'Add Products', desc: 'Name, price, photo, stock. Done in seconds.' },
    { n: '03', title: 'Set Up Bot',   desc: 'Choose auto-reply keywords. Preview your flow.' },
    { n: '04', title: 'Share & Sell', desc: 'Post your shop link. Let PasalBot do the rest.' },
  ]

  return (
    <section style={{ background: 'var(--color-bg-sunken)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionTitle title="Up and running in 5 minutes." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--color-brand)', fontWeight: 900, opacity: 0.6, marginBottom: '0.75rem' }}>{s.n}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
export function PricingSection() {
  const navigate = useNavigate()

  return (
    <section style={{ padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionTitle title="Momo-priced plans." sub="Start free for 14 days. No card needed." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {PRICING_PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div style={{
                background:    plan.popular ? plan.light : 'var(--color-bg-raised)',
                border:        `2px solid ${plan.popular ? plan.color : 'var(--color-border)'}`,
                borderRadius:  'var(--radius-xl)',
                padding:       '2rem',
                position:      'relative',
                height:        '100%',
                display:       'flex',
                flexDirection: 'column',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 14px', borderRadius: 'var(--radius-full)', letterSpacing: 1.5 }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontWeight: 800, fontSize: 20, color: plan.popular ? plan.color : 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{plan.name}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 900, color: plan.popular ? plan.color : 'var(--color-text-primary)' }}>
                    NPR {plan.price}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>/month</span>
                </div>
                <div style={{ flex: 1 }}>
                  {plan.features.map(f => (
                    <p key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: f === '—' ? 'var(--color-text-muted)' : plan.popular ? '#1E1533' : 'var(--color-text-secondary)' }}>
                      <span style={{ color: f === '—' ? 'var(--color-text-muted)' : plan.color, fontWeight: 700 }}>{f === '—' ? '—' : '✓'}</span>
                      {f}
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ width: '100%', marginTop: '1.5rem', padding: '12px', borderRadius: 'var(--radius-md)', background: plan.popular ? plan.color : 'transparent', border: `1.5px solid ${plan.color}`, color: plan.popular ? '#fff' : plan.color, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  Start Free Trial
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Banner ─────────────────────────────────────────────────────────── */
export function CTABanner() {
  const navigate = useNavigate()
  return (
    <section style={{ background: 'linear-gradient(135deg, #1A0A02, var(--color-bg-base))', padding: '5rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
      <FadeIn>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
          Ready to stop losing orders?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, marginBottom: '2rem' }}>
          Join 500+ Nepali sellers growing with PasalBot.
        </p>
        <Button size="lg" onClick={() => navigate('/dashboard')}>
          Start Free — No Card Required 🚀
        </Button>
      </FadeIn>
    </section>
  )
}
