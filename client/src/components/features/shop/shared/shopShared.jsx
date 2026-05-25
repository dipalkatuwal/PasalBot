import { useState, useRef, useEffect, useCallback } from 'react'

// ── Product image helper — shows uploaded photo or emoji fallback ─────────────
export function ProductImg({ product, size = 64, borderRadius = 12, fontSize, bg }) {
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
export function ProductImgFull({ product, height, bg, fontSize = 72, borderRadius = 0, children }) {
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

// ── Shop logo — image or emoji fallback ──────────────────────────────────────
export function ShopLogo({ shop, size = 40, borderRadius = 12, bg, fontSize }) {
  const fs = fontSize || Math.round(size * 0.55)
  if (shop.logoUrl) {
    return (
      <img
        src={shop.logoUrl}
        alt={shop.name}
        style={{ width: size, height: size, borderRadius, objectFit: 'cover', display: 'block', flexShrink: 0 }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius, background: bg || 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, flexShrink: 0 }}>
      {shop.logo || '🏪'}
    </div>
  )
}

// ── Social links bar — proper SVG icons, clickable ────────────────────────────
export function SocialBar({ shop, size = 22, style = {} }) {
  const links = []
  if (shop.socialLinks?.instagram) {
    const href = shop.socialLinks.instagram.startsWith('http')
      ? shop.socialLinks.instagram
      : `https://instagram.com/${shop.socialLinks.instagram.replace('@', '')}`
    links.push({ href, label: 'Instagram', color: '#E1306C', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )})
  }
  if (shop.socialLinks?.facebook) {
    const href = shop.socialLinks.facebook.startsWith('http')
      ? shop.socialLinks.facebook
      : `https://facebook.com/${shop.socialLinks.facebook}`
    links.push({ href, label: 'Facebook', color: '#1877F2', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )})
  }
  if (shop.whatsapp) {
    const num = shop.whatsapp.replace(/\D/g, '')
    links.push({ href: `https://wa.me/${num}`, label: 'WhatsApp', color: '#25D366', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )})
  }
  if (shop.website) {
    const href = shop.website.startsWith('http') ? shop.website : `https://${shop.website}`
    links.push({ href, label: 'Website', color: '#6366f1', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )})
  }
  if (!links.length) return null
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', ...style }}>
      {links.map(({ href, label, color, icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
          style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

// ── Mini bot for the public shop (runs without auth/context) ─────────────────
export function usePubBot(keywords, products, onOrderComplete) {
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
export function ChatDrawer({ colors, onClose, keywords, products, onOrderComplete }) {
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
            right: 0 !important; bottom: 0 !important; top: 0 !important;
            width: 420px !important; max-width: 420px !important;
            height: 100% !important; max-height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="pub-chat-panel" style={{
        width: '100%', maxWidth: 460, borderRadius: '32px 32px 0 0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '85vh', maxHeight: 700, background: colors.bg,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
        border: `1px solid ${colors.accent}22`, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.01em' }}>Shop Assistant</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0, fontWeight: 600 }}>Usually replies instantly</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

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

        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '0 24px 12px', flexWrap: 'wrap', flexShrink: 0 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: colors.card, border: `1px solid ${colors.accent}33`, color: colors.accent,
                borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s'
              }}>{q}</button>
            ))}
          </div>
        )}

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
export function CartDrawer({ colors, cart, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((s, p) => s + p.price, 0)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <style>{`
        .pub-cart-panel { width: 100%; max-width: 100%; }
        @media (min-width: 480px) { .pub-cart-panel { max-width: 420px; } }
        @media (min-width: 900px) { .pub-cart-panel { max-width: 480px; } }
      `}</style>

      <div className="pub-cart-panel" style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: colors.bg, boxShadow: '-20px 0 40px rgba(0,0,0,0.1)'
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
              boxShadow: `0 8px 20px ${colors.accent}44`, transition: 'all 0.2s'
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

// ── Product Detail Drawer ────────────────────────────────────────────────────
// A beautiful slide-up panel showing full product info + add-to-cart.
// Usage: <ProductDetailDrawer product={p} colors={colors} onClose={...} onAddToCart={...} />
export function ProductDetailDrawer({ product, colors, onClose, onAddToCart }) {
  const [added, setAdded] = useState(false)
  const panelRef = useRef(null)

  // Trap focus & close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleAddToCart = () => {
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Format description: turn newlines into paragraphs / bullets
  const descLines = product.description
    ? product.description.split('\n').filter(l => l.trim())
    : []

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes pdSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .pd-panel {
          animation: pdSlideUp 0.35s cubic-bezier(0.16,1,0.3,1);
          width: 100%; max-width: 560px;
          max-height: 92dvh; overflow-y: auto;
          border-radius: 32px 32px 0 0;
          scrollbar-width: none;
        }
        .pd-panel::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) {
          .pd-panel {
            max-height: 88dvh;
            border-radius: 32px;
            margin-bottom: 32px;
          }
        }
        .pd-add-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .pd-add-btn:hover { transform: translateY(-2px); }
        .pd-add-btn:active { transform: scale(0.97); }
      `}</style>

      <div ref={panelRef} className="pd-panel" style={{ background: colors.bg, boxShadow: '0 -24px 60px rgba(0,0,0,0.25)' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: `${colors.text}25` }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 20,
            background: `${colors.text}12`, border: 'none',
            width: 36, height: 36, borderRadius: 18,
            cursor: 'pointer', fontSize: 16, color: colors.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}
        >✕</button>

        {/* Product image */}
        <div style={{ margin: '12px 24px 0', borderRadius: 20, overflow: 'hidden', background: `${colors.card}` }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
              onError={e => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div style={{
            display: product.imageUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            height: 200, fontSize: 96, background: `${colors.accent}12`,
          }}>
            {product.image || '📦'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 24px 40px' }}>

          {/* Category badge */}
          {product.category && product.category !== 'General' && (
            <span style={{
              display: 'inline-block', background: `${colors.accent}18`,
              color: colors.accent, borderRadius: 20, padding: '4px 12px',
              fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: '0.02em',
            }}>
              {product.category}
            </span>
          )}

          {/* Name + price */}
          <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, margin: '0 0 8px', color: colors.text, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {product.name}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 900, color: colors.accent, margin: '0 0 4px' }}>
            NPR {product.price.toLocaleString()}
          </p>

          {/* Stock indicator */}
          <p style={{ fontSize: 13, margin: '0 0 20px', fontWeight: 600, color: product.stock > 0 ? '#22c55e' : '#ef4444' }}>
            {product.stock > 5 ? '● In stock' : product.stock > 0 ? `● Only ${product.stock} left` : '○ Out of stock'}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: `${colors.accent}15`, margin: '0 0 20px' }} />

          {/* Description */}
          {descLines.length > 0 ? (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.accent, margin: '0 0 12px', opacity: 0.8 }}>
                About this product
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {descLines.map((line, i) => {
                  // Section headers (lines like "✦ Key Features" or "📐 Dimensions")
                  const isHeader = /^[✦📐🎁🧵🚚📦🌿🍵🎨🧴💄🪔👒🧣🍯👜]/.test(line) && !line.startsWith('•')
                  const isBullet = line.startsWith('•') || line.startsWith('-')
                  return (
                    <p key={i} style={{
                      margin: 0,
                      fontSize: isHeader ? 13 : 14,
                      fontWeight: isHeader ? 800 : isBullet ? 500 : 400,
                      color: isHeader ? colors.accent : colors.text,
                      opacity: isHeader ? 1 : isBullet ? 0.85 : 0.8,
                      lineHeight: 1.65,
                      paddingLeft: isBullet ? 8 : 0,
                      marginTop: isHeader ? 10 : 0,
                    }}>
                      {line}
                    </p>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28, padding: '16px', background: `${colors.accent}08`, borderRadius: 14, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, color: colors.text, opacity: 0.45, fontStyle: 'italic' }}>No description added yet.</p>
            </div>
          )}

          {/* Delivery info strip */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              ['🚚', product.stock > 0 ? 'Fast delivery' : 'Pre-order available'],
              ['💳', 'Cash on Delivery'],
              ['🔄', 'Easy returns'],
            ].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: `${colors.accent}0d`, borderRadius: 20,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, color: colors.text,
              }}>
                <span>{icon}</span><span style={{ opacity: 0.75 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="pd-add-btn"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            style={{
              width: '100%',
              background: product.stock <= 0 ? '#9ca3af' : added ? '#22c55e' : colors.accent,
              color: '#fff', border: 'none', borderRadius: 18,
              padding: '18px', fontSize: 17, fontWeight: 900,
              fontFamily: 'var(--font-body)', cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: product.stock > 0 ? `0 8px 24px ${colors.accent}44` : 'none',
              transition: 'background 0.25s',
              letterSpacing: '-0.01em',
            }}
          >
            {product.stock <= 0 ? 'Out of Stock' : added ? '✓ Added to Bag!' : '🛍️ Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  )
}
