import { useState, useEffect } from 'react'
import { useShop } from '@/context/ShopContext'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/index.jsx'

export function KeywordEditor() {
  const { keywords, saveKeywords } = useShop()
  const [local, setLocal]     = useState(keywords)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => { setLocal(keywords) }, [keywords])

  const updateReply = (id, reply) =>
    setLocal(ks => ks.map(k => k.id === id ? { ...k, reply } : k))

  const handleSave = async () => {
    setSaving(true)
    await saveKeywords(local)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {local.map(kw => (
        <div key={kw.id} style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--color-brand)', borderRadius: 'var(--radius-sm)', padding: '3px 10px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {kw.trigger}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>→ auto-reply</span>
          </div>
          <Textarea
            rows={2}
            value={kw.reply}
            onChange={e => updateReply(kw.id, e.target.value)}
          />
        </div>
      ))}

      {/* Order flow info */}
      <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 0.75rem' }}>📋 Guided Order Flow</p>
        {[
          ['1', 'Customer types "order" or "buy"'],
          ['2', 'Bot asks: What\'s your name?'],
          ['3', 'Bot asks: Delivery address?'],
          ['4', 'Bot asks: Phone number?'],
          ['5', 'Order confirmed + COD info sent'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ background: 'var(--color-brand)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>{t}</p>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
        {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Keywords'}
      </Button>
    </div>
  )
}
