import { useState, useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader, Card, EmptyState } from '@/components/ui/index.jsx'
import { OrderRow } from '@/components/features/orders/OrderRow'
import { ORDER_STATUSES } from '@/data/mockData'
import { formatNPR } from '@/utils/formatters'

export default function OrdersPage() {
  const { orders, loading } = useShop()
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() =>
    filter === 'All' ? orders : orders.filter(o => o.status === filter),
    [orders, filter]
  )

  const deliveredRevenue = useMemo(() =>
    orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.amount, 0),
    [orders]
  )

  const FILTERS = ['All', ...ORDER_STATUSES]

  if (loading) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: 14 }}>
        Loading orders…
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <SectionHeader title={`Orders (${orders.length})`} />

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: 13 }}>
          💰 Delivered revenue: <strong style={{ color: 'var(--color-brand)' }}>{formatNPR(deliveredRevenue)}</strong>
        </div>
        <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: 13 }}>
          ⏳ Pending: <strong style={{ color: '#F97316' }}>{orders.filter(o => o.status === 'Pending').length}</strong>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', background: filter === s ? 'var(--color-brand)' : 'var(--color-bg-raised)', color: filter === s ? '#fff' : 'var(--color-text-secondary)' }}>
            {s}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table head */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 110px 90px 90px 110px', gap: '1rem', padding: '0.75rem 1.5rem', background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: 0.8 }}>
          <span>ORDER</span><span>CUSTOMER</span><span>AMOUNT</span><span>DATE</span><span>STATUS</span><span>ACTION</span>
        </div>
        {filtered.length > 0
          ? filtered.map(o => <OrderRow key={o._id} order={o} />)
          : <EmptyState icon="📭" title="No orders" desc={`No ${filter.toLowerCase()} orders found.`} />
        }
      </Card>
    </PageLayout>
  )
}
