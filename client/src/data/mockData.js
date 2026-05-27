// ─── Shop Templates — managed in templates/index.js ──────────────────────────
export { SHOP_TEMPLATES } from '@/components/features/shop/templates/index'

// ─── Shop Themes — managed in @/data/themes.js ───────────────────────────────
export { SHOP_THEMES } from '@/data/themes'

// ─── Landing – Features ───────────────────────────────────────────────────────
export const FEATURES = [
  { icon: '💬', title: 'Bot-Powered DMs',    desc: 'Auto-reply to price, stock, and delivery queries 24/7. Never miss an order again.' },
  { icon: '🛍️', title: 'Your Own Shop Link', desc: 'Get pasalbot.com/shop/yourname — share it on Instagram bio & Facebook.' },
  { icon: '📦', title: 'Order Tracking',     desc: 'Confirm, deliver, cancel. Full history. Customer profiling from phone numbers.' },
  { icon: '📊', title: 'Sales Dashboard',    desc: 'Revenue, top products, repeat buyers — all in one glance.' },
  { icon: '🎨', title: '6 Color Themes',     desc: 'Mountain Sunrise, Rangeen Bazaar, Himalayan Mist and more — swap your palette in one tap.' },
  { icon: '📐', title: '4 Shop Templates',   desc: 'Himalayan Store, Himalaya Haven, Shanti Collective, Kailash — totally different aesthetics for every brand.' },
  { icon: '⚡', title: '5-Min Onboarding',   desc: 'Add products, set up the bot, go live. Faster than typing your next DM.' },
]

// ─── Landing – Pricing ────────────────────────────────────────────────────────
export const PRICING_PLANS = [
  {
    name:    'Starter',
    price:   399,
    color:   '#2D7A3A',
    light:   '#E0F5E2',
    popular: false,
    features: ['50 Products', 'Basic Bot', 'Unlimited Orders', '—', 'Email Support'],
  },
  {
    name:    'Pro',
    price:   799,
    color:   '#7C3AED',
    light:   '#EDE9FF',
    popular: true,
    features: ['Unlimited Products', 'Advanced Bot', 'Unlimited Orders', '—', 'Priority Email'],
  },
  {
    name:    'Business',
    price:   1499,
    color:   '#D45C2A',
    light:   '#FEF0E7',
    popular: false,
    features: ['Unlimited Products', 'Advanced Bot + AI', 'Unlimited Orders', 'Custom Domain', 'Dedicated Support'],
  },
]

// ─── Order status constants ───────────────────────────────────────────────────
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']

export const STATUS_STYLES = {
  Pending:   { bg: 'var(--color-pending-bg)',   text: 'var(--color-pending-text)'   },
  Confirmed: { bg: 'var(--color-confirmed-bg)', text: 'var(--color-confirmed-text)' },
  Delivered: { bg: 'var(--color-delivered-bg)', text: 'var(--color-delivered-text)' },
  Cancelled: { bg: 'var(--color-cancelled-bg)', text: 'var(--color-cancelled-text)' },
}
