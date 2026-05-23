import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { Input } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'

const EMOJI_OPTIONS    = ['📦', '👜', '🍯', '🧣', '🪔', '🎨', '📓', '👒', '🧴', '🌿', '🍵', '🧁', '💄', '🎁', '⚡']
const INITIAL_FORM     = { name: '', price: '', stock: '', image: '📦', category: '' }

export function ProductForm({ onClose, onManageCategories }) {
  const { addProduct, categories } = useShop()

  // categories[0] is always the virtual "All" — skip for form
  const editableCategories = categories.filter(c => c._id !== 'all')

  const [form,         setForm]         = useState({ ...INITIAL_FORM, category: editableCategories[0]?.label || 'General' })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleCategoryChange = (e) => {
    const val = e.target.value
    if (val === '___MANAGE___') {
      onManageCategories?.()
      return
    }
    set('category', val)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Product name is required.')
    if (!form.price || isNaN(+form.price) || +form.price <= 0) return setError('Enter a valid price.')
    setError('')
    setSaving(true)
    try {
      await addProduct({ ...form, price: +form.price, stock: +form.stock || 0, visible: true })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '7px 10px', color: 'var(--color-text-primary)',
    fontSize: 13, fontFamily: 'var(--font-body)',
  }

  return (
    <div style={{
      background: 'var(--color-bg-raised)', border: '1px solid var(--color-brand)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem',
    }}>
      <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 1.25rem' }}>New Product</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <Input label="Product Name *" id="p-name"  value={form.name}  onChange={e => set('name',  e.target.value)} placeholder="e.g. Pashmina Shawl" />
        <Input label="Price (NPR) *"  id="p-price" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1200" type="number" min="0" />
        <Input label="Stock Qty"      id="p-stock" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="10"   type="number" min="0" />

        {/* Category selector */}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            Category
          </label>
          <select
            value={form.category}
            onChange={handleCategoryChange}
            style={inp}
          >
            {editableCategories.length > 0
              ? editableCategories.map(c => <option key={c._id} value={c.label}>{c.emoji} {c.label}</option>)
              : <option value="General">📦 General</option>
            }
            <hr />
            <option value="___MANAGE___">✨ New Category / Manage...</option>
          </select>
        </div>
      </div>

      {/* Emoji icon picker */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Icon</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => set('image', e)} style={{
              fontSize: 22, cursor: 'pointer',
              background: form.image === e ? 'var(--color-brand)' : 'var(--color-bg-base)',
              border: `1px solid ${form.image === e ? 'var(--color-brand)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)', width: 40, height: 40,
            }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}