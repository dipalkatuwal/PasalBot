import { useState } from 'react'
import { ProductImgFull, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function HimalayanStoreUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
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
            <ShopLogo shop={shop} size={40} borderRadius={12} bg={colors.accent} />
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
      <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url('${shop.heroBgUrl}') center/cover` : `linear-gradient(135deg, ${colors.accent}dd, ${colors.accent}99)`, padding: '60px 24px', boxSizing: 'border-box' }}>
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
                  <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                    <ProductImgFull product={p} height={200} bg={`linear-gradient(135deg, ${colors.bg}, ${colors.card})`} fontSize={72} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: colors.text }}>{p.name}</p>
                    {p.description && (
                      <p style={{ fontSize: 12, color: colors.text, opacity: 0.55, margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description.replace(/\n/g, ' ')}
                      </p>
                    )}
                    <p style={{ fontWeight: 900, fontSize: 18, color: colors.accent, margin: '0 0 12px' }}>NPR {p.price.toLocaleString()}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        View Details
                      </button>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ flex: 1, background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed' }}>
                        {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
                      </button>
                    </div>
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
            <SocialBar shop={shop} size={22} />
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          colors={colors}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => { setCart(c => [...c, p]); setCartOpen(true) }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Himalaya Haven   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
