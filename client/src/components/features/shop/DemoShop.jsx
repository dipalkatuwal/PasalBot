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
function DemoShopUI({ shop, products, keywords, categories, themeId, templateId }) {
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

  // ── Himalayan Store (compact phone version) ──────────────────────────────
  // ── Himalayan Store (compact phone — full colors.* driven) ─────────────────
  if (templateId === 'himalayan') {
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ height: '100%', background: colors.bg, color: colors.text, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          {/* Header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: `${colors.bg}f5`, borderBottom: `1px solid ${colors.accent}20`, padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{shop.logo || '🏔️'}</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 13, margin: 0, color: colors.text }}>{shop.name}</p>
                <p style={{ fontSize: 9, color: colors.accent, opacity: 0.7, margin: 0 }}>{shop.location || 'Nepal'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 10, height: 30, padding: '0 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>💬</button>
              <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, height: 30, padding: '0 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                🛍️{cart.length > 0 && ` ${cart.length}`}
              </button>
            </div>
          </div>
          {/* Hero */}
          <div style={{ height: 160, background: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.65)), url('https://picsum.photos/id/1015/2000/1200') center/cover`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', color: '#fff', padding: '0 16px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.04em' }}>{shop.name}</h1>
            <button onClick={() => document.getElementById('demo-h-products')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 12px ${colors.accent}55` }}>Shop Now →</button>
          </div>
          {/* Trust pills */}
          <div style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}12`, padding: '10px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['📍', 'Local'], ['🛡️', 'COD'], ['🚚', '1-2 Days']].map(([icon, label]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${colors.accent}12`, color: colors.accent, borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>{icon} {label}</span>
            ))}
          </div>
          {/* Category row */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', background: colors.bg }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${activeCat === cat._id ? colors.accent : colors.accent + '40'}`, borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {/* Products */}
          <div id="demo-h-products" style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: `${colors.accent}06` }}>
            {filtered.map(p => (
              <div key={p._id} style={{ background: colors.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${colors.accent}10` }}>
                <div style={{ height: 100, background: `linear-gradient(135deg, ${colors.bg}, ${colors.card})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{p.image}</div>
                <div style={{ padding: '10px' }}>
                  <p style={{ fontWeight: 700, fontSize: 11, margin: '0 0 4px', color: colors.text, lineHeight: 1.2 }}>{p.name}</p>
                  <p style={{ fontWeight: 900, fontSize: 13, color: colors.accent, margin: '0 0 8px' }}>NPR {p.price.toLocaleString()}</p>
                  <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 10, padding: '7px', fontSize: 10, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed' }}>
                    {p.stock > 0 ? 'Add' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: colors.text, color: colors.bg, padding: '20px 12px', marginTop: 8, textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: 13, margin: '0 0 4px', color: colors.bg }}>{shop.name}</p>
            <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>{shop.location}</p>
          </div>
        </div>
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

  // ── Himalaya Haven (compact phone — full colors.* driven) ──────────────────
  if (templateId === 'haven') {
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'Georgia, serif' }}>
        <div style={{ height: '100%', background: colors.bg, color: colors.text, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: colors.card, borderBottom: `1px solid ${colors.accent}20`, padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{shop.logo || '🏔️'}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: colors.accent }}>{shop.name}</p>
                <p style={{ fontSize: 9, color: colors.accent, opacity: 0.7, margin: 0, fontFamily: 'system-ui' }}>{shop.location || 'Nepal'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 10, height: 30, padding: '0 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>💬</button>
              <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, height: 30, padding: '0 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
                🛍️{cart.length > 0 && ` ${cart.length}`}
              </button>
            </div>
          </div>
          {/* Hero */}
          <div style={{ height: 180, background: `linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.78)), url('https://picsum.photos/id/1015/2000/1200') center/cover`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px' }}>
            <p style={{ fontSize: 10, color: colors.card, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'system-ui' }}>Authentic Himalayan Goods</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px', color: '#fff', letterSpacing: '-0.03em' }}>{shop.name}</h1>
            <button onClick={() => document.getElementById('demo-haven-shop')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 16, padding: '8px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', fontFamily: 'system-ui', boxShadow: `0 4px 12px ${colors.accent}55` }}>Explore →</button>
          </div>
          {/* Trust pills */}
          <div style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}12`, padding: '10px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['📍', shop.location || 'Kathmandu'], ['🛡️', 'COD'], ['🚚', '1-2 Days']].map(([icon, label]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${colors.accent}12`, color: colors.accent, borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 600, fontFamily: 'system-ui' }}>{icon} {label}</span>
            ))}
          </div>
          {/* Category pills */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', background: colors.bg }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : colors.card, color: activeCat === cat._id ? '#fff' : colors.text, border: 'none', borderRadius: 16, padding: '5px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'system-ui' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {/* Products */}
          <div id="demo-haven-shop" style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: `${colors.accent}06` }}>
            {filtered.map(p => (
              <div key={p._id} style={{ background: colors.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.07)', border: `1px solid ${colors.accent}10` }}>
                <div style={{ height: 110, background: `linear-gradient(135deg, ${colors.bg}, ${colors.card})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>{p.image}</div>
                <div style={{ padding: '10px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 4px', color: colors.text, lineHeight: 1.2 }}>{p.name}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: colors.accent, margin: '0 0 8px', fontFamily: 'system-ui' }}>NPR {p.price.toLocaleString()}</p>
                  <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 10, padding: '7px', fontSize: 10, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', fontFamily: 'system-ui' }}>
                    {p.stock > 0 ? 'Add' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: colors.text, color: colors.bg, padding: '20px 12px', marginTop: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>{shop.logo || '🏔️'}</span>
            <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px', color: colors.bg }}>{shop.name}</p>
            <p style={{ fontSize: 11, opacity: 0.7, margin: 0, fontFamily: 'system-ui' }}>{shop.location}</p>
          </div>
        </div>
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

  // ── Shanti Collective (compact phone — full colors.* driven) ───────────────
  if (templateId === 'shanti') {
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ height: '100%', background: colors.bg, color: colors.text, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          {/* Nav */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: `${colors.bg}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${colors.accent}20`, padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: colors.accent, color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transform: 'rotate(12deg)' }}>{shop.logo || '☸️'}</div>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.04em', color: colors.text }}>{shop.name.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30`, borderRadius: 10, height: 30, padding: '0 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>🪔</button>
              <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, height: 30, padding: '0 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                {cart.length > 0 ? `✦ ${cart.length}` : '✦ Bag'}
              </button>
            </div>
          </div>
          {/* Hero */}
          <div style={{ padding: '28px 14px 20px', background: `linear-gradient(135deg, ${colors.bg}, ${colors.card})`, borderBottom: `1px solid ${colors.accent}15`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${colors.accent} 0.5px, transparent 1px)`, backgroundSize: '20px 20px', opacity: 0.06 }} />
            <p style={{ fontSize: 9, letterSpacing: '0.25em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 700 }}>Curated with Intention</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.05, color: colors.text }}>{shop.name} <span style={{ color: colors.accent }}>Collective</span></h1>
            <p style={{ fontSize: 11, color: colors.text, opacity: 0.6, margin: '0 0 14px', lineHeight: 1.6 }}>{shop.description || 'A sanctuary for mindful living.'}</p>
            <button onClick={() => document.getElementById('demo-shanti-offerings')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 16, padding: '8px 18px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>View Offerings</button>
          </div>
          {/* Category filter */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', background: colors.bg }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}35`, borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: activeCat === cat._id ? 1 : 0.7 }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {/* Products */}
          <div id="demo-shanti-offerings" style={{ padding: '6px 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: colors.card }}>
            {filtered.map(p => (
              <div key={p._id} style={{ background: colors.bg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.accent}15` }}>
                <div style={{ height: 110, background: `${colors.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, position: 'relative' }}>
                  {p.image}
                  {p.stock === 0 && <div style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444cc', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>OUT</div>}
                </div>
                <div style={{ padding: '10px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 2px', lineHeight: 1.2, color: colors.text }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: colors.accent, margin: '0 0 8px', opacity: 0.8 }}>{p.category}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 300, color: colors.text }}>{p.price.toLocaleString()}</span>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ background: p.stock > 0 ? colors.accent : colors.card, color: p.stock > 0 ? '#fff' : colors.text, border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 9, fontWeight: 600, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock <= 0 ? 0.5 : 1 }}>
                      {p.stock > 0 ? 'Add' : 'Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}15`, padding: '20px 12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 20, height: 20, background: colors.accent, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{shop.logo || '☸️'}</div>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.03em', color: colors.bg }}>{shop.name.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: 11, color: colors.bg, opacity: 0.5, margin: 0 }}>{shop.location}</p>
          </div>
        </div>
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

  // ── Kailash (compact phone — full colors.* driven) ─────────────────────────
  if (templateId === 'kailash') {
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ height: '100%', background: colors.bg, color: colors.text, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          {/* Nav */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: `${colors.bg}cc`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${colors.text}15`, padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{shop.logo || '🕉️'}</span>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.03em', color: colors.text }}>{shop.name.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.text}25`, borderRadius: 10, height: 30, padding: '0 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>🪔</button>
              <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, height: 30, padding: '0 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                {cart.length > 0 ? `✦ ${cart.length}` : 'Sacred'}
              </button>
            </div>
          </div>
          {/* Hero */}
          <div style={{ minHeight: '45vw', background: `linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.88)), url('https://picsum.photos/id/1015/2000/1200') center/cover`, padding: '28px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(at center, ${colors.accent}08, transparent 70%)` }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: 16, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', alignSelf: 'flex-start' }}>
              <div style={{ width: 1, height: 10, background: colors.accent }} /> Since the Time of the Gods
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', lineHeight: 1, letterSpacing: '-0.04em', color: '#fff' }}>WHERE<br />HEAVEN<br />MEETS EARTH</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => document.getElementById('demo-k-sanctum')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 16, padding: '8px 16px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>ENTER SANCTUM</button>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 16, padding: '8px 14px', fontSize: 11, cursor: 'pointer' }}>Oracle</button>
            </div>
          </div>
          {/* Category filter */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', background: colors.card }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}35`, borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: activeCat === cat._id ? 1 : 0.6 }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {/* Products */}
          <div id="demo-k-sanctum" style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: colors.card }}>
            {filtered.map((p, i) => {
              const grads = [
                `linear-gradient(135deg, ${colors.accent}25, ${colors.bg})`,
                `linear-gradient(135deg, ${colors.accent}18, ${colors.card})`,
                `linear-gradient(135deg, ${colors.accent}12, ${colors.bg})`,
              ]
              return (
                <div key={p._id} style={{ background: colors.bg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.accent}15` }}>
                  <div style={{ height: 110, background: grads[i % grads.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{p.image}</div>
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, margin: '0 0 2px', lineHeight: 1.2, color: colors.text }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: colors.accent, margin: '0 0 8px', opacity: 0.7 }}>{p.category}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 300, color: colors.accent }}>{p.price.toLocaleString()}</span>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ background: p.stock > 0 ? colors.accent : colors.card, color: p.stock > 0 ? '#fff' : colors.text, border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 9, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock <= 0 ? 0.5 : 1 }}>
                        {p.stock > 0 ? 'Claim' : 'Out'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}15`, padding: '20px 12px', textAlign: 'center' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>{shop.logo || '🕉️'}</span>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em', color: colors.bg }}>{shop.name.toUpperCase()}</p>
            <p style={{ fontSize: 10, color: colors.bg, opacity: 0.4, margin: 0 }}>The mountain calls. The soul answers.</p>
          </div>
        </div>
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

  // ── Legacy Story Magazine (compact phone version) ─────────────────────────
  if (templateId === 'story') {
    const storyPalettes = [
      { bg: colors.accent, text: '#fff' },
      { bg: colors.card, text: colors.text },
      { bg: colors.bg, text: colors.text },
    ]
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'var(--font-body)' }}>
        <div style={{ height: '100%', background: colors.bg, color: colors.text, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Compact header */}
          <div style={{ background: colors.accent, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{shop.logo}</span>
              <p style={{ fontWeight: 900, fontSize: 13, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{shop.name}</p>
            </div>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
              🛒{cart.length > 0 ? ` ${cart.length}` : ''}
            </button>
          </div>
          {/* Masthead */}
          <div style={{ background: colors.accent, padding: '16px 14px 20px', color: '#fff' }}>
            <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 6px' }}>Issue No. 01</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 0.9, letterSpacing: '-0.05em' }}>{shop.name}</h1>
          </div>
          {/* Category strip */}
          <div style={{ overflowX: 'auto', background: colors.card, display: 'flex', gap: 0, borderBottom: `1px solid ${colors.accent}15` }}>
            {visibleCats.map(cat => {
              const isActive = cat._id === activeCat
              return <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: 'none', border: 'none', color: isActive ? colors.accent : colors.text, padding: '8px 12px', fontSize: 10, fontWeight: 800, cursor: 'pointer', borderBottom: `2px solid ${isActive ? colors.accent : 'transparent'}`, whiteSpace: 'nowrap' }}>{cat.emoji} {cat.label}</button>
            })}
          </div>
          {/* Story cards */}
          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p, i) => {
              const pal = storyPalettes[i % storyPalettes.length]
              const isFeature = i === 0
              return (
                <div key={p._id} style={{ borderRadius: 14, overflow: 'hidden', background: pal.bg, border: `1px solid ${colors.accent}14`, display: 'flex', flexDirection: isFeature ? 'column' : 'row', minHeight: isFeature ? 160 : 80 }}>
                  <div style={{ background: isFeature ? `linear-gradient(135deg,${colors.accent}cc,${colors.accent})` : `${colors.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFeature ? 52 : 32, width: isFeature ? '100%' : 70, height: isFeature ? 100 : 'auto', flexShrink: 0 }}>{p.image}</div>
                  <div style={{ padding: isFeature ? '10px 12px' : '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
                    <div>
                      <p style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.accent, margin: '0 0 3px', opacity: 0.8, fontWeight: 700 }}>{p.category}</p>
                      <p style={{ fontWeight: 800, fontSize: isFeature ? 15 : 12, margin: 0, lineHeight: 1.2, color: pal.text }}>{p.name}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 900, fontSize: isFeature ? 17 : 13, color: pal.bg === colors.accent ? '#fff' : colors.accent }}>NPR {p.price.toLocaleString()}</span>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ background: pal.bg === colors.accent ? 'rgba(255,255,255,0.9)' : colors.accent, color: pal.bg === colors.accent ? colors.accent : '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>{p.stock > 0 ? '+ Add' : 'Out'}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: colors.accent, color: '#fff', padding: '20px 14px', textAlign: 'center', marginTop: 10 }}>
            <p style={{ fontSize: 18, margin: '0 0 4px' }}>{shop.logo}</p>
            <p style={{ fontWeight: 900, fontSize: 13, margin: 0 }}>{shop.name}</p>
          </div>
        </div>
        {/* Overlays */}
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

  // ── Minimal Lookbook (compact phone version) ───────────────────────────────
  if (templateId === 'minimal') {
    return (
      <div style={{ height: '100%', position: 'relative', fontFamily: 'var(--font-body)' }}>
        <div style={{ height: '100%', background: '#FAFAFA', color: '#111', overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Slim header */}
          <div style={{ borderBottom: '2px solid #111', padding: '0 14px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA', position: 'sticky', top: 0, zIndex: 10 }}>
            <p style={{ fontWeight: 900, fontSize: 12, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{shop.name}</p>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: '#111', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Bag{cart.length > 0 ? ` (${cart.length})` : ''}</button>
          </div>
          {/* Sparse hero */}
          <div style={{ padding: '28px 14px 20px' }}>
            <p style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 10px', fontWeight: 700 }}>Collection</p>
            <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.05em', margin: '0 0 16px' }}>{shop.name}</h1>
            <div style={{ width: 40, height: 2, background: colors.accent, borderRadius: 1 }} />
          </div>
          {/* Category pills */}
          <div style={{ padding: '0 14px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {visibleCats.map(cat => {
              const isActive = cat._id === activeCat
              return <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: isActive ? '#111' : 'transparent', color: isActive ? '#fff' : '#555', border: '1px solid #ccc', borderRadius: 3, padding: '4px 10px', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cat.label}</button>
            })}
          </div>
          {/* Table header */}
          <div style={{ padding: '0 14px 8px', borderBottom: '1px solid #ddd', display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '0 10px' }}>
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#bbb' }}>#</span>
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#bbb' }}>Product</span>
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#bbb', textAlign: 'right' }}>Price</span>
          </div>
          {/* Rows */}
          {filtered.map(p => (
            <div key={p._id} onClick={() => addToCart(p)} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '0 10px', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: `${colors.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.image}</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 12, margin: '0 0 2px', letterSpacing: '-0.01em' }}>{p.name}</p>
                <p style={{ fontSize: 9, color: '#aaa', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.category}</p>
              </div>
              <p style={{ fontWeight: 900, fontSize: 13, margin: 0, color: '#111', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>NPR {p.price.toLocaleString()}</p>
            </div>
          ))}
          {/* Minimal footer */}
          <div style={{ borderTop: '2px solid #111', padding: '20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 900, fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{shop.name}</p>
            <span style={{ fontSize: 16 }}>{shop.logo}</span>
          </div>
        </div>
        {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
        {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
      </div>
    )
  }

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
  const { activeTheme, activeTemplate, visibleProducts, shop, keywords, categories } = useShop()

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
              templateId={activeTemplate.id}
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
