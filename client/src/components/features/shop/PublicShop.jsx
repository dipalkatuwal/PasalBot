import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SHOP_THEMES } from '@/data/mockData'

// ── Mini bot for the public shop (runs without auth/context) ─────────────────
function usePubBot(keywords, products, onOrderComplete) {
  const [messages, setMessages] = useState([])
  const [step,     setStep]     = useState(null)
  const [data,     setData]     = useState({})

  const push = (from, text) => setMessages(m => [...m, { from, text }])

  const init = (shopName) => {
    setMessages([{ from: 'bot', text: `Namaste! 🙏 Welcome to ${shopName}. Ask about price, stock, delivery — or type "order" to buy!` }])
  }

  const send = (text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase()

    setTimeout(async () => {
      if (step === 'product') {
        const found = products.find(p =>
          p.name.toLowerCase().includes(lower) ||
          lower.includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
        )
        if (!found) {
          push('bot', `Hmm, I couldn't find that. Here's what we have:\n${products.slice(0, 5).map(p => `• ${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
          return
        }
        setData(d => ({ ...d, product: found.name, amount: found.price }))
        setStep('name')
        push('bot', `Great choice! ${found.image} ${found.name} — NPR ${found.price.toLocaleString()}\n\nWhat's your name?`)
        return
      }
      if (step === 'name') {
        setData(d => ({ ...d, name: text.trim() }))
        setStep('address')
        push('bot', `Thanks ${text.trim()}! 🙏 What's your delivery address?`)
        return
      }
      if (step === 'address') {
        setData(d => ({ ...d, address: text.trim() }))
        setStep('phone')
        push('bot', `Got it! What's your phone number?`)
        return
      }
      if (step === 'phone') {
        const finalData = { ...data, phone: text.trim() }
        setStep(null); setData({})
        try {
          await onOrderComplete(finalData)
          push('bot', `✅ Order confirmed! We'll deliver in 1–2 days. COD 💚\n\nWe'll call ${text.trim()} before delivery. Thank you!`)
        } catch {
          push('bot', `Sorry, something went wrong. Please DM us directly.`)
        }
        return
      }

      const match = keywords.find(k => lower.includes(k.trigger))
      if (match) { push('bot', match.reply); return }

      if (lower.includes('order') || lower.includes('buy')) {
        setStep('product')
        push('bot', `Let's place your order! Which product?\n\n${products.slice(0, 5).map(p => `• ${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
        return
      }
      if (lower.includes('product') || lower.includes('list')) {
        push('bot', products.length ? products.map(p => `${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n') : 'No products listed yet.')
        return
      }
      push('bot', `I'm not sure about that 😅 Try: price · stock · delivery · order`)
    }, 500)
  }

  const quickReplies = step ? [] : ['price', 'stock', 'delivery', 'order']
  return { messages, init, send, quickReplies }
}

// ── Chat drawer ───────────────────────────────────────────────────────────────
function ChatDrawer({ colors, onClose, keywords, products, onOrderComplete }) {
  const { messages, init, send, quickReplies } = usePubBot(keywords, products, onOrderComplete)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { init('the shop') }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const submit = () => { if (!input.trim()) return; send(input); setInput('') }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <style>{`
        @media (min-width: 700px) {
          .pub-chat-panel {
            position: absolute !important;
            right: 0 !important;
            bottom: 0 !important;
            top: 0 !important;
            width: 420px !important;
            max-width: 420px !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="pub-chat-panel" style={{
        width: '100%', maxWidth: 460, borderRadius: '32px 32px 0 0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '85vh', maxHeight: 700, background: colors.bg,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
        border: `1px solid ${colors.accent}22`,
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.01em' }}>Shop Assistant</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0, fontWeight: 600 }}>Usually replies instantly</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, background: `linear-gradient(to bottom, ${colors.accent}05, transparent)` }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', borderRadius: m.from === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                padding: '12px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: m.from === 'user' ? colors.accent : colors.card,
                color: m.from === 'user' ? '#fff' : colors.text,
                boxShadow: m.from === 'bot' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                border: m.from === 'bot' ? `1px solid ${colors.accent}11` : 'none',
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '0 24px 12px', flexWrap: 'wrap', flexShrink: 0 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: colors.card, border: `1px solid ${colors.accent}33`, color: colors.accent,
                borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                transition: 'all 0.2s'
              }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 24px 32px', borderTop: `1px solid ${colors.accent}11`, display: 'flex', gap: 10, flexShrink: 0, background: colors.card }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Type your message..."
            style={{ 
              flex: 1, border: `1px solid ${colors.accent}22`, borderRadius: 16, 
              padding: '14px 18px', fontSize: 14, background: colors.bg, 
              color: colors.text, outline: 'none', fontFamily: 'var(--font-body)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }} />
          <button onClick={submit} style={{ 
            background: colors.accent, color: '#fff', border: 'none', 
            borderRadius: 16, width: 48, height: 48, cursor: 'pointer', 
            fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${colors.accent}44`
          }}>→</button>
        </div>
      </div>
    </div>
  )
}

// ── Cart drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ colors, cart, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((s, p) => s + p.price, 0)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <style>{`
        .pub-cart-panel {
          width: 100%;
          max-width: 100%;
        }
        @media (min-width: 480px) {
          .pub-cart-panel { max-width: 420px; }
        }
        @media (min-width: 900px) {
          .pub-cart-panel { max-width: 480px; }
        }
      `}</style>

      <div className="pub-cart-panel" style={{
        height: '100%', display: 'flex',
        flexDirection: 'column', background: colors.bg,
        boxShadow: '-20px 0 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛒</div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, flex: 1, margin: 0, letterSpacing: '-0.01em' }}>Your Cart ({cart.length})</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
                <p style={{ fontSize: 64, margin: '0 0 16px' }}>🛒</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Your cart is empty</p>
              </div>
            )
            : cart.map((p, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', 
                borderBottom: `1px solid ${colors.accent}11` 
              }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{p.image}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 4px', lineHeight: 1.2 }}>{p.name}</p>
                  <p style={{ fontWeight: 800, color: colors.accent, fontSize: 15, margin: 0 }}>NPR {p.price.toLocaleString()}</p>
                </div>
                <button onClick={() => onRemove(i)} style={{ 
                  background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', 
                  width: 32, height: 32, borderRadius: 10, color: '#ef4444', fontSize: 14 
                }}>✕</button>
              </div>
            ))
          }
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '24px 24px 40px', background: colors.card, borderTop: `1px solid ${colors.accent}11`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.6, color: colors.text }}>Total Amount</span>
              <span style={{ fontWeight: 900, fontSize: 24, color: colors.accent }}>NPR {total.toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: '100%', background: colors.accent, color: '#fff',
              border: 'none', borderRadius: 18, padding: '16px', fontSize: 16,
              fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
              boxShadow: `0 8px 20px ${colors.accent}44`,
              transition: 'all 0.2s'
            }}>
              Place Order via Chat 🚀
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, marginTop: 16, opacity: 0.5, fontWeight: 600 }}>Cash on Delivery available</p>
          </div>
        )}
      </div>
    </div>
  )
}



// ── Reusable Shop UI Component ───────────────────────────────────────────────
export function ShopUI({ shop, products, keywords, categories, themeId }) {
  const [activeCat,  setActiveCat]  = useState('all')
  const [cart,       setCart]       = useState([])
  const [chatOpen,   setChatOpen]   = useState(false)
  const [cartOpen,   setCartOpen]   = useState(false)

  const colors   = SHOP_THEMES.find(t => t.id === themeId)?.colors || SHOP_THEMES[0].colors

  // Build category list: virtual "All" + DB categories that have at least one product
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]

  const filtered = activeCat === 'all'
    ? products
    : products.filter(p => {
        const cat = categories.find(c => c._id === activeCat)
        return cat && p.category?.toLowerCase() === cat.label.toLowerCase()
      })

  const addToCart  = (p) => { setCart(c => [...c, p]); setCartOpen(true) }
  const removeItem = (i) => setCart(c => c.filter((_, j) => j !== i))
  const cartTotal  = cart.reduce((s, p) => s + p.price, 0)

  const handleOrderComplete = async (orderData) => {
    setCart([])
  }

  const handleCartCheckout = () => {
    setCartOpen(false)
    setChatOpen(true)
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: colors.bg, color: colors.text, 
      fontFamily: 'var(--font-body)', scrollBehavior: 'smooth',
      position: 'relative', overflowX: 'hidden'
    }} className="shop-root">

      <style>{`
        /* ── Base (mobile-first) ── */
        .shop-root {
          --gutter: 16px;
          container-type: inline-size;
          container-name: shop;
        }

        /* ── Container query breakpoints ── */
        @container shop (min-width: 480px) {
          .shop-root { --gutter: 24px; }
          .product-grid  { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; }
        }

        @container shop (min-width: 640px) {
          .hide-mobile { display: inline-flex !important; }
          .product-grid  { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
        }

        @container shop (min-width: 768px) {
          .shop-root { --gutter: 40px; }
          .hero-card  { padding: 60px !important; border-radius: 48px !important; }
          .hero-title { font-size: 64px !important; }
          .product-grid  { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 32px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
          .trust-bar  { gap: 40px 60px; }
          .footer-content { grid-template-columns: 2fr 1fr 1fr; }
        }

        /* hide-mobile: hidden by default, shown at ≥640px container width */
        .hide-mobile { display: none !important; }

        /* ── Hero card ── */
        .hero-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 28px;
          padding: 24px;
          width: 100%;
          max-width: 650px;
          box-sizing: border-box;
          box-shadow: 0 40px 100px rgba(0,0,0,0.3);
        }

        .hero-title {
          font-size: clamp(22px, 7cqw, 64px);
          line-height: 1;
          letter-spacing: -0.05em;
          font-weight: 900;
          margin-bottom: 16px;
          color: #fff;
        }

        /* ── Grids ── */
        .grid-container {
          display: grid;
          gap: 12px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--gutter);
          box-sizing: border-box;
        }

        /* mobile: single column products, 2-col categories */
        .category-grid { grid-template-columns: repeat(2, 1fr); }
        .product-grid  { grid-template-columns: repeat(2, 1fr); gap: 12px; }

        /* ── Trust bar ── */
        .trust-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px 24px;
          padding: 24px var(--gutter);
          background: rgba(0,0,0,0.03);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          box-sizing: border-box;
        }

        /* ── Footer ── */
        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px var(--gutter);
          box-sizing: border-box;
        }

        /* ── Product cards ── */
        .product-card { transition: transform 0.15s, box-shadow 0.15s; }
        .product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07) !important; }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: `${colors.bg}ee`, 
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.accent}15`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--gutter)', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>{shop.logo}</div>
            <p style={{ fontWeight: 900, fontSize: 20, margin: 0, letterSpacing: '-0.04em' }}>{shop.name}</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, border: 'none', color: colors.accent, borderRadius: 12, height: 40, padding: '0 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💬</span> <span className="hide-mobile">Support</span>
            </button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, border: 'none', color: '#fff', borderRadius: 12, height: 40, padding: '0 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', position: 'relative' }}>
              <span>🛒 Bag</span>
              {cart.length > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', borderRadius: 8, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '50vh', display: 'flex', alignItems: 'center', padding: 'clamp(32px, 6cqw, 60px) var(--gutter)',
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('https://picsum.photos/id/1015/2000/1200') center/cover`,
        boxSizing: 'border-box',
      }}>
        <div className="hero-card">
          <h1 className="hero-title">Discover<br />{shop.name}</h1>
          <p style={{ fontSize: 'clamp(13px, 3cqw, 18px)', color: 'rgba(255,255,255,0.9)', margin: '0 0 clamp(16px, 4cqw, 32px)', lineHeight: 1.5, fontWeight: 500 }}>
            {shop.description || 'Premium quality and local essentials delivered to your doorstep.'}
          </p>
          <button onClick={() => document.getElementById('shop-grid').scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 'clamp(10px, 2cqw, 16px)', padding: 'clamp(10px, 2.5cqw, 16px) clamp(18px, 5cqw, 32px)', fontSize: 'clamp(13px, 2.5cqw, 16px)', fontWeight: 800, cursor: 'pointer', boxShadow: `0 10px 30px ${colors.accent}44` }}>
            Start Shopping
          </button>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────── */}
      <div className="trust-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>📍</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>{shop.location || 'Nepal'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>Secure Payments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🔄</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>Easy Returns</span>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(32px, 6cqw, 60px) 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(18px, 4cqw, 28px)', fontWeight: 900, marginBottom: 'clamp(20px, 4cqw, 40px)' }}>Shop by Category</h2>
        <div className="grid-container category-grid">
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: isActive ? colors.accent : colors.card,
                color: isActive ? '#fff' : colors.text,
                border: `1px solid ${isActive ? colors.accent : 'rgba(0,0,0,0.05)'}`,
                borderRadius: 'clamp(14px, 3cqw, 24px)', padding: 'clamp(14px, 3cqw, 24px)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px, 1.5cqw, 10px)',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 10px 30px ${colors.accent}33` : '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <span style={{ fontSize: 'clamp(22px, 5cqw, 32px)' }}>{cat.emoji}</span>
                <span style={{ fontSize: 'clamp(11px, 2cqw, 14px)', fontWeight: 800 }}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Products ───────────────────────────────────────────────────── */}
      <main id="shop-grid" style={{ paddingBottom: 'clamp(60px, 8cqw, 100px)' }}>
        <div className="grid-container" style={{ marginBottom: 'clamp(16px, 3cqw, 32px)' }}>
          <h2 style={{ fontSize: 'clamp(20px, 5cqw, 32px)', fontWeight: 900, margin: 0 }}>Featured Collection</h2>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'clamp(48px, 8cqw, 100px) 0', background: colors.card, borderRadius: 'clamp(20px, 4cqw, 40px)', margin: '0 var(--gutter)' }}>
            <p style={{ fontSize: 'clamp(48px, 10cqw, 80px)', margin: '0 0 20px' }}>🛍️</p>
            <p style={{ fontSize: 'clamp(14px, 3cqw, 20px)', fontWeight: 800, opacity: 0.4 }}>Our collection is being updated.</p>
          </div>
        )}

        <div className="grid-container product-grid">
          {filtered.map(p => (
            <div key={p._id} style={{
              borderRadius: 'clamp(16px, 3cqw, 28px)', padding: 'clamp(12px, 2.5cqw, 16px)', background: colors.card,
              border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2cqw, 12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', cursor: 'pointer'
            }} className="product-card">
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(40px, 10cqw, 64px)', borderRadius: 'clamp(12px, 2.5cqw, 20px)', background: colors.bg }}>
                {p.image}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 'clamp(13px, 2.5cqw, 16px)', margin: '0 0 4px', lineHeight: 1.3 }}>{p.name}</p>
                <p style={{ fontWeight: 900, fontSize: 'clamp(15px, 3cqw, 20px)', color: colors.accent, margin: 0 }}>NPR {p.price.toLocaleString()}</p>
              </div>
              <button disabled={p.stock <= 0} onClick={(e) => { e.stopPropagation(); addToCart(p); }} style={{
                width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none',
                borderRadius: 'clamp(10px, 2cqw, 14px)', padding: 'clamp(10px, 2.5cqw, 14px)', fontSize: 'clamp(12px, 2cqw, 14px)', fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
              }}>
                {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ background: colors.card, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="footer-content">
          <div>
            <p style={{ fontWeight: 900, fontSize: 'clamp(15px, 3cqw, 20px)', marginBottom: 16 }}>{shop.name}</p>
            <p style={{ fontSize: 'clamp(12px, 2cqw, 14px)', opacity: 0.6, lineHeight: 1.6 }}>{shop.description || 'Quality products delivered with care.'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 'clamp(11px, 1.8cqw, 13px)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 'clamp(12px, 2.5cqw, 20px)', color: colors.accent }}>Visit Us</h4>
            <p style={{ fontSize: 'clamp(12px, 2cqw, 14px)', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>{shop.location || 'Nepal'}<br />{shop.phone}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 'clamp(11px, 1.8cqw, 13px)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 'clamp(12px, 2.5cqw, 20px)', color: colors.accent }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: 10 }}>
              {shop.socialLinks?.facebook && <span style={{ fontSize: 'clamp(18px, 3cqw, 20px)' }}>📘</span>}
              {shop.socialLinks?.instagram && <span style={{ fontSize: 'clamp(18px, 3cqw, 20px)' }}>📸</span>}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
      {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
    </div>
  )
}

// ── Main PublicShop component ─────────────────────────────────────────────────
export function PublicShop() {
  const { slug }     = useParams()
  const navigate     = useNavigate()
  const [shopData,   setShopData]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)

  // Fetch public shop data from API (no auth needed)
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    fetch(`${base}/shop/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setShopData(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏪</div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <p style={{ fontSize: 48 }}>🔍</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>Shop not found</p>
      <button onClick={() => navigate('/')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Go Home</button>
    </div>
  )

  return (
    <ShopUI 
      shop={shopData.shop}
      products={shopData.products}
      keywords={shopData.keywords}
      categories={shopData.categories}
      themeId={shopData.activeTheme}
    />
  )
}
