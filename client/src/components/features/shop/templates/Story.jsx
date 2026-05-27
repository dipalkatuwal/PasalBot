import { useState } from 'react'
import { ProductImg, ProductImgFull, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function StoryShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)

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

  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(i => i._id === p._id)
      if (existing) return c.map(i => i._id === p._id ? { ...i, qty: (i.qty || 1) + 1 } : i)
      return [...c, { ...p, qty: 1 }]
    })
    setCartOpen(true)
  }

  const storyPalettes = [
    { bg: colors.accent, text: '#fff' },
    { bg: colors.card, text: colors.text },
    { bg: colors.bg, text: colors.text },
  ]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        .story-card:hover .story-overlay { opacity: 1 !important; }
        .story-card:hover { transform: scale(1.01); }
        .story-card { transition: transform 0.3s ease; }

        /* Feature card: always column layout */
        .story-feature { flex-direction: column !important; min-height: 300px; }

        /* Non-feature cards: row on ≥480px, column on smaller */
        .story-row { flex-direction: column; min-height: auto; }
        @media (min-width: 480px) {
          .story-row { flex-direction: row; min-height: 150px; }
          .story-row-img { width: 130px; min-width: 130px; flex-shrink: 0; align-self: stretch; }
        }
        @media (max-width: 479px) {
          .story-row-img { width: 100% !important; min-width: unset !important; }
        }

        /* Category strip: scrollable on mobile */
        .story-cat-strip { display: flex; gap: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .story-cat-strip::-webkit-scrollbar { display: none; }
        .story-cat-strip button { flex-shrink: 0; }

        /* Header: compact on mobile */
        .story-header-inner { padding: 0 clamp(12px,3vw,28px); height: 60px; }

        /* Masthead padding */
        .story-masthead { padding: clamp(32px,6vw,80px) clamp(16px,4vw,28px); }

        /* Product action row: stack on very small */
        .story-card-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${colors.bg}f0`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.accent}18` }}>
        <div className="story-header-inner" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <ShopLogo shop={shop} size={26} borderRadius={6} bg={`${colors.accent}20`} fontSize={18} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 'clamp(13px,3.5vw,16px)', margin: 0, letterSpacing: '-0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</p>
              <p style={{ fontSize: 9, margin: 0, opacity: 0.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}18`, border: 'none', color: colors.accent, borderRadius: 9, height: 35, padding: '0 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>💬</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, border: 'none', color: '#fff', borderRadius: 9, height: 35, padding: '0 12px', fontSize: 13, fontWeight: 800, cursor: 'pointer', position: 'relative' }}>
              🛒{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 6, minWidth: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Magazine Masthead */}
      <section className="story-masthead" style={{ background: colors.accent, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <p style={{ fontSize: 'clamp(10px,2vw,13px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', opacity: 0.75, margin: '0 0 14px' }}>{shop.tagline || shop.location || shop.name}</p>
        <h1 style={{ fontSize: 'clamp(32px,8vw,96px)', fontWeight: 900, margin: 0, lineHeight: 0.9, letterSpacing: '-0.05em' }}>{shop.name}</h1>
        <p style={{ fontSize: 'clamp(13px,2.5vw,19px)', opacity: 0.8, margin: '16px auto 0', maxWidth: 500 }}>{shop.description || 'Curated with care. Delivered with love.'}</p>
      </section>

      {/* Category Strip */}
      <div style={{ borderBottom: `1px solid ${colors.accent}15`, background: colors.card }}>
        <div className="story-cat-strip" style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(12px,3vw,28px)' }}>
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: 'none', border: 'none', color: isActive ? colors.accent : colors.text,
                padding: '13px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                borderBottom: `3px solid ${isActive ? colors.accent : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '-0.01em'
              }}>
                {cat.emoji} {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Order process callout */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.accent}15`, padding: '11px clamp(12px,3vw,28px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 16 }}>📬</span>
          <p style={{ margin: 0, fontSize: 13, color: colors.text, textAlign: 'center' }}>
            Pick your story and order — we'll call to confirm before we deliver. <strong style={{ color: colors.accent }}>Pay when it arrives.</strong>
          </p>
        </div>
      </div>

      {/* Story Cards */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(16px,4vw,48px) clamp(12px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.3 }}>
            <p style={{ fontSize: 64, margin: '0 0 16px' }}>📰</p>
            <p style={{ fontWeight: 700 }}>No stories here yet.</p>
          </div>
        )}
        {filtered.map((p, i) => {
          const pal = storyPalettes[i % storyPalettes.length]
          const isFeature = i === 0
          return (
            <div key={p._id} className={`story-card ${isFeature ? 'story-feature' : 'story-row'}`} style={{
              borderRadius: 20, overflow: 'hidden', position: 'relative',
              background: pal.bg,
              display: 'flex',
              border: `1px solid ${colors.accent}14`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              {/* Image panel */}
              {isFeature ? (
                <ProductImgFull product={p} height={200} bg={`linear-gradient(135deg, ${colors.accent}cc, ${colors.accent})`} fontSize={88} borderRadius={0} />
              ) : (
                <div className="story-row-img">
                  <ProductImgFull product={p} height={150} bg={`${colors.accent}18`} fontSize={50} borderRadius={0} />
                </div>
              )}

              {/* Text */}
              <div style={{ flex: 1, padding: isFeature ? 'clamp(14px,3vw,26px)' : '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, margin: '0 0 5px', opacity: 0.8 }}>{p.category}</p>
                  <h2 style={{ fontSize: isFeature ? 'clamp(16px,4vw,28px)' : 'clamp(14px,3vw,18px)', fontWeight: 900, margin: '0 0 5px', lineHeight: 1.15, letterSpacing: '-0.03em', color: pal.text }}>{p.name}</h2>
                  {p.description && (
                    <p style={{ fontSize: 11, opacity: 0.55, margin: '0 0 4px', color: pal.text, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description.replace(/\n/g, ' ')}
                    </p>
                  )}
                </div>
                <div className="story-card-actions">
                  <span style={{ fontSize: isFeature ? 22 : 18, fontWeight: 900, color: pal.bg === colors.accent ? '#fff' : colors.accent, letterSpacing: '-0.03em' }}>NPR {p.price.toLocaleString()}</span>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => setSelectedProduct(p)} style={{ background: 'transparent', border: `1px solid ${pal.bg === colors.accent ? 'rgba(255,255,255,0.5)' : colors.accent + '40'}`, color: pal.bg === colors.accent ? '#fff' : colors.accent, borderRadius: 11, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Details
                    </button>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{
                      background: pal.bg === colors.accent ? 'rgba(255,255,255,0.9)' : colors.accent,
                      color: pal.bg === colors.accent ? colors.accent : '#fff',
                      border: 'none', borderRadius: 11, padding: '7px 16px', fontSize: 12, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                      opacity: p.stock <= 0 ? 0.4 : 1, transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}>
                      {p.stock > 0 ? 'Add →' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Footer */}
      <footer style={{ background: colors.accent, color: '#fff', padding: 'clamp(28px,5vw,56px) clamp(16px,4vw,28px)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <ShopLogo shop={shop} size={44} borderRadius={11} bg="rgba(255,255,255,0.2)" fontSize={26} />
        </div>
        <p style={{ fontWeight: 900, fontSize: 18, margin: '0 0 6px', letterSpacing: '-0.04em' }}>{shop.name}</p>
        <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>{shop.location} · {shop.phone}</p>
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
