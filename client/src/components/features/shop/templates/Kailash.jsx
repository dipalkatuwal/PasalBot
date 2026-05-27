import { useState } from 'react'
import { ProductImgFull, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function KailashUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
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
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        .k-heading { font-family: 'Playfair Display', Georgia, serif; }
        .k-card { transition: transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s; border: 1px solid ${colors.accent}15; }
        .k-card:hover { transform: scale(1.04) rotate(1deg); box-shadow: 0 40px 80px ${colors.accent}25 !important; }
        /* Product grid: 1→2→3 col */
        .k-pgrid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 500px)  { .k-pgrid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        @media (min-width: 900px)  { .k-pgrid { grid-template-columns: repeat(3, 1fr); gap: 32px; } }
        .k-float { animation: kfloat 6s ease-in-out infinite; }
        @keyframes kfloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        /* About section: stack on mobile */
        .k-legacy { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
        @media (min-width: 900px) { .k-legacy { grid-template-columns: 1fr 1fr; gap: 48px; } }
        /* Nav: hide label on tiny screens */
        .k-nav-cart-label { display: none; }
        @media (min-width: 400px) { .k-nav-cart-label { display: inline; } }
        /* Filter pills: scrollable on mobile */
        .k-filter-pills { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 479px) {
          .k-filter-pills { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; justify-content: flex-start; }
          .k-filter-pills::-webkit-scrollbar { display: none; }
        }
        /* Nav padding */
        .k-nav-inner { padding: 0 clamp(12px,3vw,24px); }
        /* Footer details */
        .k-footer-details { display: flex; gap: 20px; flex-wrap: wrap; }
        /* Section padding */
        .k-section { padding: clamp(48px,7vw,112px) clamp(16px,4vw,24px); }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `${colors.bg}cc`, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${colors.text}15` }}>
        <div className="k-nav-inner" style={{ maxWidth: 1400, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <ShopLogo shop={shop} size={34} borderRadius={8} bg="transparent" fontSize={26} />
            <span className="k-heading" style={{ fontSize: 'clamp(14px,4vw,24px)', fontWeight: 700, letterSpacing: '-0.03em', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.text}30`, borderRadius: 20, padding: '0 14px', height: 38, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>🪔 <span className="k-nav-cart-label">Oracle</span></button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 14px', height: 38, fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🛒 <span className="k-nav-cart-label">Collection</span> {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', paddingTop: 68, display: 'flex', alignItems: 'center', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('${shop.heroBgUrl}') center/cover fixed` : `linear-gradient(160deg, ${colors.bg} 0%, ${colors.card} 100%)`, padding: '68px clamp(16px,4vw,24px) clamp(48px,8vw,80px)', boxSizing: 'border-box', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(at center, ${colors.accent}08 0%, transparent 70%)` }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: 700 }}>
            {shop.tagline && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '8px 18px', borderRadius: 20, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>
                <div style={{ width: 1, height: 16, background: colors.accent }} />{shop.tagline}
              </div>
            )}
            <h1 className="k-heading" style={{ fontSize: 'clamp(40px,9vw,110px)', fontWeight: 900, margin: '0 0 20px', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#fff' }}>{shop.name}</h1>
            <p style={{ fontSize: 'clamp(14px,2.5vw,20px)', color: colors.accent, maxWidth: 480, lineHeight: 1.6, margin: '0 0 36px', opacity: 0.9 }}>{shop.description || ''}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('k-sanctum')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>SHOP NOW</button>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '14px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Chat with Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* Ordering note */}
      <div style={{ background: `${colors.accent}10`, borderTop: `1px solid ${colors.accent}20`, padding: '13px clamp(16px,4vw,24px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: 13, color: colors.text, opacity: 0.85, letterSpacing: '0.01em' }}>
            🕊️ &nbsp;Place your order with confidence — we'll reach out personally to confirm before anything leaves our hands. <span style={{ color: colors.accent, fontWeight: 600 }}>Pay only on delivery.</span>
          </p>
        </div>
      </div>

      {/* Sanctum / Products */}
      <section id="k-sanctum" className="k-section" style={{ background: colors.card }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,6vw,72px)' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.4em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 10px', fontWeight: 700 }}>The Divine Collection</p>
            <h2 className="k-heading" style={{ fontSize: 'clamp(28px,6vw,64px)', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: colors.text }}>Offerings from Kailash</h2>
          </div>
          <div className="k-filter-pills" style={{ marginBottom: 36 }}>
            {visibleCats.map(cat => (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '7px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: activeCat === cat._id ? 1 : 0.6, flexShrink: 0 }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p style={{ fontSize: 64 }}>🕉️</p><p>No offerings yet.</p></div>
          ) : (
            <div className="k-pgrid">
              {filtered.map((p, i) => {
                const gradients = [
                  `linear-gradient(135deg, ${colors.accent}30, ${colors.bg})`,
                  `linear-gradient(135deg, ${colors.accent}20, ${colors.card})`,
                  `linear-gradient(135deg, ${colors.accent}15, ${colors.bg})`,
                ]
                return (
                  <div key={p._id} className="k-card" style={{ background: colors.bg, borderRadius: 22, overflow: 'hidden' }}>
                    <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                      <ProductImgFull product={p} height={260} bg={gradients[i % gradients.length]} fontSize={90}>
                        {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 16, left: 16, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 20, letterSpacing: '0.15em' }}>RARE</div>}
                        {p.stock === 0 && <div style={{ position: 'absolute', top: 16, left: 16, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>SOLD OUT</div>}
                      </ProductImgFull>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <p className="k-heading" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                          <p style={{ color: colors.accent, fontSize: 11, margin: 0, opacity: 0.7 }}>{p.category}</p>
                        </div>
                        <p className="k-heading" style={{ fontSize: 22, fontWeight: 300, color: colors.accent, margin: 0, whiteSpace: 'nowrap' }}>{p.price.toLocaleString()}</p>
                      </div>
                      {p.description && (
                        <p style={{ fontSize: 12, color: colors.text, opacity: 0.5, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description.replace(/\n/g, ' ')}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 16, padding: '12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Details
                        </button>
                        <button disabled={p.stock <= 0} onClick={() => addToCart(p)}
                          style={{ flex: 2, background: p.stock > 0 ? colors.accent : colors.card, color: p.stock > 0 ? '#fff' : colors.text, border: 'none', borderRadius: 18, padding: '12px', fontSize: 12, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock <= 0 ? 0.5 : 1 }}>
                          {p.stock > 0 ? 'Claim This Blessing' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* About section */}
      <section className="k-section" style={{ background: colors.bg }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="k-legacy">
            <div style={{ borderRadius: 24, background: colors.card, aspectRatio: '3/4', maxHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${colors.accent}10` }}>
              <ShopLogo shop={shop} size={160} borderRadius={0} bg={colors.card} fontSize={100} />
            </div>
            <div style={{ padding: 'clamp(0px,4vw,40px) 0' }}>
              {shop.tagline && <p style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 18px', fontWeight: 700 }}>{shop.tagline}</p>}
              <h2 className="k-heading" style={{ fontSize: 'clamp(24px,4vw,50px)', fontWeight: 800, margin: '0 0 24px', lineHeight: 1.1, color: colors.text }}>{shop.name}</h2>
              {shop.description && <p style={{ fontSize: 16, color: colors.text, opacity: 0.6, lineHeight: 1.8, margin: '0 0 36px' }}>{shop.description}</p>}
              <div className="k-footer-details" style={{ borderTop: `1px solid ${colors.accent}20`, paddingTop: 28 }}>
                {shop.location && <div><p className="k-heading" style={{ fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1, color: colors.text }}>📍</p><p style={{ fontSize: 12, color: colors.accent, margin: '6px 0 0', letterSpacing: '0.05em', opacity: 0.7 }}>{shop.location}</p></div>}
                {shop.businessHours && <div><p className="k-heading" style={{ fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1, color: colors.text }}>🕐</p><p style={{ fontSize: 12, color: colors.accent, margin: '6px 0 0', letterSpacing: '0.05em', opacity: 0.7 }}>{shop.businessHours}</p></div>}
                {shop.deliveryTime && <div><p className="k-heading" style={{ fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1, color: colors.text }}>🚚</p><p style={{ fontSize: 12, color: colors.accent, margin: '6px 0 0', letterSpacing: '0.05em', opacity: 0.7 }}>{shop.deliveryTime}</p></div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}15`, padding: 'clamp(48px,8vw,96px) clamp(16px,4vw,24px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <ShopLogo shop={shop} size={64} borderRadius={18} bg={`${colors.accent}20`} fontSize={40} />
          </div>
          <h2 className="k-heading" style={{ fontSize: 'clamp(24px,5vw,44px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.03em', color: colors.bg }}>{shop.name.toUpperCase()}</h2>
          {shop.tagline && <p style={{ color: colors.bg, opacity: 0.5, margin: '0 0 32px', fontSize: 14 }}>{shop.tagline}</p>}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: colors.bg, opacity: 0.5 }}>
            <span>{shop.location || 'Kathmandu, Nepal'}</span>
            <span>{shop.phone}</span>
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

// ── LEGACY Story Magazine Template (kept for backward compatibility) ──────────
