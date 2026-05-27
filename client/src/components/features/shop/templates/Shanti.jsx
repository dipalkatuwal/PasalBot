import { useState } from 'react'
import { ProductImgFull, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function ShantiCollectiveUI({ shop, products, categories, colors, cart, setCart, setChatOpen, setCartOpen }) {
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

  const isDark = colors.bg.toLowerCase() < '#888888'
  const surfaceBg = isDark ? `${colors.text}22` : colors.card
  const surfaceBorder = `${colors.accent}25`

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .shanti-card { transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s; }
        .shanti-card:hover { transform: translateY(-12px) rotate(2deg); box-shadow: 0 30px 60px ${colors.accent}33 !important; }
        /* Product grid: 1→2→3→4 col */
        .shanti-pgrid { display: grid; grid-template-columns: 1fr; gap: 18px; }
        @media (min-width: 480px)  { .shanti-pgrid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
        @media (min-width: 900px)  { .shanti-pgrid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1200px) { .shanti-pgrid { grid-template-columns: repeat(4, 1fr); } }
        /* Hero: stack on mobile, side-by-side on desktop */
        .shanti-hero { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
        @media (min-width: 900px) { .shanti-hero { grid-template-columns: 1fr 1fr; gap: 48px; } }
        /* Add button */
        .shanti-add-btn { background: ${surfaceBg}; color: ${colors.text}; border: 1px solid ${surfaceBorder}; border-radius: 12px; padding: 12px; width: 100%; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .shanti-add-btn:hover:not(:disabled) { background: ${colors.accent}; color: #fff; border-color: ${colors.accent}; }
        .shanti-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        /* Nav */
        .shanti-nav-inner { padding: 0 clamp(12px,3vw,24px); }
        /* Filter pills: scrollable on mobile */
        .shanti-filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        @media (max-width: 479px) {
          .shanti-filter-pills { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
          .shanti-filter-pills::-webkit-scrollbar { display: none; }
        }
        /* Hide logo button label on tiny screens */
        .shanti-btn-keeper { display: none; }
        @media (min-width: 380px) { .shanti-btn-keeper { display: inline; } }
        /* Hero image: hide on small mobile */
        .shanti-hero-img { display: none; }
        @media (min-width: 600px) { .shanti-hero-img { display: flex; } }
        /* Footer grid */
        .shanti-footer-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 640px) { .shanti-footer-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 36px; } }
        /* Section padding */
        .shanti-section { padding: clamp(48px,7vw,112px) clamp(16px,4vw,24px); }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `${colors.bg}dd`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.accent}20` }}>
        <div className="shanti-nav-inner" style={{ maxWidth: 1400, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, background: colors.accent, color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: 'rotate(12deg)', flexShrink: 0 }}>
              <ShopLogo shop={shop} size={34} borderRadius={0} bg={colors.accent} fontSize={18} />
            </div>
            <span style={{ fontSize: 'clamp(13px,4vw,20px)', fontWeight: 800, letterSpacing: '-0.04em', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30`, borderRadius: 20, padding: '0 12px', height: 36, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>🪔 <span className="shanti-btn-keeper">Keeper</span></button>
            <button onClick={() => setCartOpen(v => !v)} style={{ position: 'relative', background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '0 12px', height: 36, fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🛒 <span className="shanti-btn-keeper">Cart</span> {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — split */}
      <section style={{ minHeight: '100vh', padding: '64px clamp(16px,4vw,24px) clamp(40px,8vw,80px)', display: 'flex', alignItems: 'center', background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.card} 100%)`, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${colors.accent} 0.5px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.06 }} />
        <div className="shanti-hero" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', padding: 'clamp(48px,8vw,80px) 0' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 18px', fontWeight: 700 }}>{shop.tagline || 'Our Collection'}</p>
            <h1 style={{ fontSize: 'clamp(36px,6vw,90px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1, letterSpacing: '-0.04em', color: colors.text }}>
              {shop.name}<br /><span style={{ color: colors.accent }}>Collective</span>
            </h1>
            <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: colors.text, opacity: 0.7, margin: '0 0 32px', lineHeight: 1.7, maxWidth: 480 }}>{shop.description}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('shanti-offerings')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '13px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>View Offerings</button>
              <button onClick={() => setChatOpen(true)} style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Speak with Keeper</button>
            </div>
          </div>
          <div className="shanti-hero-img" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ aspectRatio: '1', width: 'clamp(180px,35vw,400px)', background: colors.card, borderRadius: '3rem', border: `1px solid ${colors.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <ShopLogo shop={shop} size={180} borderRadius={0} bg={colors.card} fontSize={110} />
            </div>
          </div>
        </div>
      </section>

      {/* Ordering assurance */}
      <div style={{ background: `${colors.accent}0d`, borderTop: `1px solid ${colors.accent}20`, padding: '12px clamp(16px,4vw,24px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 17 }}>🛖</span>
          <p style={{ margin: 0, fontSize: 13, color: colors.text, textAlign: 'center', opacity: 0.9 }}>
            Choose freely — every order gets a personal call from us to verify your details before we bring it to your door. <strong style={{ color: colors.accent }}>No advance payment required.</strong>
          </p>
        </div>
      </div>

      {/* Offerings */}
      <section id="shanti-offerings" className="shanti-section" style={{ background: colors.card }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 18 }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', color: colors.accent, textTransform: 'uppercase', margin: '0 0 10px', fontWeight: 700 }}>{shop.tagline || 'Our Collection'}</p>
              <h2 style={{ fontSize: 'clamp(24px,5vw,52px)', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05, color: colors.text }}>{shop.name} Collection</h2>
            </div>
            <div className="shanti-filter-pills">
              {visibleCats.map(cat => (
                <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background: activeCat === cat._id ? colors.accent : 'transparent', color: activeCat === cat._id ? '#fff' : colors.text, border: `1px solid ${colors.accent}40`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: activeCat === cat._id ? 1 : 0.7, flexShrink: 0 }}>
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
                <div key={p._id} className="shanti-card" style={{ background: colors.bg, borderRadius: 22, overflow: 'hidden', border: `1px solid ${colors.accent}15` }}>
                  <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                    <ProductImgFull product={p} height={220} bg={`${colors.accent}10`} fontSize={72}>
                      {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 10, right: 10, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>LIMITED</div>}
                      {p.stock === 0 && <div style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>SOLD OUT</div>}
                    </ProductImgFull>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 3px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                        <p style={{ color: colors.accent, fontSize: 11, margin: 0, opacity: 0.8 }}>{p.category}</p>
                      </div>
                      <p style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 300, margin: 0, whiteSpace: 'nowrap', color: colors.text }}>{p.price.toLocaleString()}</p>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 11, color: colors.text, opacity: 0.5, margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description.replace(/\n/g, ' ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}18`, color: colors.accent, border: 'none', borderRadius: 11, padding: '9px 6px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
                        VIEW
                      </button>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="shanti-add-btn" style={{ flex: 2, padding: '9px 6px', fontSize: 11 }}>
                        {p.stock > 0 ? 'Add to Sanctuary' : 'Out of Stock'}
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
      <footer style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}20`, padding: 'clamp(36px,6vw,72px) clamp(16px,4vw,24px)' }}>
        <div className="shanti-footer-grid" style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, background: colors.accent, color: '#fff', borderRadius: 9, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShopLogo shop={shop} size={30} borderRadius={0} bg={colors.accent} fontSize={16} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.04em', color: colors.bg }}>{shop.name.toUpperCase()}</span>
            </div>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.description}</p>
          </div>
          <div>
            <p style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 10px', fontWeight: 700 }}>Contact</p>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.location}<br />{shop.phone}</p>
          </div>
          <div style={{ paddingTop: 20 }}>
            <SocialBar shop={shop} size={22} />
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

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Kailash   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
