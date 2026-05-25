import { useState } from 'react'
import { getTheme } from '@/data/themes'
import { getTemplate } from './templates/index'
import { ShopLogo, SocialBar, CartDrawer, ChatDrawer, ProductDetailDrawer } from './shared/shopShared'

// ── ShopUI ────────────────────────────────────────────────────────────────────
// Dispatcher: resolves theme → colors, resolves templateId → component,
// owns shared cart/chat state, and renders the correct template.
//
// Adding a new template: see templates/index.js
// Adding a new theme:    see data/themes.js
// ─────────────────────────────────────────────────────────────────────────────

export function ShopUI({ shop, products, keywords, categories, themeId, templateId }) {
  const [cart,      setCart]      = useState([])
  const [chatOpen,  setChatOpen]  = useState(false)
  const [cartOpen,  setCartOpen]  = useState(false)

  const { colors } = getTheme(themeId)

  const sharedOverlays = (
    <>
      {cartOpen && (
        <CartDrawer
          colors={colors}
          cart={cart}
          onRemove={(i) => setCart(c => c.filter((_, j) => j !== i))}
          onClose={() => setCartOpen(false)}
          onCheckout={() => { setCartOpen(false); setChatOpen(true) }}
        />
      )}
      {chatOpen && (
        <ChatDrawer
          colors={colors}
          onClose={() => setChatOpen(false)}
          keywords={keywords}
          products={products}
          onOrderComplete={async () => setCart([])}
        />
      )}
    </>
  )

  // ── Look up template from registry ────────────────────────────────────────
  const TemplateComponent = getTemplate(templateId)

  if (TemplateComponent) {
    return (
      <>
        <TemplateComponent
          shop={shop}
          products={products}
          keywords={keywords}
          categories={categories}
          colors={colors}
          cart={cart}
          setCart={setCart}
          setChatOpen={setChatOpen}
          setCartOpen={setCartOpen}
        />
        {sharedOverlays}
      </>
    )
  }

  // ── Default / fallback template (built-in grid layout) ────────────────────
  return <DefaultShopUI
    shop={shop} products={products} keywords={keywords} categories={categories}
    colors={colors} cart={cart} setCart={setCart}
    chatOpen={chatOpen} setChatOpen={setChatOpen}
    cartOpen={cartOpen} setCartOpen={setCartOpen}
  />
}

