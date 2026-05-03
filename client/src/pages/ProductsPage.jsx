import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader, EmptyState } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/features/products/ProductCard'
import { ProductForm } from '@/components/features/products/ProductForm'

export default function ProductsPage() {
  const { products } = useShop()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')  // 'all' | 'live' | 'hidden'

  const filtered = products.filter(p => {
    if (filter === 'live')   return p.visible
    if (filter === 'hidden') return !p.visible
    return true
  })

  return (
    <PageLayout>
      <SectionHeader
        title={`Products (${products.length})`}
        action={
          <Button onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </Button>
        }
      />

      {showForm && <ProductForm onClose={() => setShowForm(false)} />}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[['all', 'All'], ['live', '● Live'], ['hidden', '○ Hidden']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', background: filter === val ? 'var(--color-brand)' : 'var(--color-bg-raised)', color: filter === val ? '#fff' : 'var(--color-text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <EmptyState icon="📦" title="No products found" desc={filter === 'all' ? 'Add your first product to get started.' : `No ${filter} products.`} />
      )}
    </PageLayout>
  )
}
