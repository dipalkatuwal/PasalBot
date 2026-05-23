import { useState, useRef } from 'react'
import { useUI } from '@/context/UIContext'
import { useShop } from '@/context/ShopContext'
import { SHOP_THEMES } from '@/data/mockData'

// ── Mini bot (same logic as PublicShop's usePubBot) ──────────────────────────
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

// ── Chat drawer — scoped to a container ref, not the viewport ─────────────────
function ChatDrawer({ colors, onClose, keywords, products, onOrderComplete }) {
  const { messages, init, send, quickReplies } = usePubBot(keywords, products, onOrderComplete)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useState(() => { init('the shop') })

  const submit = () => { if (!input.trim()) return; send(input); setInput('') }

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', borderRadius: '24px 24px 0 0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '85%', background: colors.bg,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
        border: `1px solid ${colors.accent}22`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0 }}>Shop Assistant</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: 0, fontWeight: 600 }}>Usually replies instantly</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 10, width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: `linear-gradient(to bottom, ${colors.accent}05, transparent)` }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 13px', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap',
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
          <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px', flexWrap: 'wrap', flexShrink: 0 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: colors.card, border: `1px solid ${colors.accent}33`, color: colors.accent,
                borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer'
              }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 14px 18px', borderTop: `1px solid ${colors.accent}11`, display: 'flex', gap: 8, flexShrink: 0, background: colors.card }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Type your message..."
            style={{
              flex: 1, border: `1px solid ${colors.accent}22`, borderRadius: 12,
              padding: '10px 14px', fontSize: 12, background: colors.bg,
              color: colors.text, outline: 'none', fontFamily: 'var(--font-body)'
            }}
          />
          <button onClick={submit} style={{
            background: colors.accent, color: '#fff', border: 'none',
            borderRadius: 12, width: 40, height: 40, cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${colors.accent}44`
          }}>→</button>
        </div>
      </div>
    </div>
  )
}

// ── Cart drawer — scoped to the phone frame ────────────────────────────────────
function CartDrawer({ colors, cart, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((s, p) => s + p.price, 0)
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '90%', height: '100%', display: 'flex',
        flexDirection: 'column', background: colors.bg,
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛒</div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, flex: 1, margin: 0 }}>Your Cart ({cart.length})</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 10, width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {cart.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.3 }}>
                <p style={{ fontSize: 48, margin: '0 0 12px' }}>🛒</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Your cart is empty</p>
              </div>
            )
            : cart.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                borderBottom: `1px solid ${colors.accent}11`
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.image}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>{p.name}</p>
                  <p style={{ fontWeight: 800, color: colors.accent, fontSize: 13, margin: 0 }}>NPR {p.price.toLocaleString()}</p>
                </div>
                <button onClick={() => onRemove(i)} style={{
                  background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer',
                  width: 28, height: 28, borderRadius: 8, color: '#ef4444', fontSize: 12
                }}>✕</button>
              </div>
            ))
          }
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '16px 16px 24px', background: colors.card, borderTop: `1px solid ${colors.accent}11`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, color: colors.text }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: colors.accent }}>NPR {total.toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: '100%', background: colors.accent, color: '#fff',
              border: 'none', borderRadius: 14, padding: '12px', fontSize: 13,
              fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
              boxShadow: `0 6px 16px ${colors.accent}44`
            }}>
              Place Order via Chat 🚀
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, marginTop: 10, opacity: 0.5, fontWeight: 600 }}>Cash on Delivery available</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Self-contained ShopUI for the phone frame ─────────────────────────────────
function DemoShopUI({ shop, products, keywords, categories, themeId }) {
  const [activeCat,  setActiveCat]  = useState('all')
  const [cart,       setCart]       = useState([])
  const [chatOpen,   setChatOpen]   = useState(false)
  const [cartOpen,   setCartOpen]   = useState(false)

  const colors = SHOP_THEMES.find(t => t.id === themeId)?.colors || SHOP_THEMES[0].colors

  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => c._id !== 'all' && usedCatLabels.has(c.label.toLowerCase())),
  ]

  const filtered = activeCat === 'all'
    ? products
    : products.filter(p => {
        const cat = categories.find(c => c._id === activeCat)
        return cat && p.category?.toLowerCase() === cat.label.toLowerCase()
      })

  const addToCart  = (p) => { setCart(c => [...c, p]); setCartOpen(true) }
  const removeItem = (i) => setCart(c => c.filter((_, j) => j !== i))

  const handleOrderComplete = async () => { setCart([]) }
  const handleCartCheckout  = () => { setCartOpen(false); setChatOpen(true) }

  return (
    // Outer wrapper is position:relative — drawers use absolute inset:0 against THIS, not the scrollable child
    <div style={{ height: '100%', position: 'relative', fontFamily: 'var(--font-body)' }}>

      {/* Scrollable shop content */}
      <div style={{
        height: '100%', background: colors.bg, color: colors.text,
        overflowY: 'auto', overflowX: 'hidden',
      }} className="demo-shop-root">

      <style>{`
        .demo-shop-root {
          --gutter: 12px;
          scrollbar-width: none;
        }
        .demo-shop-root::-webkit-scrollbar { display: none; }

        .demo-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .demo-category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .demo-trust-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
          padding: 16px var(--gutter);
          background: rgba(0,0,0,0.03);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          justify-content: center;
        }
        .demo-footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 40px var(--gutter);
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `${colors.bg}ee`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.accent}15`,
      }}>
        <div style={{ padding: '0 var(--gutter)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>{shop.logo}</div>
            <p style={{ fontWeight: 900, fontSize: 15, margin: 0, letterSpacing: '-0.03em' }}>{shop.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, border: 'none', color: colors.accent, borderRadius: 10, height: 32, padding: '0 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>💬</span>
            </button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, border: 'none', color: '#fff', borderRadius: 10, height: 32, padding: '0 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer', position: 'relative' }}>
              <span>🛒 Bag</span>
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 6, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '40vh', display: 'flex', alignItems: 'center',
        padding: '30px var(--gutter)',
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('https://picsum.photos/id/1015/2000/1200') center/cover`
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 20,
          padding: '20px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{ fontSize: 'clamp(18px, 8cqw, 32px)', lineHeight: 1, letterSpacing: '-0.05em', fontWeight: 900, marginBottom: 10, color: '#fff' }}>
            Discover<br />{shop.name}
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', lineHeight: 1.5 }}>
            {shop.description || 'Premium quality and local essentials delivered to your doorstep.'}
          </p>
          <button
            onClick={() => document.getElementById('demo-shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: `0 6px 20px ${colors.accent}44` }}
          >
            Start Shopping
          </button>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div className="demo-trust-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📍</span>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>{shop.location || 'Nepal'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>Secure Payments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔄</span>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>Easy Returns</span>
        </div>
      </div>

      {/* ── Categories ── */}
      <section style={{ padding: '30px 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: 16, fontWeight: 900, marginBottom: 16, padding: '0 var(--gutter)' }}>Shop by Category</h2>
        <div className="demo-category-grid" style={{ padding: '0 var(--gutter)' }}>
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: isActive ? colors.accent : colors.card,
                color: isActive ? '#fff' : colors.text,
                border: `1px solid ${isActive ? colors.accent : 'rgba(0,0,0,0.05)'}`,
                borderRadius: 16, padding: '14px 10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 6px 20px ${colors.accent}33` : '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800 }}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Products ── */}
      <main id="demo-shop-grid" style={{ paddingBottom: 80 }}>
        <div style={{ padding: '0 var(--gutter)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Featured Collection</h2>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', background: colors.card, borderRadius: 24, margin: '0 var(--gutter)' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>🛍️</p>
            <p style={{ fontSize: 14, fontWeight: 800, opacity: 0.4 }}>Our collection is being updated.</p>
          </div>
        )}

        <div className="demo-product-grid" style={{ padding: '0 var(--gutter)' }}>
          {filtered.map(p => (
            <div key={p._id} style={{
              borderRadius: 20, padding: 12, background: colors.card,
              border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, borderRadius: 14, background: colors.bg }}>
                {p.image}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 12, margin: '0 0 2px', lineHeight: 1.3 }}>{p.name}</p>
                <p style={{ fontWeight: 900, fontSize: 14, color: colors.accent, margin: 0 }}>NPR {p.price.toLocaleString()}</p>
              </div>
              <button
                disabled={p.stock <= 0}
                onClick={(e) => { e.stopPropagation(); addToCart(p) }}
                style={{
                  width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0',
                  fontSize: 11, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: colors.card, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="demo-footer-content">
          <div>
            <p style={{ fontWeight: 900, fontSize: 15, marginBottom: 8 }}>{shop.name}</p>
            <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.6 }}>{shop.description || 'Quality products delivered with care.'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, color: colors.accent }}>Visit Us</h4>
            <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.6, margin: 0 }}>{shop.location || 'Nepal'}<br />{shop.phone}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, color: colors.accent }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              {shop.socialLinks?.facebook  && <span style={{ fontSize: 18 }}>📘</span>}
              {shop.socialLinks?.instagram && <span style={{ fontSize: 18 }}>📸</span>}
            </div>
          </div>
        </div>
      </footer>

      </div>{/* end scrollable shop content */}

      {/* ── Drawers — absolute against the outer position:relative wrapper,
              so they always cover the full phone frame regardless of scroll ── */}
      {cartOpen && (
        <CartDrawer
          colors={colors} cart={cart}
          onRemove={removeItem}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCartCheckout}
        />
      )}
      {chatOpen && (
        <ChatDrawer
          colors={colors}
          onClose={() => setChatOpen(false)}
          keywords={keywords}
          products={products}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  )
}

