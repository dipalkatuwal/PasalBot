import { useState, useRef } from 'react'
import { useShop } from '@/context/ShopContext'
import { Input } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'

// ── Cloudinary unsigned upload ────────────────────────────────────────────────
// Set these two vars in client/.env to enable device image uploads:
//   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
// Create a free account at cloudinary.com → Settings → Upload → Add upload preset
// Set the preset to "Unsigned" and optionally set a folder like "pasalbot"
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_ENABLED = Boolean(CLOUD_NAME && UPLOAD_PRESET)

async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url
}

// ── Constants ─────────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['📦', '👜', '🍯', '🧣', '🪔', '🎨', '📓', '👒', '🧴', '🌿', '🍵', '🧁', '💄', '🎁', '⚡']

const INITIAL_FORM = {
  name:        '',
  price:       '',
  stock:       '',
  image:       '📦',
  imageUrl:    '',
  description: '',
  categoryId:  '',
}

const DESC_SNIPPETS = [
  { label: '✦ Key Features',    text: '✦ Key Features\n• \n• \n• ' },
  { label: '📐 Dimensions',     text: '📐 Dimensions\nSize: \nWeight: ' },
  { label: "🎁 What's included", text: "🎁 What's Included\n• " },
  { label: '🧵 Material',       text: '🧵 Material\n' },
  { label: '🚚 Shipping',       text: '🚚 Shipping\nDispatched within  days.' },
]

