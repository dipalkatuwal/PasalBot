import { useState } from 'react'
import { ProductImgFull, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function HimalayanHavenUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const usedCatLabels = new Set(products.map(p => p.category?.toLowerCase()))
  const visibleCats = [
    { _id: 'all', label: 'All', emoji: '🛍️' },
    ...categories.filter(c => usedCatLabels.has(c.label.toLowerCase())),
  ]
  const filtered = activeCat === 'all' ? products
    : products.filter(p => { const cat = categories.find(c => c._id === activeCat); return cat && p.category?.toLowerCase() === cat.label.toLowerCase() })
  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(i => i._id === p._id)
      if (existing) return c.map(i => i._id === p._id ? { ...i, qty: (i.qty || 1) + 1 } : i)
      return [...c, { ...p, qty: 1 }]
    })
    setCartOpen(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Georgia', serif", overflowX: 'hidden' }}>
      <style>{`
        .haven-card { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s; }
        .haven-card:hover { transform: scale(1.03) rotate(1deg); box-shadow: 0 24px 48px rgba(0,0,0,0.13) !important; }
        /* Mobile: 1 col, tablet: 2, desktop: 3-4 */
        .haven-pgrid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 480px) { .haven-pgrid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
        @media (min-width: 768px) { .haven-pgrid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1100px) { .haven-pgrid { grid-template-columns: repeat(4, 1fr); gap: 28px; } }
        /* Category grid */
        .haven-cats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (min-width: 640px) { .haven-cats { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
        /* Nav: shrink padding on mobile */
        .haven-nav-inner { padding: 0 16px !important; }
        @media (min-width: 640px) { .haven-nav-inner { padding: 0 24px !important; } }
        /* Hide button text on very small screens */
        .haven-nav-btn-text { display: none; }
        @media (min-width: 380px) { .haven-nav-btn-text { display: inline; } }
        /* Hero: full width text on mobile */
        .haven-hero-text { max-width: 100% !important; }
        @media (min-width: 768px) { .haven-hero-text { max-width: 560px !important; } }
        /* Trust pills: wrap neatly */
        .haven-trust-pills { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        /* Footer: single col on mobile */
        .haven-footer-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 640px) { .haven-footer-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 36px; } }
        /* Section padding */
        .haven-section { padding: clamp(32px,5vw,70px) clamp(16px,4vw,24px); }
      `}</style>

      {/* Nav */}
      <nav style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}20`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="haven-nav-inner" style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <ShopLogo shop={shop} size={36} borderRadius={10} bg={`${colors.accent}20`} fontSize={22} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(13px,3.5vw,20px)', fontWeight: 700, margin: 0, color: colors.accent, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</h1>
              <p style={{ fontSize: 10, color: colors.accent, opacity: 0.7, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'system-ui' }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 20, padding: '0 12px', height: 36, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
              💬 <span className="haven-nav-btn-text">Guide</span>
            </button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 14px', height: 36, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
              🛍️ <span className="haven-nav-btn-text">Bag</span>{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', width: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url('${shop.heroBgUrl}') center/cover` : `linear-gradient(135deg, ${colors.accent}ee, ${colors.accent}88)`, padding: 'clamp(48px,10vw,80px) clamp(16px,4vw,24px)', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div className="haven-hero-text" style={{ color: '#fff' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.card, margin: '0 0 12px', fontFamily: 'system-ui' }}>{shop.tagline || shop.location || ''}</p>
            <h1 style={{ fontSize: 'clamp(32px,7vw,80px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.05, letterSpacing: '-0.03em' }}>{shop.name}</h1>
            <p style={{ fontSize: 'clamp(14px,2vw,18px)', opacity: 0.85, margin: '0 0 28px', lineHeight: 1.6 }}>{shop.description}</p>
            <button onClick={() => document.getElementById('haven-shop')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '14px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', boxShadow: `0 8px 24px ${colors.accent}55` }}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* How it works banner */}
      <div style={{ background: colors.card, borderTop: `1px solid ${colors.accent}15`, borderBottom: `1px solid ${colors.accent}15`, padding: '12px clamp(16px,4vw,24px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 18 }}>📞</span>
          <p style={{ margin: 0, fontSize: 13, color: colors.text, fontFamily: 'system-ui', textAlign: 'center' }}>
            <strong style={{ color: colors.accent }}>No prepayment needed.</strong> Browse, pick what you love, and place your order — our team will call you to confirm details before we head your way.
          </p>
        </div>
      </div>

      {/* Trust pills */}
      <div style={{ background: colors.card, padding: '16px clamp(16px,4vw,24px)', borderBottom: `1px solid ${colors.accent}15` }}>
        <div className="haven-trust-pills" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {[['📍', shop.location || 'Kathmandu'], ['🛡️', 'Cash on Delivery'], ['🚚', '1–2 Day Delivery'], ['♻️', 'Easy Returns']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${colors.accent}12`, borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: colors.accent, fontFamily: 'system-ui' }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category showcase */}
      <section className="haven-section" style={{ background: colors.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,4vw,34px)', fontWeight: 700, textAlign: 'center', marginBottom: 24, color: colors.accent }}>Explore by Collection</h2>
          <div className="haven-cats">
            {visibleCats.filter(c => c._id !== 'all').slice(0, 4).map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)}
                style={{ background: activeCat === cat._id ? colors.accent : colors.card, color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}20`, borderRadius: 20, padding: 'clamp(16px,3vw,28px) 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', fontFamily: 'Georgia, serif', boxShadow: activeCat === cat._id ? `0 8px 20px ${colors.accent}33` : 'none' }}>
                <span style={{ fontSize: 'clamp(26px,5vw,36px)', display: 'block', marginBottom: 6 }}>{cat.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="haven-shop" className="haven-section" style={{ background: `${colors.accent}08` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 'clamp(20px,4vw,38px)', fontWeight: 700, margin: 0, color: colors.accent, letterSpacing: '-0.02em' }}>Featured Treasures</h2>
            <button onClick={() => setChatOpen(true)} style={{ background: 'none', border: 'none', color: colors.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 4 }}>Need help choosing? →</button>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🛍️</p><p style={{ fontWeight: 700, fontFamily: 'system-ui' }}>No products yet.</p></div>
          ) : (
            <div className="haven-pgrid">
              {filtered.map(p => (
                <div key={p._id} className="haven-card" style={{ background: colors.card, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: `1px solid ${colors.accent}10` }}>
                  <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                    <ProductImgFull product={p} height={200} bg={`linear-gradient(135deg, ${colors.bg}, ${colors.card})`} fontSize={72} />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', color: colors.text }}>{p.name}</p>
                    {p.description && (
                      <p style={{ fontSize: 11, color: colors.text, opacity: 0.5, margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'system-ui' }}>
                        {p.description.replace(/\n/g, ' ')}
                      </p>
                    )}
                    <p style={{ fontSize: 18, fontWeight: 700, color: colors.accent, margin: '0 0 10px', fontFamily: 'system-ui' }}>NPR {p.price.toLocaleString()}</p>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 12, padding: '9px 6px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
                        Details
                      </button>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ flex: 1, background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 12, padding: '9px 6px', fontSize: 12, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', fontFamily: 'system-ui' }}>
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
      <footer style={{ background: colors.text, color: colors.bg, padding: 'clamp(36px,6vw,72px) clamp(16px,4vw,24px)' }}>
        <div className="haven-footer-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShopLogo shop={shop} size={36} borderRadius={10} bg={`${colors.accent}30`} fontSize={22} />
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: colors.bg }}>{shop.name}</h3>
            </div>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7, fontFamily: 'system-ui' }}>{shop.description}</p>
          </div>
          <div>
            <h4 style={{ color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, margin: '0 0 12px', fontFamily: 'system-ui' }}>Visit Us</h4>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7, fontFamily: 'system-ui' }}>{shop.location}<br />{shop.phone}</p>
          </div>
          <div>
            <h4 style={{ color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, margin: '0 0 12px', fontFamily: 'system-ui' }}>Connect</h4>
            <SocialBar shop={shop} size={24} />
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          colors={colors}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => {
            setCart(c => {
              const existing = c.find(i => i._id === p._id)
              if (existing) return c.map(i => i._id === p._id ? { ...i, qty: (i.qty || 1) + 1 } : i)
              return [...c, { ...p, qty: 1 }]
            })
            setCartOpen(true)
          }}
        />
      )}
    </div>
  )
}
