import { useState, useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader, Card, EmptyState } from '@/components/ui/index.jsx'
import { OrderRow } from '@/components/features/orders/OrderRow'
import { ORDER_STATUSES } from '@/data/mockData'

const STATUS_META = {
  Pending:   { icon: '📞' },
  Confirmed: { icon: '✅' },
  Delivered: { icon: '💰' },
  Cancelled: { icon: '❌' },
}

export default function OrdersPage() {
  const { orders, loading } = useShop()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'All' ? orders : orders.filter(o => o.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.customer?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.product?.toLowerCase().includes(q) ||
        o.orderId?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filter, search])

  const counts = useMemo(() => {
    const c = {}
    ORDER_STATUSES.forEach(s => { c[s] = orders.filter(o => o.status === s).length })
    return c
  }, [orders])

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
      <style>{`
        /* Orders table: 6-col on desktop, hidden on mobile (card view instead) */
        .orders-table-head {
          display: grid;
          grid-template-columns: 90px 1fr 110px 90px 120px 110px;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          background: var(--color-bg-base);
          border-bottom: 1px solid var(--color-border);
          font-size: 11px; font-weight: 700;
          color: var(--color-text-muted);
          letter-spacing: 0.8px;
        }
        @media (max-width: 700px) {
          .orders-table-head { display: none !important; }
        }

        /* Search bar: full width on mobile */
        .orders-search {
          margin-left: auto;
          min-width: 200px;
        }
        @media (max-width: 600px) {
          .orders-search { margin-left: 0; width: 100%; min-width: unset; }
        }
      `}</style>

      <SectionHeader title={`Orders (${orders.length})`} />

      {/* Filter tabs + search */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              borderRadius: 'var(--radius-full)', padding: '5px 14px',
              border: '1px solid var(--color-border)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: filter === s ? 'var(--color-brand)' : 'var(--color-bg-raised)',
              color: filter === s ? '#fff' : 'var(--color-text-secondary)',
            }}>
            {s === 'All' ? `All (${orders.length})` : `${STATUS_META[s]?.icon} ${s} (${counts[s]})`}
          </button>
        ))}

        <input
          type="text"
          placeholder="🔍 Search orders…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="orders-search"
          style={{
            background: 'var(--color-bg-raised)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Desktop table head */}
        <div className="orders-table-head">
          <span>ORDER</span>
          <span>CUSTOMER / ADDRESS</span>
          <span>AMOUNT</span>
          <span>DATE</span>
          <span>STATUS</span>
          <span>CHANGE</span>
        </div>

        {filtered.length > 0
          ? filtered.map(o => <OrderRow key={o._id} order={o} />)
          : <EmptyState icon="📭" title="No orders" desc={`No ${filter.toLowerCase()} orders found.`} />
        }
      </Card>

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
        Tap any row to expand full customer details
      </p>
    </PageLayout>
  )
}
