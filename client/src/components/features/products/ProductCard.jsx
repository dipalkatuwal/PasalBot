import { useShop } from '@/context/ShopContext'
import { formatNPR } from '@/utils/formatters'

export function ProductCard({ product, onEdit }) {
  const { toggleProductVisibility, deleteProduct } = useShop()

  return (
    <div style={{
      background:    'var(--color-bg-raised)',
      border:        `1px solid ${product.visible ? 'var(--color-border)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius:  'var(--radius-lg)',
      padding:       '1.25rem',
      opacity:       product.visible ? 1 : 0.65,
      transition:    'opacity 0.2s, border-color 0.2s',
      display:       'flex',
      flexDirection: 'column',
      gap:           '0.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Product image or emoji */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--color-border)' }}
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
          />
        ) : null}
        <span style={{ fontSize: 40, display: product.imageUrl ? 'none' : 'block' }}>{product.image}</span>
        <button
          onClick={() => toggleProductVisibility(product._id)}
          style={{
            background:  product.visible ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color:       product.visible ? '#22C55E' : '#EF4444',
            border:      'none',
            borderRadius:'var(--radius-full)',
            padding:     '4px 12px',
            cursor:      'pointer',
            fontSize:    12,
            fontWeight:  700,
            fontFamily:  'var(--font-body)',
          }}
        >
          {product.visible ? '● Live' : '○ Hidden'}
        </button>
      </div>

      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{product.name}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12, margin: 0 }}>{product.category}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>
          {formatNPR(product.price)}
        </span>
        <span style={{ fontSize: 13, color: product.stock <= 5 ? '#EF4444' : 'var(--color-text-muted)' }}>
          {product.stock} in stock
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
        <button
          onClick={() => onEdit(product)}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid var(--color-brand)',
            color: 'var(--color-brand)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => deleteProduct(product._id)}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
