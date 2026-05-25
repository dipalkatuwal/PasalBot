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
            <ShopLogo shop={shop} size={40} borderRadius={10} bg={`${colors.accent}20`} fontSize={26} />
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
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url('${shop.heroBgUrl}') center/cover` : `linear-gradient(135deg, ${colors.accent}ee, ${colors.accent}88)`, padding: '80px 24px', boxSizing: 'border-box' }}>
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
                  <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                    <ProductImgFull product={p} height={220} bg={`linear-gradient(135deg, ${colors.bg}, ${colors.card})`} fontSize={80} />
                  </div>
                  <div style={{ padding: '18px' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: colors.text }}>{p.name}</p>
                    {p.description && (
                      <p style={{ fontSize: 12, color: colors.text, opacity: 0.5, margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'system-ui' }}>
                        {p.description.replace(/\n/g, ' ')}
                      </p>
                    )}
                    <p style={{ fontSize: 20, fontWeight: 700, color: colors.accent, margin: '0 0 12px', fontFamily: 'system-ui' }}>NPR {p.price.toLocaleString()}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 14, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
                        Details
                      </button>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{ flex: 1, background: p.stock > 0 ? colors.accent : '#9ca3af', color: '#fff', border: 'none', borderRadius: 14, padding: '10px', fontSize: 12, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', fontFamily: 'system-ui' }}>
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
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <ShopLogo shop={shop} size={40} borderRadius={10} bg={`${colors.accent}30`} fontSize={24} />
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
            <SocialBar shop={shop} size={24} />
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