// ── Default template — kept here as the built-in fallback ────────────────────
function DefaultShopUI({ shop, products, keywords, categories, colors, cart, setCart, chatOpen, setChatOpen, cartOpen, setCartOpen }) {
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

  const addToCart  = (p) => { setCart(c => [...c, p]); setCartOpen(true) }
  const removeItem = (i) => setCart(c => c.filter((_, j) => j !== i))

  const handleOrderComplete = async () => setCart([])
  const handleCartCheckout  = () => { setCartOpen(false); setChatOpen(true) }

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, color: colors.text,
      fontFamily: 'var(--font-body)', scrollBehavior: 'smooth',
      position: 'relative', overflowX: 'hidden'
    }} className="shop-root">

      <style>{`
        .shop-root { --gutter: 16px; container-type: inline-size; container-name: shop; }
        @container shop (min-width: 480px) {
          .shop-root { --gutter: 24px; }
          .product-grid  { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; }
        }
        @container shop (min-width: 640px) {
          .hide-mobile { display: inline-flex !important; }
          .product-grid  { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
        }
        @container shop (min-width: 768px) {
          .shop-root { --gutter: 40px; }
          .hero-card  { padding: 60px !important; border-radius: 48px !important; }
          .hero-title { font-size: 64px !important; }
          .product-grid  { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 32px; }
          .category-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
          .trust-bar  { gap: 40px 60px; }
          .footer-content { grid-template-columns: 2fr 1fr 1fr; }
        }
        .hide-mobile { display: none !important; }
        .hero-card {
          background: rgba(255,255,255,0.1); backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 28px; padding: 24px; width: 100%; max-width: 650px;
          box-sizing: border-box; box-shadow: 0 40px 100px rgba(0,0,0,0.3);
        }
        .hero-title { font-size: clamp(22px,7cqw,64px); line-height:1; letter-spacing:-0.05em; font-weight:900; margin-bottom:16px; color:#fff; }
        .grid-container { display:grid; gap:12px; width:100%; max-width:1200px; margin:0 auto; padding:0 var(--gutter); box-sizing:border-box; }
        .category-grid { grid-template-columns: repeat(2,1fr); }
        .product-grid  { grid-template-columns: repeat(2,1fr); gap:12px; }
        .trust-bar { display:flex; flex-wrap:wrap; justify-content:center; gap:16px 24px; padding:24px var(--gutter); background:rgba(0,0,0,0.03); border-bottom:1px solid rgba(0,0,0,0.05); box-sizing:border-box; }
        .footer-content { display:grid; grid-template-columns:1fr; gap:32px; max-width:1200px; margin:0 auto; padding:48px var(--gutter); box-sizing:border-box; }
        .product-card { transition:transform 0.15s,box-shadow 0.15s; }
        .product-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.07)!important; }
      `}</style>

      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:`${colors.bg}ee`, backdropFilter:'blur(20px)', borderBottom:`1px solid ${colors.accent}15` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 var(--gutter)', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:colors.accent, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', overflow:'hidden' }}>
              <ShopLogo shop={shop} size={40} borderRadius={0} bg={colors.accent} fontSize={20} />
            </div>
            <p style={{ fontWeight:900, fontSize:20, margin:0, letterSpacing:'-0.04em' }}>{shop.name}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setChatOpen(true)} style={{ background:`${colors.accent}15`, border:'none', color:colors.accent, borderRadius:12, height:40, padding:'0 16px', fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <span>💬</span> <span className="hide-mobile">Support</span>
            </button>
            <button onClick={() => setCartOpen(v => !v)} style={{ background:colors.accent, border:'none', color:'#fff', borderRadius:12, height:40, padding:'0 16px', fontSize:13, fontWeight:800, cursor:'pointer', position:'relative' }}>
              <span>🛒 Bag</span>
              {cart.length > 0 && <span style={{ position:'absolute', top:-8, right:-8, background:'#ef4444', color:'#fff', borderRadius:8, minWidth:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, border:'2px solid #fff' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ minHeight:'50vh', display:'flex', alignItems:'center', padding:'clamp(32px,6cqw,60px) var(--gutter)', background: shop.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.5)),url('${shop.heroBgUrl}') center/cover` : `linear-gradient(135deg,${colors.accent}dd 0%,${colors.accent}88 100%)`, boxSizing:'border-box' }}>
        <div className="hero-card">
          <h1 className="hero-title">Discover<br />{shop.name}</h1>
          <p style={{ fontSize:'clamp(13px,3cqw,18px)', color:'rgba(255,255,255,0.9)', margin:'0 0 clamp(16px,4cqw,32px)', lineHeight:1.5, fontWeight:500 }}>
            {shop.description || 'Premium quality and local essentials delivered to your doorstep.'}
          </p>
          <button onClick={() => document.getElementById('shop-grid').scrollIntoView({ behavior:'smooth' })} style={{ background:colors.accent, color:'#fff', border:'none', borderRadius:'clamp(10px,2cqw,16px)', padding:'clamp(10px,2.5cqw,16px) clamp(18px,5cqw,32px)', fontSize:'clamp(13px,2.5cqw,16px)', fontWeight:800, cursor:'pointer', boxShadow:`0 10px 30px ${colors.accent}44` }}>
            Start Shopping
          </button>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        {[['📍', shop.location || 'Nepal'], ['🛡️', 'Secure Payments'], ['🔄', 'Easy Returns']].map(([icon, label]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>{icon}</span>
            <span style={{ fontWeight:800, fontSize:15, letterSpacing:'-0.01em' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section style={{ padding:'clamp(32px,6cqw,60px) 0' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(18px,4cqw,28px)', fontWeight:900, marginBottom:'clamp(20px,4cqw,40px)' }}>Shop by Category</h2>
        <div className="grid-container category-grid">
          {visibleCats.map(cat => {
            const isActive = cat._id === activeCat
            return (
              <button key={cat._id} onClick={() => setActiveCat(cat._id)} style={{ background:isActive ? colors.accent : colors.card, color:isActive ? '#fff' : colors.text, border:`1px solid ${isActive ? colors.accent : 'rgba(0,0,0,0.05)'}`, borderRadius:'clamp(14px,3cqw,24px)', padding:'clamp(14px,3cqw,24px)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'clamp(6px,1.5cqw,10px)', transition:'all 0.2s', boxShadow:isActive ? `0 10px 30px ${colors.accent}33` : '0 2px 10px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize:'clamp(22px,5cqw,32px)' }}>{cat.emoji}</span>
                <span style={{ fontSize:'clamp(11px,2cqw,14px)', fontWeight:800 }}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Products */}
      <main id="shop-grid" style={{ paddingBottom:'clamp(60px,8cqw,100px)' }}>
        <div className="grid-container" style={{ marginBottom:'clamp(16px,3cqw,32px)' }}>
          <h2 style={{ fontSize:'clamp(20px,5cqw,32px)', fontWeight:900, margin:0 }}>Featured Collection</h2>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'clamp(48px,8cqw,100px) 0', background:colors.card, borderRadius:'clamp(20px,4cqw,40px)', margin:'0 var(--gutter)' }}>
            <p style={{ fontSize:'clamp(48px,10cqw,80px)', margin:'0 0 20px' }}>🛍️</p>
            <p style={{ fontSize:'clamp(14px,3cqw,20px)', fontWeight:800, opacity:0.4 }}>Our collection is being updated.</p>
          </div>
        )}
        <div className="grid-container product-grid">
          {filtered.map(p => (
            <div key={p._id} onClick={() => setSelectedProduct(p)} style={{ borderRadius:'clamp(16px,3cqw,28px)', padding:'clamp(12px,2.5cqw,16px)', background:colors.card, border:'1px solid rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:'clamp(8px,2cqw,12px)', boxShadow:'0 4px 20px rgba(0,0,0,0.02)', cursor:'pointer' }} className="product-card">
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:'clamp(12px,2.5cqw,20px)', display:'block' }} />
                : <div style={{ aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(40px,10cqw,64px)', borderRadius:'clamp(12px,2.5cqw,20px)', background:colors.bg }}>{p.image}</div>
              }
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:800, fontSize:'clamp(13px,2.5cqw,16px)', margin:'0 0 4px', lineHeight:1.3 }}>{p.name}</p>
                {p.description && (
                  <p style={{ fontSize:'clamp(11px,2cqw,13px)', color:colors.text, opacity:0.5, margin:'0 0 4px', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {p.description.replace(/\n/g, ' ')}
                  </p>
                )}
                <p style={{ fontWeight:900, fontSize:'clamp(15px,3cqw,20px)', color:colors.accent, margin:0 }}>NPR {p.price.toLocaleString()}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p) }} style={{ flex:1, background:`${colors.accent}15`, color:colors.accent, border:'none', borderRadius:'clamp(10px,2cqw,14px)', padding:'clamp(8px,2cqw,11px)', fontSize:'clamp(11px,2cqw,13px)', fontWeight:800, cursor:'pointer' }}>
                  Details
                </button>
                <button disabled={p.stock <= 0} onClick={(e) => { e.stopPropagation(); addToCart(p) }} style={{ flex:1, background:p.stock > 0 ? colors.accent : '#9ca3af', color:'#fff', border:'none', borderRadius:'clamp(10px,2cqw,14px)', padding:'clamp(8px,2cqw,11px)', fontSize:'clamp(11px,2cqw,13px)', fontWeight:800, cursor:p.stock > 0 ? 'pointer' : 'not-allowed' }}>
                  {p.stock > 0 ? 'Add to Bag' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background:colors.card, borderTop:'1px solid rgba(0,0,0,0.05)' }}>
        <div className="footer-content">
          <div>
            <p style={{ fontWeight:900, fontSize:'clamp(15px,3cqw,20px)', marginBottom:16 }}>{shop.name}</p>
            <p style={{ fontSize:'clamp(12px,2cqw,14px)', opacity:0.6, lineHeight:1.6 }}>{shop.description || 'Quality products delivered with care.'}</p>
          </div>
          <div>
            <h4 style={{ fontSize:'clamp(11px,1.8cqw,13px)', fontWeight:800, textTransform:'uppercase', marginBottom:'clamp(12px,2.5cqw,20px)', color:colors.accent }}>Visit Us</h4>
            <p style={{ fontSize:'clamp(12px,2cqw,14px)', opacity:0.6, lineHeight:1.6, margin:0 }}>{shop.location || 'Nepal'}<br />{shop.phone}</p>
          </div>
          <div>
            <h4 style={{ fontSize:'clamp(11px,1.8cqw,13px)', fontWeight:800, textTransform:'uppercase', marginBottom:'clamp(12px,2.5cqw,20px)', color:colors.accent }}>Follow Us</h4>
            <SocialBar shop={shop} size={22} />
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {cartOpen && <CartDrawer colors={colors} cart={cart} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={handleCartCheckout} />}
      {chatOpen && <ChatDrawer colors={colors} onClose={() => setChatOpen(false)} keywords={keywords} products={products} onOrderComplete={handleOrderComplete} />}
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
