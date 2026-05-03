import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { useUI } from '@/context/UIContext'
import { useBot } from '@/hooks/useBot'
import { formatNPR } from '@/utils/formatters'
import { useRef, useEffect } from 'react'

function ChatTab({ colors }) {
  const { messages, sendMessage, quickReplies } = useBot()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const submit = () => { if (!input.trim()) return; sendMessage(input); setInput('') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', borderRadius: 12, padding: '9px 13px', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              background: m.from === 'user' ? colors.accent : colors.card,
              color:      m.from === 'user' ? '#fff' : colors.text,
              border:     m.from === 'bot' ? `1px solid ${colors.accent}33` : 'none',
            }}>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 0.75rem 0.5rem', flexWrap: 'wrap' }}>
        {quickReplies.map(q => (
          <button key={q} onClick={() => sendMessage(q)}
            style={{ background: colors.card, border: `1px solid ${colors.accent}44`, color: colors.accent, borderRadius: 99, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{q}</button>
        ))}
      </div>
      <div style={{ padding: '0.75rem', borderTop: `1px solid ${colors.accent}22`, display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Ask about price, stock…"
          style={{ flex: 1, border: `1px solid ${colors.accent}44`, borderRadius: 10, padding: '8px 12px', fontSize: 13, background: colors.card, color: colors.text, outline: 'none', fontFamily: 'var(--font-body)' }} />
        <button onClick={submit}
          style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>→</button>
      </div>
    </div>
  )
}

export function DemoShop() {
  const { demoShopOpen, closeDemoShop } = useUI()
  const { activeTheme, visibleProducts, shop } = useShop()
  const [tab, setTab]   = useState('shop')
  const [cart, setCart] = useState([])

  if (!demoShopOpen) return null

  const { colors } = activeTheme
  const total = cart.reduce((s, p) => s + p.price, 0)

  const TABS = [
    { id: 'shop', label: '🛍️' },
    { id: 'bot',  label: '💬' },
    { id: 'cart', label: `🛒${cart.length > 0 ? ` ${cart.length}` : ''}` },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '1.5rem' }}
      onClick={e => e.target === e.currentTarget && closeDemoShop()}>
      <div style={{ width: '100%', maxWidth: 420, background: colors.bg, borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ background: colors.accent, padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#fff' }}>{shop.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>pasalbot.com/shop/{shop.slug}</p>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {t.label}
              </button>
            ))}
            <button onClick={closeDemoShop}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>✕</button>
          </div>
        </div>

        {/* Shop Tab */}
        {tab === 'shop' && (
          <div style={{ padding: '1rem' }}>
            <p style={{ color: colors.text, fontSize: 12, margin: '0 0 0.9rem', opacity: 0.65 }}>{shop.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {visibleProducts.map(p => (
                <div key={p.id} style={{ background: colors.card, borderRadius: 12, padding: '0.85rem', border: `1px solid ${colors.accent}22` }}>
                  <div style={{ fontSize: 34, marginBottom: 5 }}>{p.image}</div>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: colors.text }}>{p.name}</p>
                  <p style={{ margin: '0 0 7px', color: colors.accent, fontWeight: 800, fontSize: 14 }}>NPR {p.price.toLocaleString()}</p>
                  <p style={{ margin: '0 0 7px', color: colors.text, fontSize: 11, opacity: 0.6 }}>{p.stock} in stock</p>
                  <button onClick={() => setCart(c => [...c, p])}
                    style={{ width: '100%', background: colors.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bot Tab */}
        {tab === 'bot' && <ChatTab colors={colors} />}

        {/* Cart Tab */}
        {tab === 'cart' && (
          <div style={{ padding: '1rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: colors.text, opacity: 0.45 }}>
                <p style={{ fontSize: 38, margin: '0 0 0.5rem' }}>🛒</p>
                <p style={{ fontSize: 14 }}>Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${colors.accent}22`, color: colors.text }}>
                    <span style={{ fontSize: 20 }}>{p.image}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                    <span style={{ fontWeight: 700, color: colors.accent }}>NPR {p.price.toLocaleString()}</span>
                    <button onClick={() => setCart(c => c.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: colors.text, opacity: 0.4, cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 0', fontWeight: 800, fontSize: 17, color: colors.text }}>
                  <span>Total</span>
                  <span style={{ color: colors.accent }}>NPR {total.toLocaleString()}</span>
                </div>
                <button onClick={() => { setCart([]); setTab('bot') }}
                  style={{ width: '100%', background: colors.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', cursor: 'pointer', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-body)' }}>
                  Place Order (COD) 🎉
                </button>
                <p style={{ textAlign: 'center', color: colors.text, fontSize: 11, opacity: 0.55, marginTop: 8 }}>Cash on Delivery · Free returns</p>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ background: `${colors.accent}18`, padding: '7px 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: colors.accent, fontWeight: 700 }}>🎨 {activeTheme.name}</span>
          <span style={{ fontSize: 11, color: colors.text, opacity: 0.45 }}>Powered by PasalBot</span>
        </div>
      </div>
    </div>
  )
}
