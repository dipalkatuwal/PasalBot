import { useState } from 'react'
import { ProductImg, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

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

  const addToCart = (p) => { setCart(c => [...c, p]); setCartOpen(true) }
  const cartTotal = cart.reduce((s, p) => s + p.price, 0)

  // Palettes for editorial "story cards"
  const storyPalettes = [
    { bg: colors.accent, text: '#fff' },
    { bg: colors.card, text: colors.text },
    { bg: colors.bg, text: colors.text },
  ]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        .story-root { --gutter: 16px; }
        @media (min-width: 600px) { .story-root { --gutter: 28px; } }
        @media (min-width: 900px) { .story-root { --gutter: 48px; } }
        .story-card:hover .story-overlay { opacity: 1 !important; }
        .story-card:hover { transform: scale(1.01); }
        .story-card { transition: transform 0.3s ease; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${colors.bg}f0`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.accent}18` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--gutter, 16px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShopLogo shop={shop} size={28} borderRadius={6} bg={`${colors.accent}20`} fontSize={20} />
            <div>
              <p style={{ fontWeight: 900, fontSize: 17, margin: 0, letterSpacing: '-0.04em' }}>{shop.name}</p>
              <p style={{ fontSize: 10, margin: 0, opacity: 0.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{shop.location || 'Nepal'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: `${colors.accent}18`, border: 'none', color: colors.accent, borderRadius: 10, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>💬</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: colors.accent, border: 'none', color: '#fff', borderRadius: 10, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', position: 'relative' }}>
              🛒{cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 6, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Magazine Masthead */}
      <section style={{ background: colors.accent, color: '#fff', padding: 'clamp(40px,6vw,80px) var(--gutter,16px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <p style={{ fontSize: 'clamp(11px,2vw,13px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', opacity: 0.75, margin: '0 0 16px' }}>Issue No. 01 · {shop.name}</p>
        <h1 style={{ fontSize: 'clamp(36px,8vw,96px)', fontWeight: 900, margin: 0, lineHeight: 0.9, letterSpacing: '-0.05em' }}>{shop.name}</h1>
        <p style={{ fontSize: 'clamp(14px,2.5vw,20px)', opacity: 0.8, margin: '20px 0 0', maxWidth: 500, marginInline: 'auto' }}>{shop.description || 'Curated with care. Delivered with love.'}</p>
      </section>

      {/* Category Strip */}
      <div style={{ overflowX: 'auto', borderBottom: `1px solid ${colors.accent}15`, background: colors.card }}>
        <div style={{ display: 'flex', gap: 0, maxWidth: 900, margin: '0 auto', padding: '0 var(--gutter,16px)' }}>
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: 'none', border: 'none', color: isActive ? colors.accent : colors.text,
                padding: '14px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                borderBottom: `3px solid ${isActive ? colors.accent : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '-0.01em'
              }}>
                {cat.emoji} {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Story Cards — editorial layout */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px,4vw,48px) var(--gutter,16px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.3 }}>
            <p style={{ fontSize: 64, margin: '0 0 16px' }}>📰</p>
            <p style={{ fontWeight: 700 }}>No stories here yet.</p>
          </div>
        )}
        {filtered.map((p, i) => {
          const pal = storyPalettes[i % storyPalettes.length]
          const isFeature = i === 0 // first card is big
          return (
            <div key={p._id} className="story-card" style={{
              borderRadius: 24, overflow: 'hidden', position: 'relative',
              minHeight: isFeature ? 340 : 180,
              background: pal.bg,
              display: 'flex', flexDirection: isFeature ? 'column' : 'row',
              border: `1px solid ${colors.accent}14`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              cursor: 'pointer',
            }}>
              {/* Image / Emoji art panel */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: isFeature ? '100%' : 130,
                    minWidth: isFeature ? 'unset' : 130,
                    height: isFeature ? 200 : '100%',
                    minHeight: isFeature ? 'unset' : 130,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
              <div style={{
                background: isFeature ? `linear-gradient(135deg, ${colors.accent}cc, ${colors.accent})` : `${colors.accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFeature ? 96 : 56,
                width: isFeature ? '100%' : 130,
                minWidth: isFeature ? 'unset' : 130,
                height: isFeature ? 200 : 'auto',
                flexShrink: 0,
              }}>
                {p.image}
              </div>
              )}
              {/* Text */}
              <div style={{ flex: 1, padding: isFeature ? '24px 28px' : '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, margin: '0 0 8px', opacity: 0.8 }}>{p.category}</p>
                  <h2 style={{ fontSize: isFeature ? 'clamp(20px,4vw,30px)' : 'clamp(15px,3vw,19px)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.15, letterSpacing: '-0.03em', color: pal.text }}>{p.name}</h2>
                  {p.description && (
                    <p style={{ fontSize: 12, opacity: 0.55, margin: '0 0 6px', color: pal.text, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description.replace(/\n/g, ' ')}
                    </p>
                  )}
                  <p style={{ fontSize: 13, opacity: 0.6, margin: 0, color: pal.text, lineHeight: 1.5 }}>In stock: {p.stock} available</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isFeature ? 28 : 22, fontWeight: 900, color: pal.bg === colors.accent ? '#fff' : colors.accent, letterSpacing: '-0.03em' }}>NPR {p.price.toLocaleString()}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSelectedProduct(p)} style={{ background: 'transparent', border: `1px solid ${pal.bg === colors.accent ? 'rgba(255,255,255,0.5)' : colors.accent + '40'}`, color: pal.bg === colors.accent ? '#fff' : colors.accent, borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Details
                    </button>
                    <button disabled={p.stock <= 0} onClick={() => addToCart(p)} style={{
                      background: pal.bg === colors.accent ? 'rgba(255,255,255,0.9)' : colors.accent,
                      color: pal.bg === colors.accent ? colors.accent : '#fff',
                      border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                      opacity: p.stock <= 0 ? 0.4 : 1, transition: 'all 0.2s'
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
      <footer style={{ background: colors.accent, color: '#fff', padding: 'clamp(32px,5vw,60px) var(--gutter,16px)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <ShopLogo shop={shop} size={48} borderRadius={12} bg="rgba(255,255,255,0.2)" fontSize={28} />
        </div>
        <p style={{ fontWeight: 900, fontSize: 20, margin: '0 0 8px', letterSpacing: '-0.04em' }}>{shop.name}</p>
        <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>{shop.location} · {shop.phone}</p>
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
