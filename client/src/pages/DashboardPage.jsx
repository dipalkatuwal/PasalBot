import { useNavigate } from 'react-router-dom'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { StatCard, Card, StatusBadge, SectionHeader } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { formatNPR, formatDate } from '@/utils/formatters'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { shop, products, orders, lowStockProducts, totalRevenue, pendingCount } = useShop()

  const recentOrders = [...orders].slice(0, 5)

  const stats = [
    { label: 'Total Orders',    value: orders.length,          icon: '📦', change: '+12% this week', up: true  },
    { label: 'Revenue (May)',   value: formatNPR(totalRevenue), icon: '💰', change: '+23% this week', up: true  },
    { label: 'Products Live',   value: `${products.filter(p => p.visible).length} / ${products.length}`, icon: '🛍️', change: null, up: true },
    { label: 'Pending Orders',  value: pendingCount,            icon: '⏳', change: pendingCount > 0 ? 'Needs attention' : 'All clear', up: pendingCount === 0 },
  ]

  return (
    <PageLayout>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: 0 }}>
            Good morning, <span style={{ color: 'var(--color-brand)' }}>{shop.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate('/products')}>+ Add Product</Button>
          <Button onClick={() => navigator.clipboard?.writeText(`pasalbot.com/shop/${shop.slug}`)}>🔗 Copy Shop Link</Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <Card>
          <SectionHeader
            title="Recent Orders"
            action={<button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>View all →</button>}
          />
          {recentOrders.map((o, i) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < recentOrders.length - 1 ? '1px solid var(--color-border)' : 'none', gap: '0.5rem' }}>
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
          {recentOrders.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>No orders yet.</p>}
        </Card>

        {/* Low Stock */}
        <Card>
          <SectionHeader title="⚠️ Low Stock" />
          {lowStockProducts.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
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

      {/* Bot Activity */}
      <Card style={{ marginTop: '1.5rem' }}>
        <SectionHeader title="🤖 Bot Activity Today" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          {[['23', 'Queries Handled'], ['7', 'Orders Started'], ['4', 'Orders Completed'], ['94%', 'Response Rate']].map(([v, l]) => (
            <div key={l} style={{ background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--color-brand)', margin: '0 0 4px' }}>{v}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12, margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  )
}
