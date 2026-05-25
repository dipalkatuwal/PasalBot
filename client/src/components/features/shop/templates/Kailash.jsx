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
            <ShopLogo shop={shop} size={36} borderRadius={8} bg="transparent" fontSize={28} />
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
      <section style={{ minHeight: '100vh', paddingTop: 72, display: 'flex', alignItems: 'center', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('${shop.heroBgUrl}') center/cover fixed` : `linear-gradient(160deg, ${colors.bg} 0%, ${colors.card} 100%)`, padding: '72px 24px 80px', boxSizing: 'border-box', position: 'relative' }}>
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
                    <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                      <ProductImgFull product={p} height={280} bg={gradients[i % gradients.length]} fontSize={100}>
                        {p.stock <= 3 && p.stock > 0 && <div style={{ position: 'absolute', top: 20, left: 20, background: `${colors.accent}cc`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 20, letterSpacing: '0.15em' }}>RARE</div>}
                        {p.stock === 0 && <div style={{ position: 'absolute', top: 20, left: 20, background: '#ef4444cc', color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 20 }}>SOLD OUT</div>}
                      </ProductImgFull>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <p className="k-heading" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3, color: colors.text }}>{p.name}</p>
                          <p style={{ color: colors.accent, fontSize: 12, margin: 0, opacity: 0.7 }}>{p.category}</p>
                        </div>
                        <p className="k-heading" style={{ fontSize: 28, fontWeight: 300, color: colors.accent, margin: 0, whiteSpace: 'nowrap' }}>{p.price.toLocaleString()}</p>
                      </div>
                      {p.description && (
                        <p style={{ fontSize: 13, color: colors.text, opacity: 0.5, margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description.replace(/\n/g, ' ')}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: p.description ? 0 : 10 }}>
                        <button onClick={() => setSelectedProduct(p)} style={{ flex: 1, background: `${colors.accent}15`, color: colors.accent, border: 'none', borderRadius: 18, padding: '14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          Details
                        </button>
                        <button disabled={p.stock <= 0} onClick={() => addToCart(p)}
                          style={{ flex: 2, background: p.stock > 0 ? colors.accent : colors.card, color: p.stock > 0 ? '#fff' : colors.text, border: 'none', borderRadius: 20, padding: '14px', fontSize: 13, fontWeight: 700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock <= 0 ? 0.5 : 1 }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ShopLogo shop={shop} size={72} borderRadius={20} bg={`${colors.accent}20`} fontSize={44} />
          </div>
          <h2 className="k-heading" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.03em', color: colors.bg }}>{shop.name.toUpperCase()}</h2>
          <p style={{ color: colors.bg, opacity: 0.5, margin: '0 0 40px', fontSize: 15 }}>The mountain calls. The soul answers.</p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: colors.bg, opacity: 0.5 }}>
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
          onAddToCart={(p) => { setCart(c => [...c, p]); setCartOpen(true) }}
        />
      )}
    </div>
  )
}

// ── LEGACY Story Magazine Template (kept for backward compatibility) ──────────
