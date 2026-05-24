import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SHOP_THEMES } from '@/data/mockData'

// ── Product image helper — shows uploaded photo or emoji fallback ─────────────
function ProductImg({ product, size = 64, borderRadius = 12, fontSize, bg }) {
  const emojiSize = fontSize || Math.round(size * 0.5)
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: size, height: size, objectFit: 'cover',
          borderRadius, display: 'block', flexShrink: 0,
        }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: bg || 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: emojiSize, flexShrink: 0,
    }}>
      {product.image}
    </div>
  )
}

// ── Full-width product image (for card headers) ───────────────────────────────
function ProductImgFull({ product, height, bg, fontSize = 72, borderRadius = 0, children }) {
  if (product.imageUrl) {
    return (
      <div style={{ height, position: 'relative', overflow: 'hidden', borderRadius }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.currentTarget.parentElement.innerHTML = `<div style="height:${height}px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px">${product.image}</div>` }}
        />
        {children}
      </div>
    )
  }
  return (
    <div style={{ height, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, position: 'relative', borderRadius }}>
      {product.image}
      {children}
    </div>
  )
}

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
                <ProductImg product={p} size={64} borderRadius={12} bg={colors.card} />
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



// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Himalayan Store   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
function HimalayanStoreUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]
  const filtered = activeCat === 'all' ? products
    : products.filter(p => { const cat = categories.find(c => c._id === activeCat); return cat && p.category?.toLowerCase() === cat.label.toLowerCase() })
  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .h-pgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 640px) { .h-pgrid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
        @media (min-width: 900px) { .h-pgrid { grid-template-columns: repeat(4, 1fr); gap: 24px; } }
        .h-cgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 640px) { .h-cgrid { grid-template-columns: repeat(4, 1fr); } }
        .h-card { transition: transform 0.3s, box-shadow 0.3s; }
        .h-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
        .h-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px 48px; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${colors.bg}f5`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${colors.accent}20` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{shop.logo || '🏔️'}</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: colors.text }}>{shop.name}</p>
              <p style={{ fontSize: 11, margin: 0, color: colors.accent, opacity: 0.7 }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setChatOpen(true)} style={{ padding: '0 16px', height: 40, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>💬 Chat</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', padding: '0 18px', height: 40, background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              🛍️ Bag{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url('https://picsum.photos/id/1015/2000/1200') center/cover`, padding: '60px 24px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 600 }}>
          <h1 style={{ fontSize: 'clamp(36px,7vw,80px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1, letterSpacing: '-0.05em' }}>{shop.name}</h1>
          {shop.tagline && <p style={{ fontSize: 'clamp(13px,2vw,16px)', opacity: 0.75, margin: '-8px 0 12px', fontStyle: 'italic', letterSpacing: '0.03em' }}>{shop.tagline}</p>}
          <p style={{ fontSize: 'clamp(15px,2.5vw,20px)', opacity: 0.9, margin: '0 0 32px' }}>{shop.description || 'Authentic Nepali treasures delivered with love'}</p>
          <button onClick={() => document.getElementById('h-products')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '14px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px ${colors.accent}55` }}>
            Shop Now →
          </button>
        </div>
      </section>

      {/* Trust bar */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}15`, padding: '18px 24px' }}>
        <div className="h-trust" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {[['📍', shop.location || 'Kathmandu Valley', 'Local Delivery'], ['🛡️', 'Secure Payment', 'Cash on Delivery'], ['🚚', '1–2 Days Delivery', 'Across Nepal']].map(([icon, label, sub]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>{icon}</span>
              <div><p style={{ fontWeight: 700, margin: 0, fontSize: 14, color: colors.text }}>{label}</p><p style={{ fontSize: 12, color: colors.accent, margin: 0, opacity: 0.8 }}>{sub}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section style={{ padding: 'clamp(32px,5vw,56px) 24px', background: colors.bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, marginBottom: 28, color: colors.text }}>Shop by Category</h2>
          <div className="h-cgrid">
            {visibleCats.filter(c => c._id !== 'all').slice(0, 4).map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : colors.card, color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}20`, borderRadius: 20, padding: '20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', boxShadow: activeCat === cat._id ? `0 8px 20px ${colors.accent}33` : 'none' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="h-products" style={{ padding: 'clamp(32px,5vw,60px) 24px', background: `${colors.accent}06` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 900, margin: 0, color: colors.text }}>Featured Collection</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {visibleCats.map(cat => (
                <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${activeCat === cat._id ? colors.accent : colors.accent + '40'}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{cat.label}</button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🛍️</p><p style={{ fontWeight: 700 }}>No products here yet.</p></div>
          ) : (
            <div className="h-pgrid">
              {filtered.map(p => (
                <div key={p._id} className="h-card" style={{ background: colors.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.accent}10` }}>
                  <ProductImgFull product={p} height={200} bg={`linear-gradient(135deg, ${colors.bg}, ${colors.card})`} fontSize={72} />
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: colors.text }}>{p.name}</p>
                    <p style={{ fontWeight: 900, fontSize: 18, color: colors.accent, margin: '0 0 14px' }}>NPR {p.price.toLocaleString()}</p>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 14, padding: '12px', fontSize: 13, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed' }}>
                      {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: colors.text, color: colors.bg, padding: 'clamp(40px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div><h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: colors.bg }}>{shop.name}</h3><p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7 }}>{shop.description || 'Curating authentic Nepali craftsmanship.'}</p></div>
          <div><h4 style={{ fontWeight: 700, margin: '0 0 12px', fontSize: 13, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact</h4><p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7 }}>{shop.location}<br />{shop.phone}{shop.whatsapp && <><br />WhatsApp: {shop.whatsapp}</>}</p></div>
          <div><h4 style={{ fontWeight: 700, margin: '0 0 12px', fontSize: 13, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {shop.socialLinks?.instagram && <a href={shop.socialLinks.instagram.startsWith('http') ? shop.socialLinks.instagram : `https://instagram.com/${shop.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 24, textDecoration: 'none' }}>📸</a>}
              {shop.socialLinks?.facebook && <a href={shop.socialLinks.facebook.startsWith('http') ? shop.socialLinks.facebook : `https://facebook.com/${shop.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 24, textDecoration: 'none' }}>📘</a>}
              {shop.whatsapp && <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 24, textDecoration: 'none' }}>💬</a>}
              {shop.website && <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 24, textDecoration: 'none' }}>🌐</a>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Himalaya Haven   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
function HimalayanHavenUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]
  const filtered = activeCat === 'all' ? products
    : products.filter(p => { const cat = categories.find(c => c._id === activeCat); return cat && p.category?.toLowerCase() === cat.label.toLowerCase() })
  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Georgia', serif", overflowX: 'hidden' }}>
      <style>{`
        .haven-card { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s; }
        .haven-card:hover { transform: scale(1.03) rotate(1deg); box-shadow: 0 24px 48px rgba(0,0,0,0.13) !important; }
        .haven-pgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media (min-width: 640px) { .haven-pgrid { grid-template-columns: repeat(3, 1fr); gap: 28px; } }
        @media (min-width: 900px) { .haven-pgrid { grid-template-columns: repeat(4, 1fr); gap: 32px; } }
        .haven-cats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (min-width: 640px) { .haven-cats { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {/* Nav */}
      <nav style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}20`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 40 }}>{shop.logo || '🏔️'}</span>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: colors.accent, letterSpacing: '-0.02em' }}>{shop.name}</h1>
              <p style={{ fontSize: 11, color: colors.accent, opacity: 0.7, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'system-ui' }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 20, padding: '0 16px', height: 38, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>💬 Guide</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 18px', height: 38, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
              🛍️ Bag{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url('https://picsum.photos/id/1015/2000/1200') center/cover`, padding: '80px 24px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ color: '#fff', maxWidth: 560 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.card, margin: '0 0 16px', fontFamily: 'system-ui' }}>Authentic Himalayan Goods</p>
            <h1 style={{ fontSize: 'clamp(40px,7vw,80px)', fontWeight: 700, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.03em' }}>{shop.name}</h1>
            <p style={{ fontSize: 'clamp(15px,2vw,19px)', opacity: 0.85, margin: '0 0 32px', lineHeight: 1.6 }}>{shop.description || 'Bringing the soul of the Himalayas to your home.'}</p>
            <button onClick={() => document.getElementById('haven-shop')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '16px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', boxShadow: `0 8px 24px ${colors.accent}55` }}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Trust pills */}
      <div style={{ background: colors.card, padding: '18px 24px', borderBottom: `1px solid ${colors.accent}15` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['📍', shop.location || 'Kathmandu'], ['🛡️', 'Cash on Delivery'], ['🚚', '1–2 Day Delivery'], ['♻️', 'Easy Returns']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${colors.accent}12`, borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: 'system-ui' }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category showcase */}
      <section style={{ padding: 'clamp(40px,6vw,70px) 24px', background: colors.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, textAlign: 'center', marginBottom: 32, color: colors.accent }}>Explore by Collection</h2>
          <div className="haven-cats">
            {visibleCats.filter(c => c._id !== 'all').slice(0, 4).map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)}
                style={{ background: activeCat === cat._id ? colors.accent : colors.card, color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}20`, borderRadius: 20, padding: '28px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', fontFamily: 'Georgia, serif', boxShadow: activeCat === cat._id ? `0 8px 20px ${colors.accent}33` : 'none' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{cat.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="haven-shop" style={{ padding: 'clamp(40px,6vw,70px) 24px', background: `${colors.accent}08` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, margin: 0, color: colors.accent, letterSpacing: '-0.02em' }}>Featured Treasures</h2>
            <button onClick={() => setChatOpen(true)} style={{ background: 'none', border: 'none', color: colors.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 4 }}>Need help choosing? →</button>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🛍️</p><p style={{ fontWeight: 700, fontFamily: 'system-ui' }}>No products yet.</p></div>
          ) : (
            <div className="haven-pgrid">
              {filtered.map(p => (
                <div key={p._id} className="haven-card" style={{ background: colors.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: `1px solid ${colors.accent}10` }}>
                  <ProductImgFull product={p} height={220} bg={`linear-gradient(135deg, ${colors.bg}, ${colors.card})`} fontSize={80} />
                  <div style={{ padding: '18px' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: colors.text }}>{p.name}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: colors.accent, margin: '0 0 14px', fontFamily: 'system-ui' }}>NPR {p.price.toLocaleString()}</p>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ width: '100%', background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 16, padding: '12px', fontSize: 13, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', fontFamily: 'system-ui' }}>
                      {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: colors.text, color: colors.bg, padding: 'clamp(40px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 36 }}>{shop.logo || '🏔️'}</span>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: colors.bg }}>{shop.name}</h3>
            </div>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7, fontFamily: 'system-ui' }}>{shop.description || 'Bringing the soul of the Himalayas to your home.'}</p>
          </div>
          <div>
            <h4 style={{ color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, margin: '0 0 14px', fontFamily: 'system-ui' }}>Visit Us</h4>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7, fontFamily: 'system-ui' }}>{shop.location || 'Thamel, Kathmandu'}<br />{shop.phone}</p>
          </div>
          <div>
            <h4 style={{ color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, margin: '0 0 14px', fontFamily: 'system-ui' }}>Connect</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {shop.socialLinks?.instagram && <a href={shop.socialLinks.instagram.startsWith('http') ? shop.socialLinks.instagram : `https://instagram.com/${shop.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>📸</a>}
              {shop.socialLinks?.facebook && <a href={shop.socialLinks.facebook.startsWith('http') ? shop.socialLinks.facebook : `https://facebook.com/${shop.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>📘</a>}
              {shop.whatsapp && <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>💬</a>}
              {shop.website && <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>🌐</a>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — Shanti Collective   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
function ShantiCollectiveUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]
  const filtered = activeCat === 'all' ? products
    : products.filter(p => { const cat = categories.find(c => c._id === activeCat); return cat && p.category?.toLowerCase() === cat.label.toLowerCase() })
  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }

  // For dark templates: detect if bg is dark to pick text contrast
  const isDark = colors.bg.toLowerCase() < '#888888'
  const surfaceBg = isDark ? `${colors.text}22` : colors.card
  const surfaceBorder = `${colors.accent}25`

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .shanti-card { transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s; }
        .shanti-card:hover { transform: translateY(-12px) rotate(2deg); box-shadow: 0 30px 60px ${colors.accent}33 !important; }
        .shanti-pgrid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 500px)  { .shanti-pgrid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px)  { .shanti-pgrid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px) { .shanti-pgrid { grid-template-columns: repeat(4, 1fr); } }
        .shanti-hero { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
        @media (min-width: 900px) { .shanti-hero { grid-template-columns: 1fr 1fr; } }
        .shanti-add-btn { background: ${surfaceBg}; color: ${colors.text}; border: 1px solid ${surfaceBorder}; border-radius: 14px; padding: 14px; width: 100%; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .shanti-add-btn:hover:not(:disabled) { background: ${colors.accent}; color: #fff; border-color: ${colors.accent}; }
        .shanti-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `${colors.bg}dd`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.accent}20`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: colors.accent, color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transform: 'rotate(12deg)' }}>{shop.logo || '☸️'}</div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: colors.text }}>{shop.name.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30`, borderRadius: 20, padding: '0 16px', height: 38, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🪔 Keeper</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 18px', height: 38, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Sanctuary {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — split */}
      <section style={{ minHeight: '100vh', padding: '68px 24px 80px', display: 'flex', alignItems: 'center', background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.card} 100%)`, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${colors.accent} 0.5px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.06 }} />
        <div className="shanti-hero" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', padding: '80px 0' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 20px', fontWeight: 700 }}>Curated with Intention</p>
            <h1 style={{ fontSize: 'clamp(40px,6vw,90px)', fontWeight: 800, margin: '0 0 24px', lineHeight: 1, letterSpacing: '-0.04em', color: colors.text }}>
              {shop.name}<br /><span style={{ color: colors.accent }}>Collective</span>
            </h1>
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: colors.text, opacity: 0.7, margin: '0 0 36px', lineHeight: 1.7, maxWidth: 480 }}>{shop.description || 'A sanctuary for mindful living and cultural preservation.'}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('shanti-offerings')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>View Offerings</button>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Speak with Keeper</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ aspectRatio: '1', width: 'clamp(200px,40vw,400px)', background: colors.card, borderRadius: '3rem', border: `1px solid ${colors.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120 }}>{shop.logo || '☸️'}</div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section id="shanti-offerings" style={{ padding: 'clamp(60px,8vw,112px) 24px', background: colors.card }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 700 }}>Curated with Intention</p>
              <h2 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05, color: colors.text }}>Living Offerings</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {visibleCats.map(cat => (
                <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: activeCat === cat._id ? 1 : 0.7 }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🪔</p><p>No offerings yet.</p></div>
          ) : (
            <div className="shanti-pgrid">
              {filtered.map(p => (
                <div key={p._id} className="shanti-card" style={{ background: colors.bg, borderRadius: 24, overflow: 'hidden', border: `1px solid ${colors.accent}15` }}>
                  <ProductImgFull product={p} height={240} bg={`${colors.accent}10`} fontSize={80}>
                    {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>LIMITED</div>}
                    {p.stock === 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>SOLD OUT</div>}
                  </ProductImgFull>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <p style={{ fontWeight: 600, fontSize: 16, margin: '0 0 4px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                        <p style={{ color: colors.accent, fontSize: 12, margin: 0, opacity: 0.8 }}>{p.category}</p>
                      </div>
                      <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 300, margin: 0, whiteSpace: 'nowrap', color: colors.text }}>{p.price.toLocaleString()}</p>
                    </div>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="shanti-add-btn">
                      {p.stock > 0 ? 'Add to Sanctuary' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}20`, padding: 'clamp(40px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: colors.accent, color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{shop.logo || '☸️'}</div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: colors.bg }}>{shop.name.toUpperCase()}</span>
            </div>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.description || 'A sanctuary for mindful living.'}</p>
          </div>
          <div>
            <p style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 700 }}>Contact</p>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.location}<br />{shop.phone}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingTop: 24, flexWrap: 'wrap' }}>
            {shop.socialLinks?.instagram && <a href={shop.socialLinks.instagram.startsWith('http') ? shop.socialLinks.instagram : `https://instagram.com/${shop.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>📸</a>}
            {shop.socialLinks?.facebook && <a href={shop.socialLinks.facebook.startsWith('http') ? shop.socialLinks.facebook : `https://facebook.com/${shop.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>📘</a>}
            {shop.whatsapp && <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>💬</a>}
            {shop.website && <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 28, textDecoration: 'none' }}>🌐</a>}
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Kailash   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
function KailashUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]
  const filtered = activeCat === 'all' ? products
    : products.filter(p => { const cat = categories.find(c => c._id === activeCat); return cat && p.category?.toLowerCase() === cat.label.toLowerCase() })
  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        .k-heading { font-family: 'Playfair Display', Georgia, serif; }
        .k-card { transition: transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s; border: 1px solid ${colors.accent}15; }
        .k-card:hover { transform: scale(1.04) rotate(1deg); box-shadow: 0 40px 80px ${colors.accent}25 !important; }
        .k-pgrid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 600px)  { .k-pgrid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1000px) { .k-pgrid { grid-template-columns: repeat(3, 1fr); } }
        .k-float { animation: kfloat 6s ease-in-out infinite; }
        @keyframes kfloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .k-legacy { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
        @media (min-width: 900px) { .k-legacy { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `${colors.bg}cc`, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${colors.text}15`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="k-float" style={{ fontSize: 36 }}>{shop.logo || '🕉️'}</span>
            <span className="k-heading" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: colors.text }}>{shop.name.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.text}30`, borderRadius: 20, padding: '0 18px', height: 40, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🪔 Oracle</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 18px', height: 40, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Collection {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', paddingTop: 72, display: 'flex', alignItems: 'center', background: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('https://picsum.photos/id/1015/2000/1200') center/cover fixed`, padding: '72px 24px 80px', boxSizing: 'border-box', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(at center, ${colors.accent}08 0%, transparent 70%)` }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: 20, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>
              <div style={{ width: 1, height: 16, background: colors.accent }} />Since the Time of the Gods
            </div>
            <h1 className="k-heading" style={{ fontSize: 'clamp(48px,9vw,110px)', fontWeight: 900, margin: '0 0 24px', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#fff' }}>WHERE<br />HEAVEN<br />MEETS EARTH</h1>
            <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', color: colors.accent, maxWidth: 480, lineHeight: 1.6, margin: '0 0 40px', opacity: 0.9 }}>{shop.description || 'Timeless treasures from the Himalayas. Crafted by hands that have touched the divine.'}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('k-sanctum')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '16px 40px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>ENTER THE SANCTUM</button>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '16px 30px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Speak to the Oracle</button>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 48, right: 24, textAlign: 'right' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Current Moon Phase</p>
          <div style={{ fontSize: 48, lineHeight: 1 }}>🌕</div>
          <p style={{ fontSize: 12, color: colors.accent, margin: '4px 0 0' }}>Full Moon • Auspicious Day</p>
        </div>
      </section>

      {/* Sanctum */}
      <section id="k-sanctum" style={{ padding: 'clamp(60px,8vw,112px) 24px', background: colors.card }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,80px)' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.4em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 700 }}>The Divine Collection</p>
            <h2 className="k-heading" style={{ fontSize: 'clamp(32px,6vw,72px)', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: colors.text }}>Offerings from Kailash</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: activeCat === cat._id ? 1 : 0.6 }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🕉️</p><p>No offerings yet.</p></div>
          ) : (
            <div className="k-pgrid">
              {filtered.map((p, i) => {
                // gradient uses accent color family instead of hardcoded browns/purples
                const gradients = [
                  `linear-gradient(135deg, ${colors.accent}30, ${colors.bg})`,
                  `linear-gradient(135deg, ${colors.accent}20, ${colors.card})`,
                  `linear-gradient(135deg, ${colors.accent}15, ${colors.bg})`,
                ]
                return (
                  <div key={p._id} className="k-card" style={{ background: colors.bg, borderRadius: 24, overflow: 'hidden' }}>
                    <ProductImgFull product={p} height={280} bg={gradients[i % gradients.length]} fontSize={100}>
                      {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 20, left: 20, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 20, letterSpacing: '0.15em' }}>RARE</div>}
                      {p.stock === 0 && <div style={{ position: 'absolute', top: 20, left: 20, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 20 }}>SOLD OUT</div>}
                    </ProductImgFull>
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <p className="k-heading" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                          <p style={{ color: colors.accent, fontSize: 12, margin: 0, opacity: 0.7 }}>{p.category}</p>
                        </div>
                        <p className="k-heading" style={{ fontSize: 28, fontWeight: 300, color: colors.accent, margin: 0, whiteSpace: 'nowrap' }}>{p.price.toLocaleString()}</p>
                      </div>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)}
                        style={{ width: '100%', background: p.stock > 0 ? colors.accent : colors.card, color: p.stock > 0 ? '#fff' : colors.text, border: 'none', borderRadius: 20, padding: '16px', fontSize: 14, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock <= 0 ? 0.5 : 1 }}>
                        {p.stock > 0 ? 'Claim This Blessing' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Legacy section */}
      <section style={{ padding: 'clamp(60px,8vw,128px) 24px', background: colors.bg }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="k-legacy">
            <div style={{ borderRadius: 24, background: colors.card, aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 160, border: `1px solid ${colors.accent}10` }}>🏔️</div>
            <div style={{ padding: 'clamp(0px,4vw,40px)' }}>
              <p style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 20px', fontWeight: 700 }}>A Legacy Carved in Stone</p>
              <h2 className="k-heading" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, margin: '0 0 28px', lineHeight: 1.1, color: colors.text }}>For generations, our families have guarded these traditions.</h2>
              <p style={{ fontSize: 17, color: colors.text, opacity: 0.6, lineHeight: 1.8, margin: '0 0 40px' }}>Every thread, every carving, every scent carries the prayers of generations. When you take these objects home, you become part of an unbroken chain.</p>
              <div style={{ borderTop: `1px solid ${colors.accent}20`, paddingTop: 32, display: 'flex', gap: 40 }}>
                {[['47', 'Master Artisans'], ['12', 'Generations'], ['∞', 'Blessings']].map(([n, l]) => (
                  <div key={l}>
                    <p className="k-heading" style={{ fontSize: 40, fontWeight: 300, margin: 0, lineHeight: 1, color: colors.text }}>{n}</p>
                    <p style={{ fontSize: 12, color: colors.accent, margin: '8px 0 0', letterSpacing: '0.05em', opacity: 0.7 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}15`, padding: 'clamp(60px,8vw,96px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <span className="k-float" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>{shop.logo || '🕉️'}</span>
          <h2 className="k-heading" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.03em', color: colors.bg }}>{shop.name.toUpperCase()}</h2>
          <p style={{ color: colors.bg, opacity: 0.5, margin: '0 0 40px', fontSize: 15 }}>The mountain calls. The soul answers.</p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: colors.bg, opacity: 0.5 }}>
            <span>{shop.location || 'Kathmandu, Nepal'}</span>
            <span>{shop.phone}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── LEGACY Story Magazine Template (kept for backward compatibility) ──────────
function StoryShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')

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

  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }
  const cartTotal = cart.reduce((s, p) => s + p.price, 0)

  // Palettes for editorial "story cards"
  const storyPalettes = [
    { bg: colors.accent, text: '#fff' },
    { bg: colors.card, text: colors.text },
    { bg: colors.bg, text: colors.text },
  ]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        .story-root { --gutter: 16px; }
        @media (min-width: 600px) { .story-root { --gutter: 28px; } }
        @media (min-width: 900px) { .story-root { --gutter: 48px; } }
        .story-card:hover .story-overlay { opacity: 1 !important; }
        .story-card:hover { transform: scale(1.01); }
        .story-card { transition: transform 0.3s ease; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${colors.bg}f0`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.accent}18` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--gutter, 16px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{shop.logo}</span>
            <div>
              <p style={{ fontWeight: 900, fontSize: 17, margin: 0, letterSpacing: '-0.04em' }}>{shop.name}</p>
              <p style={{ fontSize: 10, margin: 0, opacity: 0.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}18`, border: 'none', color: colors.accent, borderRadius: 10, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>💬</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, border: 'none', color: '#fff', borderRadius: 10, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', position: 'relative' }}>
              🛒{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 6, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Magazine Masthead */}
      <section style={{ background: colors.accent, color: '#fff', padding: 'clamp(40px,6vw,80px) var(--gutter,16px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <p style={{ fontSize: 'clamp(11px,2vw,13px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', opacity: 0.75, margin: '0 0 16px' }}>Issue No. 01 · {shop.name}</p>
        <h1 style={{ fontSize: 'clamp(36px,8vw,96px)', fontWeight: 900, margin: 0, lineHeight: 0.9, letterSpacing: '-0.05em' }}>{shop.name}</h1>
        <p style={{ fontSize: 'clamp(14px,2.5vw,20px)', opacity: 0.8, margin: '20px 0 0', maxWidth: 500, marginInline: 'auto' }}>{shop.description || 'Curated with care. Delivered with love.'}</p>
      </section>

      {/* Category Strip */}
      <div style={{ overflowX: 'auto', borderBottom: `1px solid ${colors.accent}15`, background: colors.card }}>
        <div style={{ display: 'flex', gap: 0, maxWidth: 900, margin: '0 auto', padding: '0 var(--gutter,16px)' }}>
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: 'none', border: 'none', color: isActive ? colors.accent : colors.text,
                padding: '14px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                borderBottom: `3px solid ${isActive ? colors.accent : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '-0.01em'
              }}>
                {cat.emoji} {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Story Cards — editorial layout */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px,4vw,48px) var(--gutter,16px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.3 }}>
            <p style={{ fontSize: 64, margin: '0 0 16px' }}>📰</p>
            <p style={{ fontWeight: 700 }}>No stories here yet.</p>
          </div>
        )}
        {filtered.map((p, i) => {
          const pal = storyPalettes[i % storyPalettes.length]
          const isFeature = i === 0 // first card is big
          return (
            <div key={p._id} className="story-card" style={{
              borderRadius: 24, overflow: 'hidden', position: 'relative',
              minHeight: isFeature ? 340 : 180,
              background: pal.bg,
              display: 'flex', flexDirection: isFeature ? 'column' : 'row',
              border: `1px solid ${colors.accent}14`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              cursor: 'pointer',
            }}>
              {/* Image / Emoji art panel */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: isFeature ? '100%' : 130,
                    minWidth: isFeature ? 'unset' : 130,
                    height: isFeature ? 200 : '100%',
                    minHeight: isFeature ? 'unset' : 130,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
              <div style={{
                background: isFeature ? `linear-gradient(135deg, ${colors.accent}cc, ${colors.accent})` : `${colors.accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFeature ? 96 : 56,
                width: isFeature ? '100%' : 130,
                minWidth: isFeature ? 'unset' : 130,
                height: isFeature ? 200 : 'auto',
                flexShrink: 0,
              }}>
                {p.image}
              </div>
              )}
              {/* Text */}
              <div style={{ flex: 1, padding: isFeature ? '24px 28px' : '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, margin: '0 0 8px', opacity: 0.8 }}>{p.category}</p>
                  <h2 style={{ fontSize: isFeature ? 'clamp(20px,4vw,30px)' : 'clamp(15px,3vw,19px)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.15, letterSpacing: '-0.03em', color: pal.text }}>{p.name}</h2>
                  <p style={{ fontSize: 13, opacity: 0.6, margin: 0, color: pal.text, lineHeight: 1.5 }}>In stock: {p.stock} available</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isFeature ? 28 : 22, fontWeight: 900, color: pal.bg === colors.accent ? '#fff' : colors.accent, letterSpacing: '-0.03em' }}>NPR {p.price.toLocaleString()}</span>
                  <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{
                    background: pal.bg === colors.accent ? 'rgba(255,255,255,0.9)' : colors.accent,
                    color: pal.bg === colors.accent ? colors.accent : '#fff',
                    border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: p.stock <= 0 ? 0.4 : 1, transition: 'all 0.2s'
                  }}>
                    {p.stock > 0 ? 'Add to Bag →' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Footer */}
      <footer style={{ background: colors.accent, color: '#fff', padding: 'clamp(32px,5vw,60px) var(--gutter,16px)', textAlign: 'center' }}>
        <p style={{ fontSize: 28, margin: '0 0 8px' }}>{shop.logo}</p>
        <p style={{ fontWeight: 900, fontSize: 20, margin: '0 0 8px', letterSpacing: '-0.04em' }}>{shop.name}</p>
        <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>{shop.location} · {shop.phone}</p>
      </footer>
    </div>
  )
}

// ── Minimal Lookbook Template ────────────────────────────────────────────────
function MinimalShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const [hovered, setHovered] = useState(null)

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

  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        .minimal-row { transition: background 0.2s; }
        .minimal-row:hover { background: ${colors.accent}08 !important; }
        .minimal-add-btn { opacity: 0; transition: opacity 0.2s; }
        .minimal-row:hover .minimal-add-btn { opacity: 1 !important; }
      `}</style>

      {/* Spare header — just a thin line + name */}
      <header style={{ borderBottom: `2px solid #111`, position: 'sticky', top: 0, zIndex: 100, background: '#FAFAFA' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(16px,4vw,48px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{shop.logo}</span>
            <p style={{ fontWeight: 900, fontSize: 16, margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{shop.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setChatOpen(true)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#555', letterSpacing: '0.04em' }}>Chat</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: '#111', border: 'none', color: '#fff', borderRadius: 6, height: 34, padding: '0 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', position: 'relative', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Bag {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </header>

      {/* Spare hero — just typography */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,48px) clamp(32px,4vw,64px)' }}>
        <p style={{ fontSize: 'clamp(10px,1.5vw,12px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', color: '#888', margin: '0 0 24px' }}>Collection</p>
        <h1 style={{ fontSize: 'clamp(40px,8vw,100px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.05em', margin: '0 0 32px', color: '#111' }}>{shop.name}</h1>
        <div style={{ width: 60, height: 3, background: colors.accent, borderRadius: 2 }} />
        {shop.description && <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: '#555', margin: '32px 0 0', lineHeight: 1.6, maxWidth: 520 }}>{shop.description}</p>}
      </section>

      {/* Category pills — minimal, text only */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 0', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 0 }}>
        {visibleCats.map(cat => {
          const isActive = cat._id === activeCat
          return (
            <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
              background: isActive ? '#111' : 'transparent',
              color: isActive ? '#fff' : '#555',
              border: '1px solid #ccc', borderRadius: 4, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s'
            }}>
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Lookbook table */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto auto', gap: '0 24px', padding: '0 0 12px', borderBottom: '1px solid #ddd', marginBottom: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>#</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>Product</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right' }}>Price</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right', minWidth: 80 }}></span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', opacity: 0.3 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>No items in this collection.</p>
          </div>
        )}

        {filtered.map((p, i) => (
          <div key={p._id} className="minimal-row" onMouseEnter={() => setHovered(p._id)} onMouseLeave={() => setHovered(null)}
            style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto auto', gap: '0 24px', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #eee', background: 'transparent' }}>
            {/* Product thumbnail */}
            <ProductImg product={p} size={52} borderRadius={8} bg={`${colors.accent}12`} fontSize={26} />
            {/* Name + meta */}
            <div>
              <p style={{ fontWeight: 800, fontSize: 'clamp(14px,2vw,17px)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{p.name}</p>
              <p style={{ fontSize: 11, color: '#999', margin: 0, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{p.category} · {p.stock} in stock</p>
            </div>
            {/* Price */}
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', fontWeight: 900, color: '#111', margin: 0, textAlign: 'right', whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>NPR {p.price.toLocaleString()}</p>
            {/* Add btn — appears on hover */}
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="minimal-add-btn" style={{
                background: p.stock > 0 ? colors.accent : '#ccc', color: '#fff', border: 'none', borderRadius: 6,
                padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                {p.stock > 0 ? '+ Add' : 'Out'}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Minimal footer */}
      <footer style={{ borderTop: '2px solid #111', padding: 'clamp(32px,4vw,60px) clamp(16px,4vw,48px)', maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 6px', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{shop.name}</p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{shop.location} · {shop.phone}</p>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {shop.socialLinks?.facebook && <a href={shop.socialLinks.facebook.startsWith('http') ? shop.socialLinks.facebook : `https://facebook.com/${shop.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20, textDecoration: 'none' }}>📘</a>}
          {shop.socialLinks?.instagram && <a href={shop.socialLinks.instagram.startsWith('http') ? shop.socialLinks.instagram : `https://instagram.com/${shop.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20, textDecoration: 'none' }}>📸</a>}
          {shop.whatsapp && <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20, textDecoration: 'none' }}>💬</a>}
          {shop.website && <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20, textDecoration: 'none' }}>🌐</a>}
        </div>
      </footer>
    </div>
  )
}

// ── Reusable Shop UI Component ───────────────────────────────────────────────
export function ShopUI({ shop, products, keywords, categories, themeId, templateId }) {
  const [activeCat,  setActiveCat]  = useState('all')
  const [cart,       setCart]       = useState([])
  const [chatOpen,   setChatOpen]   = useState(false)
  const [cartOpen,   setCartOpen]   = useState(false)

  const colors   = SHOP_THEMES.find(t => t.id === themeId)?.colors || SHOP_THEMES[0].colors

  // Shared overlay components that all templates reuse
  const sharedOverlays = (
    <>
      {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={(i) => setCart(c => c.filter((_, j) => j !== i))} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setChatOpen(true) }} />}
      {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={async () => setCart([])} />}
    </>
  )

  // ── New templates from templates.zip ──────────────────────────────────────
  if (templateId === 'himalayan') {
    return (
      <>
        <HimalayanStoreUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} setChatOpen={setChatOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }
  if (templateId === 'haven') {
    return (
      <>
        <HimalayanHavenUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} setChatOpen={setChatOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }
  if (templateId === 'shanti') {
    return (
      <>
        <ShantiCollectiveUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} setChatOpen={setChatOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }
  if (templateId === 'kailash') {
    return (
      <>
        <KailashUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} setChatOpen={setChatOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }

  // ── Legacy templates (story / minimal / grid / boutique) ─────────────────
  if (templateId === 'story') {
    return (
      <>
        <StoryShopUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} chatOpen={chatOpen} setChatOpen={setChatOpen} cartOpen={cartOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }
  if (templateId === 'minimal') {
    return (
      <>
        <MinimalShopUI shop={shop} products={products} keywords={keywords} categories={categories} colors={colors} cart={cart} setCart={setCart} chatOpen={chatOpen} setChatOpen={setChatOpen} cartOpen={cartOpen} setCartOpen={setCartOpen} />
        {sharedOverlays}
      </>
    )
  }

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
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'clamp(12px, 2.5cqw, 20px)', display: 'block' }}
                />
              ) : (
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(40px, 10cqw, 64px)', borderRadius: 'clamp(12px, 2.5cqw, 20px)', background: colors.bg }}>
                {p.image}
              </div>
              )}
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
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {shop.socialLinks?.facebook && <a href={shop.socialLinks.facebook.startsWith('http') ? shop.socialLinks.facebook : `https://facebook.com/${shop.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(18px, 3cqw, 20px)', textDecoration: 'none' }}>📘</a>}
              {shop.socialLinks?.instagram && <a href={shop.socialLinks.instagram.startsWith('http') ? shop.socialLinks.instagram : `https://instagram.com/${shop.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(18px, 3cqw, 20px)', textDecoration: 'none' }}>📸</a>}
              {shop.whatsapp && <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(18px, 3cqw, 20px)', textDecoration: 'none' }}>💬</a>}
              {shop.website && <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(18px, 3cqw, 20px)', textDecoration: 'none' }}>🌐</a>}
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
      templateId={shopData.activeTemplate}
    />
  )
}