export function ProductForm({ onClose, onManageCategories }) {
  const { addProduct, categories } = useShop()
  const editableCategories = categories.filter(c => c._id !== 'all')

  const [form,        setForm]        = useState({ ...INITIAL_FORM, categoryId: editableCategories[0]?._id || '' })
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [imgMode,     setImgMode]     = useState('upload')   // 'upload' | 'emoji'
  const [imgPreview,  setImgPreview]  = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [uploadPct,   setUploadPct]   = useState(0)
  const [descFocused, setDescFocused] = useState(false)
  const [dragOver,    setDragOver]    = useState(false)

  const fileInputRef = useRef(null)
  const descRef      = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file.')
    if (file.size > 10 * 1024 * 1024) return setError('Image must be under 10 MB.')
    setError('')

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setImgPreview(localUrl)

    if (!CLOUDINARY_ENABLED) {
      // No Cloudinary configured — keep preview as data URL, store empty imageUrl
      // (seller sees the emoji fallback on public shop until Cloudinary is set up)
      setError('⚠️ Image preview shown but not saved — add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to client/.env to enable uploads.')
      return
    }

    setUploading(true)
    setUploadPct(10)
    try {
      // Simulate progress ticks while uploading
      const tick = setInterval(() => setUploadPct(p => Math.min(p + 12, 85)), 400)
      const url = await uploadToCloudinary(file)
      clearInterval(tick)
      setUploadPct(100)
      set('imageUrl', url)
      setImgPreview(url)
    } catch {
      setImgPreview('')
      set('imageUrl', '')
      setError('Upload failed. Check your Cloudinary config or try again.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadPct(0), 800)
    }
  }

  const handleFileInput = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const clearImage = () => {
    setImgPreview('')
    set('imageUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Description snippets ────────────────────────────────────────────────────
  const insertSnippet = (text) => {
    const ta = descRef.current
    if (!ta) return
    const start  = ta.selectionStart
    const before = form.description.slice(0, start)
    const after  = form.description.slice(ta.selectionEnd)
    const sep    = before && !before.endsWith('\n') ? '\n\n' : ''
    const newVal = before + sep + text + '\n' + after
    set('description', newVal)
    setTimeout(() => {
      ta.focus()
      const pos = newVal.length - after.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  // ── Category ────────────────────────────────────────────────────────────────
  const handleCategory = (e) => {
    const val = e.target.value
    if (val === '___MANAGE___') { onManageCategories?.(); return }
    set('categoryId', val)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim())                                   return setError('Product name is required.')
    if (!form.price || isNaN(+form.price) || +form.price <= 0) return setError('Enter a valid price.')
    if (uploading)                                           return setError('Please wait for the image to finish uploading.')
    setError('')
    setSaving(true)

    // Resolve the selected category label so the server stores "Electronics"
    // not just the MongoDB _id (the Product model stores category as a string label)
    const selectedCat = editableCategories.find(c => c._id === form.categoryId)
    const categoryLabel = selectedCat ? selectedCat.label : 'General'

    try {
      await addProduct({
        name:        form.name.trim(),
        price:       +form.price,
        stock:       +form.stock || 0,
        image:       form.image,
        imageUrl:    form.imageUrl || '',
        description: form.description.trim(),
        category:    categoryLabel,
        visible:     true,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inp = {
    width: '100%', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '7px 10px', color: 'var(--color-text-primary)',
    fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
  }
  const tabBtn = (active) => ({
    padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
    borderRadius: 6, border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)',
    background: active ? 'var(--color-brand)' : 'var(--color-bg-base)',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{
      background: 'var(--color-bg-raised)', border: '1px solid var(--color-brand)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem',
    }}>
      <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 1.25rem' }}>New Product</h3>

      {/* ── Row 1: Name, Price, Stock, Category ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <Input label="Product Name *" id="p-name"  value={form.name}  onChange={e => set('name',  e.target.value)} placeholder="e.g. Pashmina Shawl" />
        <Input label="Price (NPR) *"  id="p-price" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1200" type="number" min="0" />
        <Input label="Stock Qty"      id="p-stock" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="10"   type="number" min="0" />

        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
          <select value={form.categoryId} onChange={handleCategory} style={inp}>
            {editableCategories.length > 0
              ? editableCategories.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.label}</option>)
              : <option value="">📦 General</option>
            }
            <hr />
            <option value="___MANAGE___">✨ New Category / Manage…</option>
          </select>
        </div>
      </div>

      {/* ── Row 2: Product Image ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Product Image</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={tabBtn(imgMode === 'upload')} onClick={() => setImgMode('upload')}>📷 Upload Photo</button>
            <button style={tabBtn(imgMode === 'emoji')}  onClick={() => setImgMode('emoji')}>😊 Emoji Icon</button>
          </div>
        </div>

        {imgMode === 'upload' ? (
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* Drop zone */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              style={{
                flex: 1, minHeight: 110, borderRadius: 10, cursor: uploading ? 'wait' : 'pointer',
                border: `2px dashed ${dragOver ? 'var(--color-brand)' : 'var(--color-border)'}`,
                background: dragOver ? 'rgba(249,115,22,0.05)' : 'var(--color-bg-base)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
              }}
            >
              {uploading ? (
                <>
                  <div style={{ fontSize: 24 }}>⏳</div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>Uploading… {uploadPct}%</p>
                  {/* Progress bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${uploadPct}%`, background: 'var(--color-brand)', transition: 'width 0.4s ease', borderRadius: 2 }} />
                </>
              ) : imgPreview ? (
                <>
                  <img src={imgPreview} alt="preview" style={{ maxHeight: 80, maxWidth: '90%', objectFit: 'contain', borderRadius: 6 }} onError={clearImage} />
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Click to change</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 28, opacity: 0.5 }}>🖼️</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>JPG, PNG, WebP — max 10 MB</p>
                </>
              )}
            </div>

            {/* Actions column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  borderRadius: 7, border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-base)', color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)', opacity: uploading ? 0.5 : 1,
                }}
              >
                Choose File
              </button>
              {imgPreview && (
                <button
                  onClick={clearImage}
                  style={{
                    padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.06)', color: '#EF4444',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          /* Emoji picker */
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => set('image', e)} style={{
                fontSize: 22, cursor: 'pointer',
                background: form.image === e ? 'var(--color-brand)' : 'var(--color-bg-base)',
                border: `1px solid ${form.image === e ? 'var(--color-brand)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)', width: 40, height: 40,
              }}>{e}</button>
            ))}
          </div>
        )}

        {/* Cloudinary not configured notice */}
        {imgMode === 'upload' && !CLOUDINARY_ENABLED && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 7, fontSize: 11, lineHeight: 1.5,
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
            color: 'var(--color-text-secondary)',
          }}>
            <strong>Setup required:</strong> Add <code>VITE_CLOUDINARY_CLOUD_NAME</code> and <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to <code>client/.env</code> to enable uploads.
            {' '}<a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)' }}>Create free account →</a>
          </div>
        )}
      </div>

      {/* ── Row 3: Description ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Product Description</label>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{form.description.length} chars</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {DESC_SNIPPETS.map(s => (
            <button
              key={s.label}
              onClick={() => insertSnippet(s.text)}
              style={{
                fontSize: 11, padding: '3px 10px', cursor: 'pointer',
                border: '1px solid var(--color-border)', borderRadius: 20,
                background: 'var(--color-bg-base)', color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <textarea
          ref={descRef}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          onFocus={() => setDescFocused(true)}
          onBlur={() => setDescFocused(false)}
          placeholder={"Describe your product — what it is, what makes it special, materials, size, care instructions…\n\nTip: Use the quick-insert buttons above to add structured sections."}
          rows={7}
          style={{
            ...inp, resize: 'vertical', lineHeight: 1.6,
            border: `1px solid ${descFocused ? 'var(--color-brand)' : 'var(--color-border)'}`,
            boxShadow: descFocused ? '0 0 0 3px rgba(249,115,22,0.1)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Shown on your public shop. Blank lines become paragraph breaks.
        </p>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Saving…' : uploading ? 'Uploading image…' : 'Save Product'}
        </Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
