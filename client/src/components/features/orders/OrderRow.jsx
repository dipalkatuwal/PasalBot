import { useShop } from '@/context/ShopContext'
import { StatusBadge } from '@/components/ui/index.jsx'
import { formatNPR, formatDate } from '@/utils/formatters'
import { ORDER_STATUSES } from '@/data/mockData'

export function OrderRow({ order }) {
  const { updateOrderStatus } = useShop()

  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           '1rem',
      padding:       '1rem 1.5rem',
      borderBottom:  '1px solid var(--color-border)',
      flexWrap:      'wrap',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: 12, minWidth: 80 }}>
        {order.id}
      </span>

      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{order.customer}</p>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12 }}>
          {order.phone} · {order.product}
        </p>
      </div>

      <span style={{ fontWeight: 700, fontSize: 15, minWidth: 110 }}>{formatNPR(order.amount)}</span>

      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', minWidth: 90 }}>{formatDate(order.date)}</span>

      <StatusBadge status={order.status} />

      <select
        value={order.status}
        onChange={e => updateOrderStatus(order.id, e.target.value)}
        style={{
          background:   'var(--color-bg-base)',
          color:        'var(--color-text-primary)',
          border:       '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding:      '6px 10px',
          fontSize:     13,
          cursor:       'pointer',
          fontFamily:   'var(--font-body)',
        }}
      >
        {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
    </div>
  )
}