// ── Main DemoShop wrapper (phone frame) ───────────────────────────────────────
export function DemoShop() {
  const { demoShopOpen, closeDemoShop } = useUI()
  const { activeTheme, visibleProducts, shop, keywords, categories } = useShop()

  // Keep mounted so chat state survives route changes — just hide with CSS
  const openFullScreen = () => {
    window.open(`/shop/${shop.slug}`, '_blank')
  }

  return (
    <div style={{ display: demoShopOpen ? 'contents' : 'none' }}>
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to   { transform: translateX(0)   scale(1);   opacity: 1; }
        }

        /* ── Phone frame: responsive positioning ── */
        .demo-phone-overlay {
          position: fixed;
          top: 0; right: 0; bottom: 0; left: 0;
          z-index: 2000;
          pointer-events: none;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        /* Desktop: floating phone on the right */
        @media (min-width: 700px) {
          .demo-phone-overlay {
            top: 90px;
            right: 30px;
            bottom: 30px;
            left: auto;
            width: auto;
            align-items: flex-start;
            justify-content: flex-end;
          }
          .demo-phone-frame {
            width: 380px !important;
            height: 100% !important;
            border-radius: 48px !important;
            padding: 12px !important;
            border: 4px solid #333 !important;
          }
          .demo-phone-content {
            border-radius: 36px !important;
          }
          .demo-phone-actions {
            top: -45px !important;
            right: 12px !important;
            bottom: auto !important;
            left: auto !important;
            width: auto !important;
            padding: 0 !important;
            background: transparent !important;
            border-top: none !important;
            justify-content: flex-end !important;
          }
          .demo-phone-notch { display: block !important; }
          .demo-phone-indicator { display: block !important; }
          .demo-phone-backdrop { display: none !important; }
        }

        /* Mobile: bottom sheet style */
        @media (max-width: 699px) {
          .demo-phone-overlay {
            top: 0; right: 0; bottom: 0; left: 0;
            width: 100%;
            align-items: flex-end;
            justify-content: center;
          }
          .demo-phone-frame {
            width: 100% !important;
            height: 92dvh !important;
            border-radius: 28px 28px 0 0 !important;
            padding: 0 !important;
            border: none !important;
            border-top: 3px solid #444 !important;
          }
          .demo-phone-content {
            border-radius: 26px 26px 0 0 !important;
          }
          .demo-phone-actions {
            position: fixed !important;
            bottom: 92dvh !important;
            top: auto !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            padding: 8px 16px !important;
            background: var(--color-bg-raised, #fff) !important;
            border-top: 1px solid var(--color-border, #e5e4e7) !important;
            border-radius: 0 !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1) !important;
            justify-content: space-between !important;
          }
          .demo-phone-notch { display: none !important; }
          .demo-phone-indicator { display: none !important; }
        }
      `}</style>

      {/* Backdrop for mobile */}
      <div
        className="demo-phone-backdrop"
        onClick={closeDemoShop}
        style={{
          position: 'fixed', inset: 0, zIndex: 1999,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <div className="demo-phone-overlay">
        {/* Mobile: action bar above the sheet */}
        <div
          className="demo-phone-actions"
          style={{
            position: 'absolute',
            display: 'flex', gap: 8, alignItems: 'center',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <button onClick={openFullScreen} style={{
            background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <span>Full Screen</span>
            <span>↗️</span>
          </button>
          <button onClick={closeDemoShop} style={{
            background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>✕</button>
        </div>

        {/* Phone / Sheet Frame */}
        <div
          className="demo-phone-frame"
          style={{
            background: '#000',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)',
            position: 'relative',
            display: 'flex', flexDirection: 'column',
            pointerEvents: 'auto',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Device Notch (desktop only) */}
          <div className="demo-phone-notch" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 120, height: 24, background: '#000', borderRadius: '0 0 16px 16px',
            zIndex: 1001
          }} />

          {/* Content Area */}
          <div className="demo-phone-content" style={{
            flex: 1, background: '#fff',
            overflow: 'hidden', position: 'relative',
            display: 'flex', flexDirection: 'column'
          }}>
            <DemoShopUI
              shop={shop}
              products={visibleProducts}
              keywords={keywords}
              categories={categories}
              themeId={activeTheme.id}
            />
          </div>

          {/* Home Indicator (desktop only) */}
          <div className="demo-phone-indicator" style={{
            width: 100, height: 4, background: 'rgba(255,255,255,0.2)',
            borderRadius: 2, margin: '10px auto 4px'
          }} />
        </div>
      </div>
    </>
    </div>
  )
}
