import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop } from '@/context/ShopContext'
import { useAuth } from '@/context/AuthContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { StatCard, Card, StatusBadge, SectionHeader, Toast } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { formatNPR, formatDate } from '@/utils/formatters'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { shop, products, orders, stats, loading } = useShop()
  const [toast, setToast] = useState('')

  const recentOrders     = [...orders].slice(0, 5)
  const liveProducts     = products.filter(p => p.visible)
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.visible)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const copyShopLink = () => {
    const origin = window.location.origin
    const url = `${origin}/shop/${shop.slug}`
    navigator.clipboard?.writeText(url)
      .then(() => setToast('Shop link copied!'))
      .catch(() => setToast('Failed to copy link'))
  }

  const statCards = [
    { label: 'Total Orders',   value: stats.total,           icon: '📦', change: `${stats.weekOrders} this week`, up: true },
    { label: 'Revenue',        value: formatNPR(stats.revenue), icon: '💰', change: stats.delivered > 0 ? `${stats.delivered} delivered` : null, up: true },
    { label: 'Products Live',  value: `${liveProducts.length} / ${products.length}`, icon: '🛍️', change: null },
    { label: 'Pending Orders', value: stats.pending,          icon: '⏳', change: stats.pending > 0 ? 'Needs attention' : 'All clear', up: stats.pending === 0 },
  ]

  if (loading) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: 14 }}>
        Loading your dashboard…
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: 0 }}>
            {greeting()}, <span style={{ color: 'var(--color-brand)' }}>{shop.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate('/products')}>+ Add Product</Button>
          <Button onClick={copyShopLink}>🔗 Copy Shop Link</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <Card>
          <SectionHeader
            title="Recent Orders"
            action={<button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>View all →</button>}
          />
          {recentOrders.map((o, i) => (
            <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < recentOrders.length - 1 ? '1px solid var(--color-border)' : 'none', gap: '0.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{o.customer}</p>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14 }}>{formatNPR(o.amount)}</p>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>No orders yet. Share your shop link to get started!</p>}
        </Card>

        {/* Low Stock */}
        <Card>
          <SectionHeader title="⚠️ Low Stock" />
          {lowStockProducts.slice(0, 5).map(p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 24 }}>{p.image}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <div style={{ background: 'var(--color-bg-overlay)', borderRadius: 'var(--radius-full)', height: 4 }}>
                  <div style={{ background: p.stock <= 3 ? '#EF4444' : 'var(--color-brand)', width: `${Math.min(p.stock * 10, 100)}%`, height: '100%', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: p.stock <= 3 ? '#EF4444' : 'var(--color-brand)', flexShrink: 0 }}>{p.stock} left</span>
            </div>
          ))}
          {lowStockProducts.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>All products well-stocked 🎉</p>}

          <div style={{ marginTop: '1.25rem', padding: '0.9rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>🤖 Bot auto-replies "Low stock" for items below 5</p>
          </div>
        </Card>
      </div>

      {/* Shop Summary */}
      <Card style={{ marginTop: '1.5rem' }}>
        <SectionHeader title="📊 Shop Summary" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem' }}>
          {[
            { value: stats.total,                      label: 'Total Orders',  desc: 'All time orders received',         icon: '📦', color: 'var(--color-brand)' },
            { value: stats.pending,                    label: 'Pending',       desc: 'Call verification needed',         icon: '📞', color: '#F97316' },
            { value: stats.confirmed ?? orders.filter(o => o.status === 'Confirmed').length, label: 'Confirmed', desc: 'Verified — on the way', icon: '✅', color: '#3B82F6' },
            { value: stats.delivered,                  label: 'Delivered',     desc: 'Successfully reached customer',    icon: '💰', color: '#10B981' },
            { value: orders.filter(o => o.status === 'Cancelled').length, label: 'Cancelled', desc: 'Discarded before delivery', icon: '❌', color: '#EF4444' },
            { value: formatNPR(stats.revenue),          label: 'Revenue',         desc: 'From delivered orders only',   icon: '🏦', color: '#8B5CF6' },
          ].map(({ value, label, desc, icon, color }) => (
            <div key={label} style={{ background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 20, margin: '0 0 4px' }}>{icon}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color, margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>{label}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 11, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Toast message={toast} onClear={() => setToast('')} />
    </PageLayout>
  )
}
