import { useNavigate } from 'react-router-dom'
import { FEATURES, PRICING_PLANS } from '@/data/mockData'
import { useIntersection } from '@/hooks/useIntersection'
import { Button } from '@/components/ui/Button'

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
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
  const problems = [
    'Orders buried in hundreds of DMs and comments',
    'Customers asking "price kati ho?" ten times a day',
    'No way to track who ordered, paid, or cancelled',
    'Manual note-keeping in copies and WhatsApp chats',
    'A missed message means a missed sale',
  ]
  const solutions = [
    'Bot auto-replies to price, stock & delivery queries instantly',
    'One shareable link — your full shop with all products',
    'Every order logged, tracked, and confirmed with a call',
    'Customer history pulled up by phone number automatically',
    'Never lose a sale to a late reply again',
  ]

  return (
    <section style={{ background: 'var(--color-bg-sunken)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '3rem', alignItems: 'start' }}>
        <FadeIn>
          <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: '1rem' }}>THE PROBLEM</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '1.5rem' }}>
            Selling on social media<br /><span style={{ color: '#EF4444' }}>is exhausting.</span>
          </h2>
          {problems.map(t => (
            <p key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 15 }}>
              <span style={{ color: '#EF4444', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✕</span> {t}
            </p>
          ))}
        </FadeIn>

        <FadeIn delay={0.15}>
          <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: '1rem' }}>THE FIX</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '1.5rem' }}>
            PasalBot handles it<br /><span style={{ color: '#22C55E' }}>so you don't have to.</span>
          </h2>
          {solutions.map(t => (
            <p key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 15 }}>
              <span style={{ color: '#22C55E', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {t}
            </p>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Features Grid ──────────────────────────────────────────────────────── */
export function FeaturesGrid() {
  const features = [
    {
      icon: '🤖',
      title: 'Smart Chat Bot',
      desc: 'Set up keyword replies once — the bot handles "price kati ho?", stock checks, and delivery questions 24/7, even while you sleep.',
    },
    {
      icon: '🛍️',
      title: 'Your Own Shop Link',
      desc: 'Get a clean link like pasalbot.com/shop/yourname. Share it in your Instagram bio, Facebook posts, or WhatsApp status.',
    },
    {
      icon: '📞',
      title: 'Call-to-Confirm Orders',
      desc: 'Every order gets a confirmation call before delivery. No prepayment confusion — customers pay when the product arrives.',
    },
    {
      icon: '📦',
      title: 'Order Management',
      desc: 'Track every order from Pending → Confirmed → Delivered. Full customer history attached to their phone number.',
    },
    {
      icon: '🎨',
      title: 'Beautiful Shop Templates',
      desc: 'Choose from 6 templates — Himalayan Store, Haven, Shanti, Kailash, Minimal, Story — each with customizable color themes.',
    },
    {
      icon: '📊',
      title: 'Live Dashboard',
      desc: 'Revenue totals, pending orders, low stock alerts, and top products — all visible at a glance, updated in real time.',
    },
    {
      icon: '📱',
      title: 'Works on Any Device',
      desc: 'Your shop looks great on phones, tablets, and desktops. Your customers can browse and order from anywhere.',
    },
    {
      icon: '⚡',
      title: '5-Minute Setup',
      desc: 'Register, add your products, configure the bot, go live. Faster than typing a reply to your next DM.',
    },
  ]

  return (
    <section style={{ padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionTitle
          eyebrow="FEATURES"
          title="Everything your shop needs."
          sub="Designed specifically for how Nepali sellers actually work."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', height: '100%', boxSizing: 'border-box' }}>
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
    {
      n: '01',
      title: 'Create Your Account',
      desc: 'Sign up with your name, phone, and email. Pick your shop slug — that becomes your public link.',
    },
    {
      n: '02',
      title: 'Add Your Products',
      desc: 'Upload product name, price, stock count, and an emoji or photo. Add as many as you need.',
    },
    {
      n: '03',
      title: 'Set Up Your Bot',
      desc: 'Tell the bot what keywords to watch for and what to reply. Preview it live before going live.',
    },
    {
      n: '04',
      title: 'Share & Receive Orders',
      desc: 'Post your shop link. Customers browse, order, and you get notified. You call them to confirm before delivery.',
    },
  ]

  return (
    <section style={{ background: 'var(--color-bg-sunken)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionTitle
          eyebrow="HOW IT WORKS"
          title="From zero to live shop in 5 minutes."
          sub="No technical knowledge needed."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--color-brand)', fontWeight: 900, opacity: 0.5, marginBottom: '0.75rem' }}>{s.n}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* COD callout */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: '2.5rem', background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>📞</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>Always confirmed before delivery</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Every order placed through your shop triggers a notification for you to call the customer and verify their address before heading out. <strong>No advance payment, no risk</strong> — the Nepali way.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Live Demo Shops ────────────────────────────────────────────────────── */
const DEMO_SHOPS = [
  {
    slug:      'seasonalfashion',
    name:      'Seasonal Fashion',
    category:  'Clothing & Accessories',
    emoji:     '👗',
    color:     '#c2185b',
    quote:     "I used to reply to the same questions about sizes and prices all day. Now the bot does it for me and I can actually focus on restocking. My orders doubled in the first month.",
    seller:    'Sagar Dhakal',
    location:  'Main Road, Biratnagar',
    since:     'Using PasalBot since  2026',
    url:       '/shop/seasonalfashion',
  },
  {
    slug:      'guff-grantha',
    name:      'Guff Grantha',
    category:  'Books & Stationery',
    emoji:     '📚',
    color:     '#5c6bc0',
    quote:     "As a small bookshop I couldn't afford a full website. PasalBot gave me a proper shop link I can share on Facebook. Customers can browse my whole catalog and order directly — no more back-and-forth in comments.",
    seller:    'Rohan Shrestha',
    location:  'Pulchowk, Lalitpur',
    since:     'Using PasalBot since March 2026',
    url:       '/shop/guff-grantha',
  },
]

export function LiveDemos() {
  return (
    <section id="live-demos" style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-base)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionTitle
          eyebrow="REAL SHOPS, REAL SELLERS"
          title="See it live — not a mockup."
          sub="These are actual PasalBot shops run by real sellers in Nepal. Click to browse and order."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
          {DEMO_SHOPS.map((shop, i) => (
            <FadeIn key={shop.slug} delay={i * 0.12}>
              <div style={{
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Shop header */}
                <div style={{
                  background: shop.color,
                  padding: '28px 28px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 34, flexShrink: 0,
                  }}>
                    {shop.emoji}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>{shop.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{shop.category}</p>
                  </div>
                </div>

                {/* Seller quote */}
                <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <blockquote style={{ margin: 0 }}>
                    <p style={{
                      fontSize: 14, lineHeight: 1.75,
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      margin: 0,
                      paddingLeft: 16,
                      borderLeft: `3px solid ${shop.color}`,
                    }}>
                      "{shop.quote}"
                    </p>
                    <footer style={{ marginTop: 12, paddingLeft: 16 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>— {shop.seller}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>📍 {shop.location}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: shop.color, fontWeight: 600 }}>{shop.since}</p>
                    </footer>
                  </blockquote>

                  {/* Visit button */}
                  <a
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '13px 0',
                      background: shop.color,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                      letterSpacing: '0.01em',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    Visit {shop.name} →
                  </a>

                  <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    pasalbot.com{shop.url}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom nudge */}
        <FadeIn delay={0.3}>
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Want your shop here too?{' '}
            <a href="/auth" style={{ color: 'var(--color-brand)', fontWeight: 700, textDecoration: 'none' }}>
              Create your free account →
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
export function PricingSection() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Starter',
      price: 399,
      color: '#2D7A3A',
      light: 'color-mix(in srgb, #2D7A3A 10%, transparent)',
      popular: false,
      features: [
        'Up to 50 products',
        'Basic bot (5 keywords)',
        'Unlimited orders',
        'Order dashboard',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      price: 799,
      color: '#7C3AED',
      light: 'color-mix(in srgb, #7C3AED 10%, transparent)',
      popular: true,
      features: [
        'Unlimited products',
        'Advanced bot (unlimited keywords)',
        'Unlimited orders',
        'All 6 templates + themes',
        'Priority support',
      ],
    },
    {
      name: 'Business',
      price: 1499,
      color: '#D45C2A',
      light: 'color-mix(in srgb, #D45C2A 10%, transparent)',
      popular: false,
      features: [
        'Everything in Pro',
        'AI-powered bot replies',
        'Custom domain support',
        'Multi-staff access',
        'Dedicated phone support',
      ],
    },
  ]

  return (
    <section style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-sunken)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionTitle
          eyebrow="PRICING"
          title="Plans that grow with you."
          sub="Start free for 14 days. No credit card, no commitment."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {plans.map((plan, i) => (
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
                boxSizing:     'border-box',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 14px', borderRadius: 'var(--radius-full)', letterSpacing: 1.5, whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontWeight: 800, fontSize: 20, color: plan.color, marginBottom: '0.25rem' }}>{plan.name}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 900, color: plan.color }}>
                    NPR {plan.price}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>/month</span>
                </div>
                <div style={{ flex: 1 }}>
                  {plan.features.map(f => (
                    <p key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/auth')}
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
          Ready to turn your shop into a system?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Join sellers who stopped losing orders to missed DMs. Set up your shop today — it's free to start.
        </p>
        <Button size="lg" onClick={() => navigate('/auth')}>
          Create Your Free Shop 🚀
        </Button>
        <p style={{ marginTop: '1rem', fontSize: 13, color: 'var(--color-text-muted)' }}>
          No credit card · No technical skills needed · Live in 5 minutes
        </p>
      </FadeIn>
    </section>
  )
}
