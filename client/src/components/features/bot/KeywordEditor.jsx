import { useState, useEffect } from 'react'
import { useShop } from '@/context/ShopContext'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui'

// ── Suggested starter Q&A pairs sellers can one-click add ────────────────────
const SUGGESTIONS = [
  { trigger: 'return',    emoji: '↩️', label: 'Return policy',    reply: 'We accept returns within 7 days of delivery. Item must be unused and in original packaging. Contact us to initiate a return.' },
  { trigger: 'exchange',  emoji: '🔄', label: 'Exchange',         reply: 'Yes, we do exchanges! Contact us within 7 days with your order details and we\'ll sort it out.' },
  { trigger: 'cash',      emoji: '💵', label: 'Cash on delivery',  reply: 'Yes, we accept Cash on Delivery (COD) for all orders inside Kathmandu Valley. Payment is collected at your doorstep.' },
  { trigger: 'online',    emoji: '💳', label: 'Online payment',    reply: 'We accept eSewa, Khalti, and bank transfer. Send payment screenshot to our WhatsApp/Viber after placing order.' },
  { trigger: 'esewa',     emoji: '💚', label: 'eSewa',             reply: 'Yes! We accept eSewa payments. Our eSewa number is [your number]. Send the screenshot after payment.' },
  { trigger: 'khalti',    emoji: '💜', label: 'Khalti',            reply: 'Yes! We accept Khalti. Our Khalti ID is [your ID]. Send the screenshot to confirm your order.' },
  { trigger: 'discount',  emoji: '🏷️', label: 'Discount/offer',   reply: 'Follow us on social media to get notified about our latest discounts and seasonal offers! 🎉' },
  { trigger: 'wholesale', emoji: '📦', label: 'Bulk/wholesale',    reply: 'Yes, we offer wholesale pricing for bulk orders. Please contact us directly to discuss quantities and pricing.' },
  { trigger: 'custom',    emoji: '✏️', label: 'Custom order',      reply: 'We do accept custom orders! Please describe what you need and we\'ll get back to you with availability and pricing.' },
  { trigger: 'gift',      emoji: '🎁', label: 'Gift wrapping',     reply: 'Yes, we offer gift wrapping! Just mention it while placing your order and we\'ll pack it beautifully. 🎀' },
  { trigger: 'track',     emoji: '📍', label: 'Track order',       reply: 'To track your order, please share your order number or the phone number used. We\'ll update you with the current status.' },
  { trigger: 'cancel',    emoji: '❌', label: 'Cancel order',      reply: 'Orders can be cancelled before dispatch. Please contact us immediately with your order details and we\'ll process the cancellation.' },
  { trigger: 'quality',   emoji: '⭐', label: 'Product quality',   reply: 'All our products are carefully sourced and quality-checked before shipping. We stand behind everything we sell!' },
  { trigger: 'authentic', emoji: '✅', label: 'Authenticity',      reply: 'All our products are 100% authentic and genuine. We source directly from trusted suppliers and craftspeople.' },
  { trigger: 'open',      emoji: '🕐', label: 'Business hours',    reply: 'We\'re open Sunday–Friday, 10 AM to 7 PM. Orders placed after hours will be processed the next business day.' },
  { trigger: 'whatsapp',  emoji: '📱', label: 'WhatsApp/contact',  reply: 'You can reach us on WhatsApp/Viber at [your number]. We usually reply within 1–2 hours during business hours.' },
  { trigger: 'instagram', emoji: '📸', label: 'Instagram',         reply: 'Follow us on Instagram @[yourhandle] for new arrivals, behind-the-scenes, and exclusive offers!' },
  { trigger: 'facebook',  emoji: '👍', label: 'Facebook',          reply: 'Find us on Facebook at [your page name]. Send us a message there too — we reply to all DMs!' },
]

