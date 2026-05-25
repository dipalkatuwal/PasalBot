import { useState } from 'react'
import { ProductImg, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function MinimalShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
  const [activeCat, setActiveCat] = useState('all')
  const [hovered, setHovered] = useState(null)
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        .minimal-row { transition: background 0.2s; }
        .minimal-row:hover { background: ${colors.accent}08 !important; }
        .minimal-add-btn { opacity: 0; transition: opacity 0.2s; }
        .minimal-row:hover .minimal-add-btn { opacity: 1 !important; }
      `}</style>

      {/* Spare header — just a thin line + name */}
      <header style={{ borderBottom: `2px solid #111`, position: 'sticky', top: 0, zIndex: 100, background: '#FAFAFA' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(16px,4vw,48px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShopLogo shop={shop} size={22} borderRadius={4} bg="transparent" fontSize={18} />
            <p style={{ fontWeight: 900, fontSize: 16, margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{shop.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setChatOpen(true)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#555', letterSpacing: '0.04em' }}>Chat</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: '#111', border: 'none', color: '#fff', borderRadius: 6, height: 34, padding: '0 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', position: 'relative', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Bag {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </header>

      {/* Spare hero — just typography */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,48px) clamp(32px,4vw,64px)' }}>
        <p style={{ fontSize: 'clamp(10px,1.5vw,12px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', color: '#888', margin: '0 0 24px' }}>Collection</p>
        <h1 style={{ fontSize: 'clamp(40px,8vw,100px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.05em', margin: '0 0 32px', color: '#111' }}>{shop.name}</h1>
        <div style={{ width: 60, height: 3, background: colors.accent, borderRadius: 2 }} />
        {shop.description && <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: '#555', margin: '32px 0 0', lineHeight: 1.6, maxWidth: 520 }}>{shop.description}</p>}
      </section>

      {/* Category pills — minimal, text only */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 0', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 0 }}>
        {visibleCats.map(cat => {
          const isActive = cat._id === activeCat
          return (
            <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
              background: isActive ? '#111' : 'transparent',
              color: isActive ? '#fff' : '#555',
              border: '1px solid #ccc', borderRadius: 4, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s'
            }}>
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Lookbook table */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto auto', gap: '0 24px', padding: '0 0 12px', borderBottom: '1px solid #ddd', marginBottom: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>#</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>Product</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right' }}>Price</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right', minWidth: 80 }}></span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', opacity: 0.3 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>No items in this collection.</p>
          </div>
        )}

        {filtered.map((p, i) => (
          <div key={p._id} className="minimal-row" onMouseEnter={() => setHovered(p._id)} onMouseLeave={() => setHovered(null)}
            style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto auto', gap: '0 24px', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #eee', background: 'transparent' }}>
            {/* Product thumbnail */}
            <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
              <ProductImg product={p} size={52} borderRadius={8} bg={`${colors.accent}12`} fontSize={26} />
            </div>
            {/* Name + meta */}
            <div onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
              <p style={{ fontWeight: 800, fontSize: 'clamp(14px,2vw,17px)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{p.name}</p>
              <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{p.category} · {p.stock} in stock</p>
              {p.description && (
                <p style={{ fontSize: 12, color: '#777', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description.replace(/\n/g, ' ')}
                </p>
              )}
            </div>
            {/* Price */}
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', fontWeight: 900, color: '#111', margin: 0, textAlign: 'right', whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>NPR {p.price.toLocaleString()}</p>
            {/* Buttons — appears on hover */}
            <div style={{ textAlign: 'right', minWidth: 100, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedProduct(p)} className="minimal-add-btn" style={{
                background: 'transparent', color: colors.accent, border: `1px solid ${colors.accent}40`, borderRadius: 6,
                padding: '8px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                View
              </button>
              <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="minimal-add-btn" style={{
                background: p.stock > 0 ? colors.accent : '#ccc', color: '#fff', border: 'none', borderRadius: 6,
                padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                {p.stock > 0 ? '+ Add' : 'Out'}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Minimal footer */}
      <footer style={{ borderTop: '2px solid #111', padding: 'clamp(32px,4vw,60px) clamp(16px,4vw,48px)', maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 6px', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{shop.name}</p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{shop.location} · {shop.phone}</p>
        </div>
        <SocialBar shop={shop} size={20} />
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
