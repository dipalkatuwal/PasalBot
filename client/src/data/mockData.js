// ─── Products ─────────────────────────────────────────────────────────────────
export const INITIAL_PRODUCTS = [
  { id: 1,  name: 'Handmade Dhaka Bag',    price: 1200, stock: 14, image: '👜', category: 'Accessories', visible: true  },
  { id: 2,  name: 'Organic Honey (500g)',  price: 850,  stock: 7,  image: '🍯', category: 'Food',        visible: true  },
  { id: 3,  name: 'Pashmina Shawl',        price: 2400, stock: 3,  image: '🧣', category: 'Clothing',    visible: true  },
  { id: 4,  name: 'Himalayan Salt Lamp',   price: 1600, stock: 9,  image: '🪔', category: 'Home',        visible: true  },
  { id: 5,  name: 'Thangka Print (A4)',    price: 750,  stock: 20, image: '🎨', category: 'Art',         visible: false },
  { id: 6,  name: 'Lokta Paper Notebook',  price: 450,  stock: 30, image: '📓', category: 'Stationery',  visible: true  },
]

// ─── Orders ───────────────────────────────────────────────────────────────────
export const INITIAL_ORDERS = [
  { id: 'ORD-001', customer: 'Aarav Sharma',  phone: '9841XXXXXX', product: 'Handmade Dhaka Bag',   amount: 1200, status: 'Pending',   date: '2026-05-01' },
  { id: 'ORD-002', customer: 'Priya Thapa',   phone: '9851XXXXXX', product: 'Organic Honey (500g)', amount: 850,  status: 'Confirmed', date: '2026-04-30' },
  { id: 'ORD-003', customer: 'Bikash Rai',    phone: '9861XXXXXX', product: 'Pashmina Shawl',       amount: 2400, status: 'Delivered', date: '2026-04-29' },
  { id: 'ORD-004', customer: 'Sunita KC',     phone: '9871XXXXXX', product: 'Himalayan Salt Lamp',  amount: 1600, status: 'Cancelled', date: '2026-04-28' },
  { id: 'ORD-005', customer: 'Rohan Gurung',  phone: '9841XXXXXX', product: 'Lokta Paper Notebook', amount: 450,  status: 'Delivered', date: '2026-04-27' },
]

// ─── Bot Keywords ─────────────────────────────────────────────────────────────
export const INITIAL_BOT_KEYWORDS = [
  {
    id: 1,
    trigger: 'price',
    reply: 'Hi! 😊 Check our latest prices at pasalbot.com/shop/priya — or tell me which product you\'re interested in!',
  },
  {
    id: 2,
    trigger: 'stock',
    reply: 'Great question! Most items are in stock. Which product do you need? I\'ll confirm for you right away 📦',
  },
  {
    id: 3,
    trigger: 'delivery',
    reply: 'We deliver within Kathmandu Valley in 1–2 days. Outside Valley: 3–5 days. COD available! 🚚',
  },
]

// ─── Shop Templates ───────────────────────────────────────────────────────────
// ─── Shop Templates — now managed in templates/index.js ──────────────────────
// Kept as a re-export so existing imports of SHOP_TEMPLATES from mockData still work.
// To add/remove a template, edit templates/index.js — not here.
export { SHOP_TEMPLATES } from '@/components/features/shop/templates/index'

// ─── Default Categories (used as fallback before API loads) ──────────────────
export const INITIAL_CATEGORIES = [
  { id: 'all',         label: 'All',         emoji: '🛍️' },
  { id: 'accessories', label: 'Accessories', emoji: '👜' },
  { id: 'food',        label: 'Food',        emoji: '🍯' },
  { id: 'clothing',    label: 'Clothing',    emoji: '👘' },
  { id: 'home',        label: 'Home',        emoji: '🏠' },
  { id: 'general',     label: 'General',     emoji: '📦' },
]

// ─── Shop Themes — now managed in @/data/themes.js ───────────────────────────
// Kept as a re-export so existing imports of SHOP_THEMES from mockData still work.
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

// ─── Landing – Pricing ───────────────────────────────────────────────────────
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

// ─── Status Styles ────────────────────────────────────────────────────────────
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']

export const STATUS_STYLES = {
  Pending:   { bg: 'var(--color-pending-bg)',   text: 'var(--color-pending-text)'   },
  Confirmed: { bg: 'var(--color-confirmed-bg)', text: 'var(--color-confirmed-text)' },
  Delivered: { bg: 'var(--color-delivered-bg)', text: 'var(--color-delivered-text)' },
  Cancelled: { bg: 'var(--color-cancelled-bg)', text: 'var(--color-cancelled-text)' },
}