export function KeywordEditor({ onKeywordsChange }) {
  const { keywords, saveKeywords } = useShop()

  const [local,       setLocal]       = useState([])
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [newTrigger,  setNewTrigger]  = useState('')
  const [newReply,    setNewReply]    = useState('')
  const [addingNew,   setAddingNew]   = useState(false)
  const [editId,      setEditId]      = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [activeTab,   setActiveTab]   = useState('mine')   // 'mine' | 'suggest'
  const [searchQ,     setSearchQ]     = useState('')

  useEffect(() => { setLocal(keywords) }, [keywords])

  // notify parent (BotChat live preview) whenever local changes
  useEffect(() => { onKeywordsChange?.(local) }, [local])

  const existingTriggers = new Set(local.map(k => k.trigger?.toLowerCase()))

  // ── CRUD helpers ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const trigger = newTrigger.trim().toLowerCase()
    const reply   = newReply.trim()
    if (!trigger || !reply) return
    if (existingTriggers.has(trigger)) return alert(`"${trigger}" already exists.`)

    const updated = [...local, { trigger, reply, _id: `tmp_${Date.now()}` }]
    setLocal(updated)
    setNewTrigger('')
    setNewReply('')
    setAddingNew(false)
    await persist(updated)
  }

  const handleAddSuggestion = async (s) => {
    if (existingTriggers.has(s.trigger)) return
    const updated = [...local, { trigger: s.trigger, reply: s.reply, _id: `tmp_${Date.now()}` }]
    setLocal(updated)
    await persist(updated)
  }

  const handleEdit = (kw) => {
    setEditId(kw._id)
    setNewTrigger(kw.trigger)
    setNewReply(kw.reply)
  }

  const handleSaveEdit = async () => {
    const trigger = newTrigger.trim().toLowerCase()
    const reply   = newReply.trim()
    if (!trigger || !reply) return
    const updated = local.map(k => k._id === editId ? { ...k, trigger, reply } : k)
    setLocal(updated)
    setEditId(null)
    setNewTrigger('')
    setNewReply('')
    await persist(updated)
  }

  const handleDelete = async (id) => {
    const updated = local.filter(k => k._id !== id)
    setLocal(updated)
    setDeleteTarget(null)
    await persist(updated)
  }

  const persist = async (list) => {
    setSaving(true)
    try {
      await saveKeywords(list.map(k => ({ trigger: k.trigger, reply: k.reply })))
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
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
  const tab = (active) => ({
    padding: '6px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    borderRadius: 8, border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)',
    background: active ? 'var(--color-brand)' : 'var(--color-bg-base)',
    color: active ? '#fff' : 'var(--color-text-secondary)', transition: 'all 0.15s',
  })

  const filteredSuggestions = SUGGESTIONS.filter(s =>
    !existingTriggers.has(s.trigger) &&
    (s.label.toLowerCase().includes(searchQ.toLowerCase()) || s.trigger.includes(searchQ.toLowerCase()))
  )

  const cancelForm = () => {
    setAddingNew(false)
    setEditId(null)
    setNewTrigger('')
    setNewReply('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={tab(activeTab === 'mine')}    onClick={() => setActiveTab('mine')}>
          My Q&amp;As {local.length > 0 && <span style={{ opacity: 0.7 }}>({local.length})</span>}
        </button>
        <button style={tab(activeTab === 'suggest')} onClick={() => setActiveTab('suggest')}>
          ✨ Add from templates
        </button>
      </div>

      {/* ══════════════════ MY Q&As TAB ══════════════════════════════════ */}
      {activeTab === 'mine' && (
        <>
          {/* Existing keyword rows */}
          {local.length === 0 && !addingNew && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: 13, border: '1px dashed var(--color-border)', borderRadius: 10 }}>
              No Q&amp;As yet. Add your first one below or pick from templates.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {local.map(kw => (
              <div key={kw._id}>
                {editId === kw._id ? (
                  /* Edit mode */
                  <EditForm
                    trigger={newTrigger} setTrigger={setNewTrigger}
                    reply={newReply}     setReply={setNewReply}
                    onSave={handleSaveEdit} onCancel={cancelForm}
                    inp={inp} isEdit
                  />
                ) : (
                  /* View mode */
                  <div style={{
                    background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          background: 'rgba(249,115,22,0.12)', color: 'var(--color-brand)',
                          borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700,
                          fontFamily: 'var(--font-mono)', flexShrink: 0,
                        }}>
                          {kw.trigger}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>→ auto-reply</span>
                      </div>
                      <p style={{
                        margin: 0, fontSize: 12, color: 'var(--color-text-secondary)',
                        lineHeight: 1.5, whiteSpace: 'pre-wrap',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{kw.reply}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => handleEdit(kw)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                      <button onClick={() => setDeleteTarget(kw)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new form */}
          {addingNew && !editId && (
            <EditForm
              trigger={newTrigger} setTrigger={setNewTrigger}
              reply={newReply}     setReply={setNewReply}
              onSave={handleAdd} onCancel={cancelForm}
              inp={inp}
            />
          )}

          {/* Add button */}
          {!addingNew && !editId && (
            <button
              onClick={() => setAddingNew(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px dashed var(--color-border)', background: 'transparent',
                color: 'var(--color-brand)', fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
            >
              + Add New Q&amp;A
            </button>
          )}

          {/* Save status */}
          {saving && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Saving…</p>}
          {saved  && <p style={{ fontSize: 12, color: '#22C55E', margin: 0, fontWeight: 700 }}>✓ Saved!</p>}
        </>
      )}

      {/* ══════════════════ SUGGESTIONS TAB ══════════════════════════════ */}
      {activeTab === 'suggest' && (
        <>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search templates…"
            style={{ ...inp }}
          />

          {filteredSuggestions.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, padding: '1rem' }}>
              {existingTriggers.size >= SUGGESTIONS.length ? 'You\'ve added all available templates! 🎉' : 'No matches.'}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
            {filteredSuggestions.map(s => (
              <div key={s.trigger} style={{
                background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{s.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</span>
                    <span style={{
                      background: 'rgba(249,115,22,0.1)', color: 'var(--color-brand)',
                      borderRadius: 5, padding: '1px 7px', fontSize: 11, fontFamily: 'var(--font-mono)',
                    }}>{s.trigger}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{s.reply}</p>
                </div>
                <button
                  onClick={() => handleAddSuggestion(s)}
                  style={{
                    flexShrink: 0, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    borderRadius: 7, border: 'none', background: 'var(--color-brand)', color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                >+ Add</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Built-in system replies info ─────────────────────────────────── */}
      <details style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 14px' }}>
        <summary style={{ fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
          🤖 Built-in automatic replies
        </summary>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['price / rate / cost',      'Shows matching product prices'],
            ['stock / available / left',  'Shows stock quantities'],
            ['delivery / deliver / ship', 'Shows your delivery info'],
            ['product / item / list',     'Lists all your products'],
            ['order / buy / purchase',    'Starts the order flow'],
            ['hello / hi / namaste',      'Greeting response'],
          ].map(([trigger, desc]) => (
            <div key={trigger} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand)', flexShrink: 0, minWidth: 160 }}>{trigger}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </details>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?._id)}
        title="Delete Q&A"
        message={`Delete the "${deleteTarget?.trigger}" trigger? Customers won't get this auto-reply anymore.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

// ── Shared add/edit form ─────────────────────────────────────────────────────
function EditForm({ trigger, setTrigger, reply, setReply, onSave, onCancel, inp, isEdit }) {
  return (
    <div style={{
      background: 'var(--color-bg-raised)', border: '1.5px solid var(--color-brand)',
      borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--color-brand)' }}>
        {isEdit ? 'Edit Q&A' : 'New Q&A'}
      </p>

      <div>
        <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>
          Trigger word(s) — customer types this
        </label>
        <input
          value={trigger}
          onChange={e => setTrigger(e.target.value)}
          placeholder="e.g. return, refund, exchange"
          style={{ ...inp }}
          autoFocus
        />
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '3px 0 0' }}>
          Separate multiple triggers with commas: <code>return, refund</code>
        </p>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>
          Bot reply
        </label>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="What should the bot say when a customer asks this?"
          rows={3}
          style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onSave}
          disabled={!trigger.trim() || !reply.trim()}
          style={{
            padding: '7px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            borderRadius: 7, border: 'none', background: 'var(--color-brand)', color: '#fff',
            fontFamily: 'var(--font-body)', opacity: !trigger.trim() || !reply.trim() ? 0.5 : 1,
          }}
        >
          {isEdit ? 'Save Changes' : 'Add Q&A'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent',
            color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)',
          }}
        >Cancel</button>
      </div>
    </div>
  )
}
