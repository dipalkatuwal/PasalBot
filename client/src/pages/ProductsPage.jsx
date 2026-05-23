import { useState, useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader, EmptyState, Card, Modal } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/features/products/ProductCard'
import { ProductForm } from '@/components/features/products/ProductForm'
import { CategoryBar } from '@/components/features/categories/CategoryBar'
import { CategoryManager } from '@/components/features/categories/CategoryManager'

export default function ProductsPage() {
  const { products, categories, loading } = useShop()
  const [showForm,    setShowForm]    = useState(false)
  const [showCatMgr,  setShowCatMgr]  = useState(false)
  const [visibility,  setVisibility]  = useState('all')  // 'all' | 'live' | 'hidden'
  const [activeCat,   setActiveCat]   = useState('all')

  const handleVisibilityChange = (val) => {
    setVisibility(val)
  }

  // Counts respect the visibility filter so badges stay accurate when combined
  const productCounts = useMemo(() => {
    const visibilityFiltered = products.filter(p => {
      if (visibility === 'live')   return p.visible
      if (visibility === 'hidden') return !p.visible
      return true
    })
    const counts = { all: visibilityFiltered.length }
    categories.forEach(c => {
      if (c._id === 'all') return
      counts[c._id] = visibilityFiltered.filter(p => p.category?.toLowerCase() === c.label.toLowerCase()).length
    })
    return counts
  }, [products, categories, visibility])

  const filtered = useMemo(() => {
    let list = products

    // visibility filter
    if (visibility === 'live')   list = list.filter(p => p.visible)
    if (visibility === 'hidden') list = list.filter(p => !p.visible)

    // category filter
    if (activeCat !== 'all') {
      const cat = categories.find(c => c._id === activeCat)
      if (cat) list = list.filter(p => p.category?.toLowerCase() === cat.label.toLowerCase())
    }

    return list
  }, [products, visibility, activeCat, categories])

  if (loading) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: 14 }}>
        Loading products…
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <SectionHeader
        title={`Products (${products.length})`}
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowCatMgr(true)}>
              ⚙️ Categories
            </Button>
            <Button onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : '+ Add Product'}
            </Button>
          </div>
        }
      />

      {showForm && (
        <ProductForm 
          onClose={() => setShowForm(false)} 
          onManageCategories={() => setShowCatMgr(true)}
        />
      )}

      <Modal 
        isOpen={showCatMgr} 
        onClose={() => setShowCatMgr(false)} 
        title="Manage Categories"
      >
        <CategoryManager />
      </Modal>

      {/* Visibility filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['all', 'All'], ['live', '● Live'], ['hidden', '○ Hidden']].map(([val, label]) => (
          <button key={val} onClick={() => handleVisibilityChange(val)} style={{
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            border: '1px solid var(--color-border)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
            background: visibility === val ? 'var(--color-brand)' : 'var(--color-bg-raised)',
            color: visibility === val ? '#fff' : 'var(--color-text-secondary)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Category filter bar */}
      {categories.length > 1 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <CategoryBar
            categories={categories}
            activeCategory={activeCat}
            onSelect={setActiveCat}
            productCounts={productCounts}
          />
        </div>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <EmptyState
          icon="📦"
          title="No products found"
          desc={
            visibility !== 'all' || activeCat !== 'all'
              ? 'Try clearing your filters.'
              : 'Add your first product to get started.'
          }
        />
      )}
     
    </PageLayout>
  )
}
