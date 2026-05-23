import { useShop } from '@/context/ShopContext'
import { formatNPR } from '@/utils/formatters'

export function ProductCard({ product }) {
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
        <span style={{ fontSize: 40 }}>{product.image}</span>
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

      <button
        onClick={() => deleteProduct(product._id)}
        style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)', padding: '5px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', marginTop: 4 }}
      >
        Remove
      </button>
    </div>
  )
}
