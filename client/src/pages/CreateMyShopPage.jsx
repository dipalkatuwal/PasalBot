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
              <Input label="Location" value={details.location} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="e.g. New Road, Kathmandu" />
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
            <SectionHeader title="Social Links" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Input label="Facebook Page URL" value={details.socialLinks.facebook} onChange={e => setDetails({ ...details, socialLinks: { ...details.socialLinks, facebook: e.target.value } })} />
              <Input label="Instagram Handle" value={details.socialLinks.instagram} onChange={e => setDetails({ ...details, socialLinks: { ...details.socialLinks, instagram: e.target.value } })} />
            </div>
          </Card>

          <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>
            {saving ? 'Saving...' : 'Save All Details'}
          </Button>
        </form>
      )}

      {/* ── Themes tab ──────────────────────────────────────────────────── */}
      {tab === 'themes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {SHOP_THEMES.map(theme => {
            const isActive = activeTheme.id === theme.id
            return (
              <div key={theme.id}
                onClick={() => !saving && handleSetTheme(theme)}
                style={{
                  borderRadius: 16, overflow: 'hidden', cursor: saving ? 'wait' : 'pointer',
                  border: `2px solid ${isActive ? theme.colors.accent : 'var(--color-border)'}`,
                  boxShadow: isActive ? `0 0 0 3px ${theme.colors.accent}44` : 'none',
                  transition: 'all 0.2s', position: 'relative',
                }}
              >
                {/* Theme preview */}
                <div style={{ background: theme.colors.bg, padding: '1.25rem' }}>
                  {/* Mini product cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                    {['🧣', '🍯'].map((e, i) => (
                      <div key={i} style={{ background: theme.colors.card, borderRadius: 8, padding: '8px', border: `1px solid ${theme.colors.accent}22` }}>
                        <p style={{ fontSize: 22, margin: '0 0 4px', textAlign: 'center' }}>{e}</p>
                        <p style={{ fontSize: 9, fontWeight: 700, color: theme.colors.text, margin: 0, overflow: 'hidden' }}>Product</p>
                        <p style={{ fontSize: 10, fontWeight: 900, color: theme.colors.accent, margin: 0 }}>NPR 1,200</p>
                      </div>
                    ))}
                  </div>
                  {/* Mini button */}
                  <div style={{ background: theme.colors.accent, borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                    <p style={{ color: '#fff', fontSize: 10, fontWeight: 700, margin: 0 }}>Add to Cart</p>
                  </div>
                </div>

                {/* Theme info */}
                <div style={{ padding: '12px 14px', background: 'var(--color-bg-raised)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{theme.name}</p>
                    {isActive && <span style={{ fontSize: 10, background: theme.colors.accent, color: '#fff', padding: '2px 7px', borderRadius: 9999, fontWeight: 700 }}>Active</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{theme.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Templates tab ────────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {SHOP_TEMPLATES.map(tmpl => {
            const isActive = activeTemplate.id === tmpl.id
            const isBoutique = tmpl.id === 'boutique'
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
                <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem', minHeight: 160 }}>
                  {isBoutique ? (
                    /* Boutique: horizontal strips */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['🧣', '🍯', '👜'].map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-raised)', borderRadius: 8, padding: '6px 8px', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: 20 }}>{e}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Product Name</p>
                            <p style={{ fontSize: 9, color: 'var(--color-brand)', fontWeight: 900, margin: 0 }}>NPR 1,200</p>
                          </div>
                          <div style={{ background: 'var(--color-brand)', borderRadius: 5, padding: '3px 7px' }}>
                            <p style={{ color: '#fff', fontSize: 8, fontWeight: 700, margin: 0 }}>Add</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Grid: 2x2 squares */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {['🧣', '🍯', '👜', '🪔', '📓', '🎨'].map((e, i) => (
                        <div key={i} style={{ background: 'var(--color-bg-raised)', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                          <p style={{ fontSize: 18, margin: '0 0 2px' }}>{e}</p>
                          <p style={{ fontSize: 7, fontWeight: 700, color: 'var(--color-text-muted)', margin: 0 }}>NPR 1,200</p>
                        </div>
                      ))}
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

      

      {/* Toast */}
      <Toast message={toast} onClear={() => setToast('')} />
    </PageLayout>
  )
}
