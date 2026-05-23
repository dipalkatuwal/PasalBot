import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { ConfirmModal } from '@/components/ui'

const EMOJI_QUICK = ['🏷️', '👜', '🍯', '👘', '🏠', '📦', '🎨', '📓', '🌿', '🍵', '💄', '🎁', '⚡', '🧴', '🪴']

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useShop()

  const [newLabel, setNewLabel]   = useState('')
  const [newEmoji, setNewEmoji]   = useState('🏷️')
  const [saving,   setSaving]     = useState(false)
  const [editId,   setEditId]     = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  
  // Custom confirm state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [catToDelete, setCatToDelete] = useState(null)

  // "all" is the virtual entry — never editable or deletable
  const locked     = categories.find(c => c._id === 'all')
  const editable   = categories.filter(c => c._id !== 'all')

  const handleAdd = async () => {
    const label = newLabel.trim()
    if (!label) return
    setSaving(true)
    try {
      await addCategory(label, newEmoji)
      setNewLabel('')
      setNewEmoji('🏷️')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (cat) => {
    setEditId(cat._id)
    setEditLabel(cat.label)
    setEditEmoji(cat.emoji)
  }

  const saveEdit = async () => {
    if (!editLabel.trim()) return
    await updateCategory(editId, { label: editLabel.trim(), emoji: editEmoji })
    setEditId(null)
  }

  const s = {
    row: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 12,
      background: 'var(--color-bg-base)',
      border: '1px solid var(--color-border)',
      marginBottom: 8,
      transition: 'all 0.2s ease',
    },
    input: {
      background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
      borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)',
      fontSize: 14, fontFamily: 'var(--font-body)',
      outline: 'none',
    },
    smallBtn: {
      background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', cursor: 'pointer',
      fontSize: 14, padding: '6px 10px', borderRadius: 8, lineHeight: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.1s ease',
    },
  }

  return (
    <div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: '1.25rem' }}>
        Categories help customers filter your products. The "All" category is built-in.
      </p>

      {/* ── Existing categories ──────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
        {/* Locked "All" row */}
        {locked && (
          <div style={{ ...s.row, opacity: 0.6, background: 'transparent', borderStyle: 'dashed' }}>
            <span style={{ fontSize: 20 }}>{locked.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{locked.label}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>System</span>
          </div>
        )}

        {editable.map(cat => (
          <div key={cat._id}>
            {editId === cat._id ? (
              /* Edit mode */
              <div style={{ ...s.row, border: '2px solid var(--color-brand)', background: 'var(--color-bg-raised)' }}>
                <input
                  value={editEmoji}
                  onChange={e => setEditEmoji(e.target.value)}
                  style={{ ...s.input, width: 48, textAlign: 'center', fontSize: 20 }}
                  maxLength={2}
                />
                <input
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null) }}
                  style={{ ...s.input, flex: 1 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={saveEdit} style={{ ...s.smallBtn, background: 'var(--color-brand)', color: '#fff', border: 'none', fontWeight: 700 }}>Save</button>
                  <button onClick={() => setEditId(null)} style={s.smallBtn}>Cancel</button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div style={{ ...s.row }} className="category-item">
                <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(cat)} style={s.smallBtn} title="Rename">✏️</button>
                  <button 
                    onClick={() => {
                      setCatToDelete(cat)
                      setConfirmOpen(true)
                    }} 
                    style={{ ...s.smallBtn, color: '#EF4444' }} 
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Add new ──────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: 14, fontWeight: 700 }}>Add New Category</h4>
        
        {/* Emoji quick-pick */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {EMOJI_QUICK.map(e => (
            <button key={e} onClick={() => setNewEmoji(e)} style={{
              ...s.smallBtn, fontSize: 20, padding: 0,
              width: 38, height: 38,
              background: newEmoji === e ? 'rgba(249,115,22,0.1)' : 'var(--color-bg-raised)',
              borderColor: newEmoji === e ? 'var(--color-brand)' : 'var(--color-border)',
            }}>{e}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            style={{ ...s.input, width: 52, textAlign: 'center', fontSize: 20 }}
            maxLength={2}
          />
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. New Arrivals"
            style={{ ...s.input, flex: 1 }}
          />
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || saving}
            style={{
              background: 'var(--color-brand)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '0 20px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', opacity: !newLabel.trim() || saving ? 0.5 : 1,
            }}
          >
            {saving ? '…' : 'Add'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteCategory(catToDelete?._id)}
        title="Delete Category"
        message={`Delete "${catToDelete?.label}"? Products in this category will become "General".`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}
