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
            <div style={{ width: 36, height: 36, background: colors.accent, color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: 'rotate(12deg)' }}>
              <ShopLogo shop={shop} size={36} borderRadius={0} bg={colors.accent} fontSize={20} />
            </div>
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
            <div style={{ aspectRatio: '1', width: 'clamp(200px,40vw,400px)', background: colors.card, borderRadius: '3rem', border: `1px solid ${colors.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <ShopLogo shop={shop} size={200} borderRadius={0} bg={colors.card} fontSize={120} />
            </div>
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
                  <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                    <ProductImgFull product={p} height={240} bg={`${colors.accent}10`} fontSize={80}>
                      {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>LIMITED</div>}
                      {p.stock === 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>SOLD OUT</div>}
                    </ProductImgFull>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <p style={{ fontWeight: 600, fontSize: 16, margin: '0 0 4px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                        <p style={{ color: colors.accent, fontSize: 12, margin: 0, opacity: 0.8 }}>{p.category}</p>
                      </div>
                      <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 300, margin: 0, whiteSpace: 'nowrap', color: colors.text }}>{p.price.toLocaleString()}</p>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 12, color: colors.text, opacity: 0.5, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description.replace(/\n/g, ' ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 0 }}>
                      <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}18`, color: colors.accent, border: 'none', borderRadius: 12, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
                        VIEW
                      </button>
                      <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="shanti-add-btn" style={{ flex: 2 }}>
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
      <footer style={{ background: colors.text, color: colors.bg, borderTop: `1px solid ${colors.accent}20`, padding: 'clamp(40px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: colors.accent, color: '#fff', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShopLogo shop={shop} size={32} borderRadius={0} bg={colors.accent} fontSize={18} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: colors.bg }}>{shop.name.toUpperCase()}</span>
            </div>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.description || 'A sanctuary for mindful living.'}</p>
          </div>
          <div>
            <p style={{ color: colors.accent, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 700 }}>Contact</p>
            <p style={{ color: colors.bg, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>{shop.location}<br />{shop.phone}</p>
          </div>
          <div style={{ paddingTop: 24 }}>
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

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Kailash   (colors.* driven throughout)
// ═══════════════════════════════════════════════════════════════════════════
