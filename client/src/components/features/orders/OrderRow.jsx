import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { StatusBadge } from '@/components/ui/index.jsx'
import { formatNPR, formatDate } from '@/utils/formatters'
import { ORDER_STATUSES } from '@/data/mockData'

const STATUS_META = {
  Pending:   { icon: '📞', label: 'Pending',   hint: 'Awaiting call verification' },
  Confirmed: { icon: '✅', label: 'Confirmed', hint: 'Verified — out for delivery' },
  Delivered: { icon: '💰', label: 'Delivered', hint: 'Revenue generated' },
  Cancelled: { icon: '❌', label: 'Cancelled', hint: 'Order discarded' },
}

export function OrderRow({ order }) {
  const { updateOrderStatus } = useShop()
  const [expanded, setExpanded] = useState(false)

  const meta = STATUS_META[order.status] || {}

  const details = [
    order.address  && { label: '📍 Address',  value: order.address },
    order.phone    && { label: '📞 Phone',    value: order.phone },
    order.product  && { label: '🛍️ Product',  value: order.product },
    order.amount   && { label: '💵 Amount',   value: formatNPR(order.amount) },
    order.source   && { label: '🤖 Source',   value: order.source === 'bot' ? 'Bot (chat)' : 'Manual' },
    order.note     && { label: '💬 Note',     value: order.note },
  ].filter(Boolean)

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <style>{`
        /* Desktop: 6-column grid row */
        .order-row-grid {
          display: grid;
          grid-template-columns: 90px 1fr 110px 90px 120px 110px;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.25rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .order-row-grid:hover { background: var(--color-bg-raised); }

        /* Mobile: card-style layout */
        @media (max-width: 700px) {
          .order-row-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 14px 16px;
          }
          .order-col-id { font-size: 11px; color: var(--color-text-muted); }
          .order-col-customer { width: 100%; }
          .order-col-amount { font-weight: 700; font-size: 15px; }
          .order-col-date { font-size: 12px; color: var(--color-text-muted); }
          .order-col-status { display: flex; gap: 8px; align-items: center; }
          .order-col-actions { width: 100%; display: flex; align-items: center; justify-content: space-between; }
          .order-col-actions select { flex: 1; margin-right: 8px; }
        }
      `}</style>

      {/* Main row */}
      <div
        className="order-row-grid"
        onClick={() => setExpanded(e => !e)}
        style={{ background: expanded ? 'var(--color-bg-raised)' : 'transparent' }}
      >
        {/* Order ID */}
        <span className="order-col-id" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: 12 }}>
          {order.orderId || order._id?.slice(-6)}
        </span>

        {/* Customer */}
        <div className="order-col-customer">
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{order.customer}</p>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12 }}>
            {order.phone}
            {order.address && <> · <span style={{ color: 'var(--color-brand)' }}>{order.address.length > 28 ? order.address.slice(0, 28) + '…' : order.address}</span></>}
          </p>
        </div>

        {/* Amount */}
        <span className="order-col-amount" style={{ fontWeight: 700, fontSize: 14 }}>{formatNPR(order.amount)}</span>

        {/* Date */}
        <span className="order-col-date" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(order.date)}</span>

        {/* Status */}
        <div className="order-col-status">
          <StatusBadge status={order.status} />
          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--color-text-muted)' }}>{meta.hint}</p>
        </div>

        {/* Actions */}
        <div className="order-col-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
          <select
            value={order.status}
            onChange={e => updateOrderStatus(order._id, e.target.value)}
            style={{
              background:   'var(--color-bg-base)',
              color:        'var(--color-text-primary)',
              border:       '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding:      '5px 8px',
              fontSize:     12,
              cursor:       'pointer',
              fontFamily:   'var(--font-body)',
            }}
          >
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.icon} {s}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', userSelect: 'none' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded customer details panel */}
      {expanded && (
        <div style={{
          background:    'var(--color-bg-raised)',
          borderTop:     '1px dashed var(--color-border)',
          padding:       '1rem 1.25rem 1.25rem',
          display:       'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap:           '0.75rem',
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Customer Details
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              {order.source === 'bot' ? '🤖 Placed via chat bot' : '✍️ Manually entered'}
            </span>
          </div>

          {details.map(({ label, value }) => (
            <div key={label} style={{
              background:   'var(--color-bg-base)',
              border:       '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding:      '0.6rem 0.85rem',
            }}>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{value}</p>
            </div>
          ))}

          {order.address && order.address.length > 28 && (
            <div style={{
              gridColumn:   '1 / -1',
              background:   'var(--color-bg-base)',
              border:       '1px solid var(--color-brand)',
              borderRadius: 'var(--radius-md)',
              padding:      '0.6rem 0.85rem',
            }}>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--color-brand)', marginBottom: 2, fontWeight: 700 }}>📍 Full Delivery Address</p>
              <p style={{ margin: 0, fontSize: 13 }}>{order.address}</p>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {ORDER_STATUSES.map((s, i) => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: order.status === s ? 700 : 400,
                    color: order.status === s ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: order.status === s ? 'color-mix(in srgb, var(--color-brand) 12%, transparent)' : 'transparent',
                    border: order.status === s ? '1px solid var(--color-brand)' : '1px solid transparent',
                  }}>
                    {STATUS_META[s].icon} {s}
                  </span>
                  {i < ORDER_STATUSES.length - 1 && <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>→</span>}
                </span>
              ))}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {STATUS_META[order.status]?.hint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
