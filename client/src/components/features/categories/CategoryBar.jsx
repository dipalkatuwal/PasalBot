/**
 * CategoryBar
 * Scrollable chip strip on mobile, wrapping row on desktop.
 * Shows product counts as badges when productCounts is supplied.
 */
export function CategoryBar({ categories = [], activeCategory = 'all', onSelect, productCounts = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        flexWrap: 'wrap',
        scrollbarWidth: 'none',
      }}
      role="tablist"
      aria-label="Product categories"
    >
      {categories.map(cat => {
        const isActive = cat._id === activeCategory
        const count    = productCounts[cat._id]

        return (
          <button
            key={cat._id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect?.(cat._id)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: `1px solid ${isActive ? 'var(--color-brand)' : 'var(--color-border)'}`,
              background: isActive ? 'var(--color-brand)' : 'var(--color-bg-raised)',
              color: isActive ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count !== undefined && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 9999,
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-overlay)',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
              }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
