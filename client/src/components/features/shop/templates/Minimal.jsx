import { useState } from 'react'
import { ProductImg, ShopLogo, SocialBar, ProductDetailDrawer } from '../shared/shopShared'

export function MinimalShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{`
        /* Desktop: table-style row */
        .minimal-row-desktop {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 0 14px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #eee;
          background: transparent;
          transition: background 0.2s;
        }
        .minimal-row-desktop:hover { background: ${colors.accent}08 !important; }

        /* On mobile, switch to card-style layout */
        @media (max-width: 599px) {
          .minimal-row-desktop {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
            padding: 13px 0;
            grid-template-columns: unset;
          }
          .minimal-thumb { flex-shrink: 0; }
          .minimal-info  { flex: 1; min-width: 0; }
          .minimal-price { font-size: 15px !important; }
          .minimal-actions {
            width: 100%;
            display: flex !important;
            gap: 8px;
            margin-top: 2px;
          }
          .minimal-actions button {
            opacity: 1 !important;
            flex: 1;
          }
          .minimal-table-head { display: none !important; }
        }

        /* Desktop: show action buttons on hover */
        @media (min-width: 600px) {
          .minimal-row-desktop { grid-template-columns: 56px 1fr auto 120px; }
          .minimal-add-btn { opacity: 0; transition: opacity 0.2s; }
          .minimal-row-desktop:hover .minimal-add-btn { opacity: 1 !important; }
        }

        /* Category pills: scrollable on mobile */
        .minimal-cat-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        @media (max-width: 479px) {
          .minimal-cat-pills { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
          .minimal-cat-pills::-webkit-scrollbar { display: none; }
        }

        /* Footer: stack on mobile */
        .minimal-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `2px solid #111`, position: 'sticky', top: 0, zIndex: 100, background: '#FAFAFA' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(14px,4vw,48px)', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <ShopLogo shop={shop} size={20} borderRadius={4} bg="transparent" fontSize={16} />
            <p style={{ fontWeight: 900, fontSize: 'clamp(12px,3.5vw,15px)', margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => setChatOpen(true)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#555', letterSpacing: '0.04em' }}>Chat</button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background: '#111', border: 'none', color: '#fff', borderRadius: 5, height: 32, padding: '0 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer', position: 'relative', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Bag {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — just typography */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(36px,8vw,112px) clamp(14px,4vw,48px) clamp(18px,4vw,56px)' }}>
        <p style={{ fontSize: 'clamp(9px,1.5vw,12px)', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', color: '#888', margin: '0 0 18px' }}>Collection</p>
        <h1 style={{ fontSize: 'clamp(32px,8vw,96px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.05em', margin: '0 0 26px', color: '#111' }}>{shop.name}</h1>
        <div style={{ width: 56, height: 3, background: colors.accent, borderRadius: 2 }} />
        {shop.description && <p style={{ fontSize: 'clamp(13px,2vw,17px)', color: '#555', margin: '26px 0 0', lineHeight: 1.6, maxWidth: 520 }}>{shop.description}</p>}
      </section>

      {/* Category pills */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(14px,4vw,48px)', marginBottom: 16 }}>
        <div className="minimal-cat-pills">
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{
                background: isActive ? '#111' : 'transparent',
                color: isActive ? '#fff' : '#555',
                border: '1px solid #ccc', borderRadius: 4, padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s', flexShrink: 0
              }}>
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Order note */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 clamp(14px,4vw,48px)', marginBottom: 8 }}>
        <div style={{ borderLeft: `3px solid ${colors.accent}`, paddingLeft: 14, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            Add items to your bag and check out — we'll call you to confirm before delivery. No payment upfront.
          </p>
        </div>
      </div>

      {/* Product list */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(12px,4vw,40px) clamp(14px,4vw,48px)' }}>
        {/* Desktop table header */}
        <div className="minimal-table-head" style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto 120px', gap: '0 14px', padding: '0 0 10px', borderBottom: '1px solid #ddd' }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>#</span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>Product</span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right' }}>Price</span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa', textAlign: 'right' }}></span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', opacity: 0.3 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>No items in this collection.</p>
          </div>
        )}

        {filtered.map((p) => (
          <div key={p._id} className="minimal-row-desktop">
            {/* Thumbnail */}
            <div className="minimal-thumb" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
              <ProductImg product={p} size={48} borderRadius={7} bg={`${colors.accent}12`} fontSize={22} />
            </div>

            {/* Name + meta */}
            <div className="minimal-info" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer', minWidth: 0 }}>
              <p style={{ fontWeight: 800, fontSize: 'clamp(13px,2vw,16px)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{p.name}</p>
              <p style={{ fontSize: 10, color: '#999', margin: '0 0 2px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{p.category} · {p.stock} in stock</p>
              {p.description && (
                <p style={{ fontSize: 11, color: '#777', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description.replace(/\n/g, ' ')}
                </p>
              )}
            </div>

            {/* Price */}
            <p className="minimal-price" style={{ fontSize: 'clamp(14px,2vw,17px)', fontWeight: 900, color: '#111', margin: 0, textAlign: 'right', whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
              NPR {p.price.toLocaleString()}
            </p>

            {/* Action buttons */}
            <div className="minimal-actions" style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedProduct(p)} className="minimal-add-btn" style={{
                background: 'transparent', color: colors.accent, border: `1px solid ${colors.accent}40`, borderRadius: 5,
                padding: '7px 9px', fontSize: 10, fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                View
              </button>
              <button disabled={p.stock <= 0} onClick={() => addToCart(p)} className="minimal-add-btn" style={{
                background: p.stock > 0 ? colors.accent : '#ccc', color: '#fff', border: 'none', borderRadius: 5,
                padding: '7px 12px', fontSize: 10, fontWeight: 800, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                {p.stock > 0 ? '+ Add' : 'Out'}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '2px solid #111', padding: 'clamp(24px,4vw,56px) clamp(14px,4vw,48px)', maxWidth: 960, margin: '0 auto' }}>
        <div className="minimal-footer">
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, margin: '0 0 5px', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{shop.name}</p>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{shop.location} · {shop.phone}</p>
          </div>
          <SocialBar shop={shop} size={20} />
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
