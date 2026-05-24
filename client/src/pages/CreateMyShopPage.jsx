import { useState, useEffect } from 'react'
import { useShop } from '@/context/ShopContext'
import { useAuth } from '@/context/AuthContext'
import { useUI } from '@/context/UIContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, SectionHeader, Input, Textarea, Toast } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { SHOP_THEMES, SHOP_TEMPLATES } from '@/data/mockData'
import { updateShop } from '@/services/api'

const TABS = [
  { id: 'details',   label: '📝 Details'   },
  { id: 'themes',    label: '🎨 Themes'    },
  { id: 'templates', label: '📐 Templates' },
]

export default function CreateMyShopPage() {
  const { activeTheme, setTheme, activeTemplate, setTemplate, setPreviewShop } = useShop()
  const { user, updateUser } = useAuth()
  const { demoShopOpen, openDemoShop, closeDemoShop } = useUI()
  const [tab,     setTab]     = useState('details')
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')

  // Form state for shop details
  const [details, setDetails] = useState({
    name: user?.shop?.name || '',
    logo: user?.shop?.logo || '🏪',
    description: user?.shop?.description || '',
    location: user?.shop?.location || '',
    phone: user?.shop?.phone || '',
    deliveryTime: user?.shop?.deliveryTime || '1-3 days',
    deliveryAreas: user?.shop?.deliveryAreas || 'Inside Kathmandu Valley',
    paymentMethods: user?.shop?.paymentMethods || ['COD'],
    returnPolicy: user?.shop?.returnPolicy || 'Return/exchange within 3 days',
    howToOrder: user?.shop?.howToOrder || 'Order via the shop bot or DM us',
    businessHours: user?.shop?.businessHours || '10 AM - 8 PM',
    socialLinks: {
      facebook: user?.shop?.socialLinks?.facebook || '',
      instagram: user?.shop?.socialLinks?.instagram || '',
    },
    freeDeliveryThreshold: user?.shop?.freeDeliveryThreshold || 0,
    whatsapp:  user?.shop?.whatsapp  || '',
    website:   user?.shop?.website   || '',
    tagline:   user?.shop?.tagline   || '',
    shopType:  user?.shop?.shopType  || '',
  })

  // Sync details to preview
  useEffect(() => {
    setPreviewShop({ ...details, slug: user?.shop?.slug })
    return () => setPreviewShop(null) // clear on unmount
  }, [details, user?.shop?.slug, setPreviewShop])

  const handleUpdateDetails = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateShop(details)
      updateUser(updated)
      showToast('Shop details updated!')
    } catch {
      showToast('Failed to save details.')
    } finally {
      setSaving(false)
    }
  }

  const togglePaymentMethod = (method) => {
    setDetails(prev => {
      const current = prev.paymentMethods || []
      const updated = current.includes(method)
        ? current.filter(m => m !== method)
        : [...current, method]
      return { ...prev, paymentMethods: updated }
    })
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSetTheme = async (theme) => {
    setSaving(true)
    try {
      await setTheme(theme)
      showToast('Theme updated!')
    } catch {
      showToast('Failed to save theme.')
    } finally {
      setSaving(false)
    }
  }

  const handleSetTemplate = async (template) => {
    setSaving(true)
    try {
      await setTemplate(template)
      showToast('Template updated!')
    } catch {
      showToast('Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>
            Customise My Shop
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Control how your public shop looks and feels
          </p>
        </div>
        
        <button 
          onClick={() => demoShopOpen ? closeDemoShop() : openDemoShop()}
          style={{
            background: demoShopOpen ? 'var(--color-brand)' : 'var(--color-bg-raised)',
            color: demoShopOpen ? '#fff' : 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
            boxShadow: demoShopOpen ? `0 4px 12px var(--color-brand)33` : 'none'
          }}
        >
          <span>{demoShopOpen ? 'Hide Preview' : 'Show Live Preview'}</span>
          <span>{demoShopOpen ? '👁️' : '🛍️'}</span>
        </button>
      </div>

      {/* Shop link preview */}
      <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔗</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Your shop link</p>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {window.location.origin}/shop/{user?.shop?.slug}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => {
          navigator.clipboard?.writeText(`${window.location.origin}/shop/${user?.shop?.slug}`)
          showToast('Link copied!')
        }}>Copy</Button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-raised)', borderRadius: 12, padding: 4, marginBottom: '1.5rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', border: 'none', borderRadius: 9, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
            background: tab === t.id ? 'var(--color-brand)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--color-text-muted)',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Details tab ─────────────────────────────────────────────────── */}
      {tab === 'details' && (
        <form onSubmit={handleUpdateDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <SectionHeader title="Basic Information" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <Input label="Shop Name" value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })} required />
              <Input label="Shop Logo (Emoji)" value={details.logo} onChange={e => setDetails({ ...details, logo: e.target.value })} maxLength={2} />
              <Input label="Phone Number" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} placeholder="98XXXXXXXX" />
              <Input label="WhatsApp Number" value={details.whatsapp} onChange={e => setDetails({ ...details, whatsapp: e.target.value })} placeholder="98XXXXXXXX" />
              <Input label="Location / Address" value={details.location} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="e.g. New Road, Kathmandu" />
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Shop Category / Type</label>
                <select
                  value={details.shopType}
                  onChange={e => setDetails({ ...details, shopType: e.target.value })}
                  style={{ width: '100%', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '7px 10px', color: 'var(--color-text-primary)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">— Select type —</option>
                  <option value="Clothing & Fashion">👗 Clothing & Fashion</option>
                  <option value="Food & Beverages">🍵 Food & Beverages</option>
                  <option value="Handicraft & Art">🎨 Handicraft & Art</option>
                  <option value="Electronics">⚡ Electronics</option>
                  <option value="Beauty & Personal Care">💄 Beauty & Personal Care</option>
                  <option value="Home & Living">🏠 Home & Living</option>
                  <option value="Books & Stationery">📚 Books & Stationery</option>
                  <option value="Jewellery & Accessories">💍 Jewellery & Accessories</option>
                  <option value="Health & Wellness">🌿 Health & Wellness</option>
                  <option value="Gifts & Collectibles">🎁 Gifts & Collectibles</option>
                  <option value="Sports & Outdoors">⛺ Sports & Outdoors</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <Input label="Shop Tagline" value={details.tagline} onChange={e => setDetails({ ...details, tagline: e.target.value })} placeholder="e.g. Handmade with love in Nepal" />
              <Input label="Website URL" value={details.website} onChange={e => setDetails({ ...details, website: e.target.value })} placeholder="https://yourshop.com" />
            </div>
            <Textarea label="Short Description" value={details.description} onChange={e => setDetails({ ...details, description: e.target.value })} placeholder="Tell customers what you sell..." />
          </Card>

          <Card>
            <SectionHeader title="Delivery & Payments" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <Input label="Delivery Time" value={details.deliveryTime} onChange={e => setDetails({ ...details, deliveryTime: e.target.value })} placeholder="e.g. 1-2 days" />
              <Input label="Delivery Areas" value={details.deliveryAreas} onChange={e => setDetails({ ...details, deliveryAreas: e.target.value })} placeholder="e.g. Kathmandu, Lalitpur" />
              <Input label="Free Delivery Above (NPR)" type="number" value={details.freeDeliveryThreshold} onChange={e => setDetails({ ...details, freeDeliveryThreshold: +e.target.value })} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 8 }}>Payment Methods</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['COD', 'eSewa', 'Khalti', 'Bank Transfer'].map(m => (
                  <button key={m} type="button" onClick={() => togglePaymentMethod(m)} style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    background: details.paymentMethods.includes(m) ? 'var(--color-brand)' : 'var(--color-bg-base)',
                    color: details.paymentMethods.includes(m) ? '#fff' : 'var(--color-text-secondary)',
                  }}>{m}</button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Trust & Policy" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <Input label="Business Hours" value={details.businessHours} onChange={e => setDetails({ ...details, businessHours: e.target.value })} placeholder="e.g. 10 AM - 7 PM" />
              <Input label="Return/Exchange Policy" value={details.returnPolicy} onChange={e => setDetails({ ...details, returnPolicy: e.target.value })} />
            </div>
            <Textarea label="How to Order" value={details.howToOrder} onChange={e => setDetails({ ...details, howToOrder: e.target.value })} />
          </Card>

          <Card>
            <SectionHeader title="Social & Web Links" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Input label="Facebook Page URL" value={details.socialLinks.facebook} onChange={e => setDetails({ ...details, socialLinks: { ...details.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/yourpage" />
              <Input label="Instagram Handle" value={details.socialLinks.instagram} onChange={e => setDetails({ ...details, socialLinks: { ...details.socialLinks, instagram: e.target.value } })} placeholder="@yourshop" />
              <Input label="WhatsApp Number" value={details.whatsapp} onChange={e => setDetails({ ...details, whatsapp: e.target.value })} placeholder="98XXXXXXXX" />
              <Input label="Website / TikTok / Other URL" value={details.website} onChange={e => setDetails({ ...details, website: e.target.value })} placeholder="https://yourshop.com" />
            </div>
          </Card>

          <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>
            {saving ? 'Saving...' : 'Save All Details'}
          </Button>
        </form>
      )}

      {/* ── Themes tab ──────────────────────────────────────────────────── */}
      {tab === 'themes' && (
        <>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '-0.5rem 0 1.25rem', lineHeight: 1.6 }}>
            Themes change the color palette of your active template — <strong style={{ color: 'var(--color-text-primary)' }}>{activeTemplate.name}</strong>. Pick a layout first under Templates, then choose your colors here.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {SHOP_THEMES.map(theme => {
              const isActive = activeTheme.id === theme.id
              const c = theme.colors
              // Show a mini preview of the ACTIVE template in this theme's colors
              const tmplId = activeTemplate.id
              return (
                <div key={theme.id}
                  onClick={() => !saving && handleSetTheme(theme)}
                  style={{
                    borderRadius: 14, overflow: 'hidden', cursor: saving ? 'wait' : 'pointer',
                    border: `2px solid ${isActive ? c.accent : 'var(--color-border)'}`,
                    boxShadow: isActive ? `0 0 0 3px ${c.accent}33` : 'none',
                    transition: 'all 0.15s', transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Mini shop preview — active template in this theme's colors */}
                  <div style={{ background: c.bg, padding: '10px', minHeight: 148 }}>
                    {/* Header strip */}
                    <div style={{ background: tmplId === 'shanti' || tmplId === 'kailash' ? '#18181b' : c.bg, border: `1px solid ${c.accent}20`, borderRadius: '8px 8px 0 0', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>🏪</div>
                        <span style={{ fontSize: 7.5, fontWeight: 800, color: tmplId === 'shanti' || tmplId === 'kailash' ? '#fff' : c.text }}>Shop Name</span>
                      </div>
                      <div style={{ background: c.accent, borderRadius: 6, padding: '2px 6px' }}>
                        <span style={{ fontSize: 6.5, fontWeight: 700, color: '#fff' }}>🛒 Bag</span>
                      </div>
                    </div>

                    {/* Hero strip */}
                    {(tmplId === 'himalayan' || tmplId === 'haven') && (
                      <div style={{ height: 32, borderRadius: 6, marginBottom: 5, background: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.65))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 8, fontWeight: 900, letterSpacing: '-0.02em' }}>✦ {activeTemplate.name.toUpperCase()} ✦</span>
                      </div>
                    )}
                    {(tmplId === 'shanti' || tmplId === 'kailash') && (
                      <div style={{ height: 32, borderRadius: 6, marginBottom: 5, background: '#09090b', border: `1px solid ${c.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${c.accent} 0.5px, transparent 1px)`, backgroundSize: '8px 8px', opacity: 0.07 }} />
                        <span style={{ color: c.accent, fontSize: 8, fontWeight: 800, letterSpacing: '0.1em' }}>✦ DIVINE COLLECTION ✦</span>
                      </div>
                    )}

                    {/* Product grid — 3 mini cards in this theme's colors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                      {['🧣', '🍯', '👜', '🪔', '📓', '🎨'].map((e, i) => (
                        <div key={i} style={{
                          background: tmplId === 'shanti' || tmplId === 'kailash' ? '#27272a' : c.card,
                          borderRadius: 6, padding: '5px 3px', textAlign: 'center',
                          border: `1px solid ${c.accent}20`,
                        }}>
                          <p style={{ fontSize: 13, margin: '0 0 1px' }}>{e}</p>
                          <p style={{ fontSize: 5.5, fontWeight: 700, color: c.accent, margin: '0 0 3px' }}>NPR 1,200</p>
                          <div style={{ background: c.accent, borderRadius: 3, padding: '1px 0' }}>
                            <span style={{ fontSize: 5, color: '#fff', fontWeight: 700 }}>Add</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theme info */}
                  <div style={{ padding: '10px 12px', background: 'var(--color-bg-raised)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Color dot swatch */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.bg,    border: '1px solid rgba(0,0,0,0.12)' }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.accent }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.card,  border: '1px solid rgba(0,0,0,0.08)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{theme.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{theme.desc}</p>
                    </div>
                    {isActive && (
                      <span style={{ fontSize: 9, background: c.accent, color: '#fff', padding: '2px 7px', borderRadius: 9999, fontWeight: 700, flexShrink: 0 }}>Active</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Templates tab ─────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {SHOP_TEMPLATES.map(tmpl => {
            const isActive = activeTemplate.id === tmpl.id
            return (
              <div key={tmpl.id}
                onClick={() => !saving && handleSetTemplate(tmpl)}
                style={{
                  borderRadius: 16, overflow: 'hidden', cursor: saving ? 'wait' : 'pointer',
                  border: `2px solid ${isActive ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  boxShadow: isActive ? '0 0 0 3px var(--color-brand-alpha)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {/* Template preview */}
                <div style={{ minHeight: 160 }}>
                  {tmpl.id === 'himalayan' ? (
                    // Himalayan Store — clean white grid with orange accent
                    <div style={{ background: '#F9FAFB', padding: '10px' }}>
                      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>🏔️</div>
                          <span style={{ fontSize: 8, fontWeight: 800 }}>Shop Name</span>
                        </div>
                        <span style={{ fontSize: 7, background: 'var(--color-brand)', color: '#fff', borderRadius: 8, padding: '2px 6px', fontWeight: 700 }}>🛍️ Bag</span>
                      </div>
                      <div style={{ height: 36, background: 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.6))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                        <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>HIMALAYAN STORE</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                        {['🧣', '🍯', '👜', '🪔', '📓', '🎨'].map((e, i) => (
                          <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '5px 3px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: 14, margin: '0 0 1px' }}>{e}</p>
                            <p style={{ fontSize: 6, fontWeight: 700, color: '#6b7280', margin: 0 }}>NPR 1,200</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : tmpl.id === 'haven' ? (
                    // Himalaya Haven — warm serif boutique
                    <div style={{ background: '#fafaf7', padding: '10px', fontFamily: 'Georgia, serif' }}>
                      <div style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 14 }}>🏔️</span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: '#7c2d12' }}>Shop Name</span>
                        </div>
                        <span style={{ fontSize: 7, background: '#7c2d12', color: '#fff', borderRadius: 8, padding: '2px 6px', fontWeight: 700 }}>🛍️ Sacred Bag</span>
                      </div>
                      <div style={{ height: 40, background: 'linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.8))', borderRadius: 6, marginBottom: 6, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '5px 8px' }}>
                        <p style={{ color: '#fbbf24', fontSize: 7, margin: '0 0 2px', letterSpacing: '0.1em' }}>AUTHENTIC GOODS</p>
                        <p style={{ color: '#fff', fontSize: 10, fontWeight: 700, margin: 0 }}>Himalaya Haven</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                        {[['🧣', 'Pashmina', '2,400'], ['🍯', 'Honey', '850'], ['👜', 'Dhaka Bag', '1,200'], ['🪔', 'Salt Lamp', '1,600']].map(([e, n, p], i) => (
                          <div key={i} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                            <div style={{ height: 28, background: 'linear-gradient(135deg,#fff7ed,#fef3c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{e}</div>
                            <div style={{ padding: '3px 5px' }}>
                              <p style={{ fontSize: 6, fontWeight: 600, margin: '0 0 1px' }}>{n}</p>
                              <p style={{ fontSize: 7, fontWeight: 700, color: '#92400e', margin: 0 }}>NPR {p}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : tmpl.id === 'shanti' ? (
                    // Shanti Collective — dark zinc & gold
                    <div style={{ background: '#09090b', padding: '10px' }}>
                      <div style={{ background: 'rgba(9,9,11,0.9)', borderBottom: '1px solid rgba(234,179,8,0.15)', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 14, height: 14, background: '#eab308', color: '#09090b', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>☸️</div>
                          <span style={{ fontSize: 8, fontWeight: 800, color: '#e4e4e7' }}>SHANTI</span>
                        </div>
                        <span style={{ fontSize: 7, background: '#eab308', color: '#09090b', borderRadius: 8, padding: '2px 6px', fontWeight: 700 }}>Sanctuary</span>
                      </div>
                      <div style={{ background: 'linear-gradient(45deg,#09090b,#18181b)', borderRadius: 6, padding: '8px', marginBottom: 6, border: '1px solid rgba(234,179,8,0.1)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #eab308 0.5px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.07 }} />
                        <p style={{ fontSize: 7, color: '#eab308', margin: '0 0 2px', letterSpacing: '0.15em' }}>CURATED WITH INTENTION</p>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Living <span style={{ color: '#eab308' }}>Offerings</span></p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {[['🪔', 'Singing Bowl', '4,800'], ['🌿', 'Juniper Incense', '890'], ['🧵', 'Dhaka Topi', '2,650'], ['📿', 'Bodhi Mala', '1,450']].map(([e, n, p], i) => (
                          <div key={i} style={{ background: '#27272a', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(234,179,8,0.1)' }}>
                            <div style={{ height: 28, background: '#3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{e}</div>
                            <div style={{ padding: '3px 5px' }}>
                              <p style={{ fontSize: 6, fontWeight: 600, color: '#e4e4e7', margin: '0 0 1px', lineHeight: 1.2 }}>{n}</p>
                              <p style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 300, color: '#e4e4e7', margin: 0 }}>{p}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : tmpl.id === 'kailash' ? (
                    // Kailash — cinematic black & gold luxury
                    <div style={{ background: '#000', padding: '10px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 14 }}>🕉️</span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>KAILASH</span>
                        </div>
                        <span style={{ fontSize: 7, background: '#eab308', color: '#000', borderRadius: 8, padding: '2px 6px', fontWeight: 800 }}>Sacred</span>
                      </div>
                      <div style={{ height: 50, background: 'linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.88))', borderRadius: 6, marginBottom: 6, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '6px 8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 8, marginBottom: 3, alignSelf: 'flex-start' }}>
                          <div style={{ width: 1, height: 6, background: '#eab308' }} />
                          <span style={{ fontSize: 6, color: '#fff', letterSpacing: '0.1em' }}>SINCE THE TIME OF GODS</span>
                        </div>
                        <p style={{ color: '#fff', fontSize: 10, fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>WHERE HEAVEN<br/>MEETS EARTH</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                        {[['🏔️', '#451a03'], ['🧿', '#4c1d95'], ['🌿', '#064e3b'], ['🪔', '#451a03'], ['📿', '#4c1d95'], ['🎨', '#064e3b']].map(([e, bg], i) => (
                          <div key={i} style={{ background: '#111', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(234,179,8,0.1)' }}>
                            <div style={{ height: 26, background: `linear-gradient(135deg, ${bg}, #000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{e}</div>
                            <div style={{ padding: '2px 4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 5, color: 'rgba(234,179,8,0.6)' }}>1,200</span>
                              <span style={{ fontSize: 5, color: '#fff', background: '#27272a', borderRadius: 3, padding: '1px 4px' }}>Claim</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // fallback grid
                    <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {['🧣', '🍯', '👜', '🪔', '📓', '🎨'].map((e, i) => (
                          <div key={i} style={{ background: 'var(--color-bg-raised)', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                            <p style={{ fontSize: 18, margin: '0 0 2px' }}>{e}</p>
                            <p style={{ fontSize: 7, fontWeight: 700, color: 'var(--color-text-muted)', margin: 0 }}>NPR 1,200</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Template info */}
                <div style={{ padding: '12px 14px', background: 'var(--color-bg-raised)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{tmpl.preview}</span>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{tmpl.name}</p>
                    {isActive && <span style={{ fontSize: 10, background: 'var(--color-brand)', color: '#fff', padding: '2px 7px', borderRadius: 9999, fontWeight: 700, marginLeft: 'auto' }}>Active</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 8px' }}>{tmpl.desc}</p>
                  <ul style={{ margin: 0, paddingLeft: 16, listStyle: 'none' }}>
                    {tmpl.features.map((f, i) => (
                      <li key={i} style={{ fontSize: 11, color: 'var(--color-text-secondary)', padding: '1px 0' }}>
                        <span style={{ marginRight: 4, color: 'var(--color-brand)' }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}

      
      <Toast message={toast} onClear={() => setToast('')} />
    </PageLayout>
  )
}
