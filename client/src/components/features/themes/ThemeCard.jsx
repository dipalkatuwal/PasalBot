import { useShop } from '@/context/ShopContext'

export function ThemeCard({ theme, isSelected, onSelect }) {
  const { colors } = theme

  return (
    <div
      onClick={onSelect}
      style={{
        cursor:     'pointer',
        border:     `2px solid ${isSelected ? colors.accent : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow:   'hidden',
        transition: 'transform 0.15s, border-color 0.15s',
        transform:  isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Mini shop preview */}
      <div style={{ background: colors.bg, padding: '1.1rem', minHeight: 180 }}>
        {/* Header */}
        <div style={{ background: colors.accent, borderRadius: 8, padding: '6px 10px', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14 }}>🏪</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Priya's Pasal</span>
        </div>
        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {['👜 Bag', '🍯 Honey', '🧣 Shawl', '🪔 Lamp'].map(item => (
            <div key={item} style={{ background: colors.card, borderRadius: 8, padding: '7px', border: `1px solid ${colors.accent}22` }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{item.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: colors.text, fontWeight: 600 }}>{item.split(' ')[1]}</div>
              <div style={{ fontSize: 10, color: colors.accent, fontWeight: 700 }}>NPR 1,200</div>
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <div style={{ background: 'var(--color-bg-raised)', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{theme.name}</p>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12 }}>{theme.desc}</p>
        </div>
        {isSelected && (
          <span style={{ background: colors.accent, color: '#fff', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
            Active
          </span>
        )}
      </div>
    </div>
  )
}
