import { useRef, useEffect, useState } from 'react'
import { useBot } from '@/hooks/useBot'

/**
 * Reusable bot chat window.
 * @param {{ compact?: boolean, accentColor?: string }} props
 */
export function BotChat({ compact = false, accentColor }) {
  const { messages, sendMessage, quickReplies } = useBot()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const accent = accentColor || 'var(--color-brand)'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  const height = compact ? 280 : 360

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: compact ? 420 : 520, background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-bg-base)', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${accent}, #EF4444)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛍️</div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>PasalBot Preview</p>
          <p style={{ margin: 0, color: '#22C55E', fontSize: 11 }}>● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth:     '82%',
              borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding:      '10px 14px',
              fontSize:     14,
              lineHeight:   1.5,
              background:   m.from === 'user' ? `linear-gradient(135deg, ${accent}, #EF4444)` : 'var(--color-bg-base)',
              color:        m.from === 'user' ? '#fff' : 'var(--color-text-primary)',
              border:       m.from === 'bot' ? '1px solid var(--color-border)' : 'none',
              whiteSpace:   'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ display: 'flex', gap: 6, padding: '0 0.75rem 0.5rem', flexWrap: 'wrap' }}>
        {quickReplies.map(q => (
          <button key={q} onClick={() => { sendMessage(q) }}
            style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: accent, borderRadius: 'var(--radius-full)', padding: '3px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Type price, stock, order…"
          style={{ flex: 1, background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '9px 14px', color: 'var(--color-text-primary)', fontSize: 14 }}
        />
        <button onClick={submit}
          style={{ background: `linear-gradient(135deg, ${accent}, #EF4444)`, color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', padding: '9px 16px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
          →
        </button>
      </div>
    </div>
  )
}
