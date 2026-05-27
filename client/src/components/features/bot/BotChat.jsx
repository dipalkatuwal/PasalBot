import { useRef, useEffect, useState } from 'react'
import { useBot } from '@/hooks/useBot'

export function BotChat({ compact = false, accentColor, overrideKeywords = null }) {
  const { messages, sendMessage, quickReplies, cart } = useBot({}, overrideKeywords)
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

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // Format bot message text — bold *text* and line breaks
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*[^*]+\*)/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('*') && part.endsWith('*')
              ? <strong key={j}>{part.slice(1, -1)}</strong>
              : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: compact ? 440 : 580,
      background: 'var(--color-bg-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-base)', padding: '0.9rem 1.25rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${accent}, #EF4444)`,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🛍️</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>PasalBot</p>
            <p style={{ margin: 0, color: '#22C55E', fontSize: 11 }}>● Online — replies instantly</p>
          </div>
        </div>
        {/* Cart badge */}
        {cartCount > 0 && (
          <button
            onClick={() => sendMessage('cart')}
            style={{
              background: `linear-gradient(135deg, ${accent}, #EF4444)`,
              color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
              padding: '5px 12px', cursor: 'pointer', fontWeight: 700,
              fontFamily: 'var(--font-body)', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            🛒 {cartCount} item{cartCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.from === 'bot' && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${accent}, #EF4444)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, marginRight: 6, marginTop: 2, alignSelf: 'flex-start',
              }}>🤖</div>
            )}
            <div style={{
              maxWidth:     '78%',
              borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding:      '10px 14px',
              fontSize:     13,
              lineHeight:   1.65,
              background:   m.from === 'user'
                ? `linear-gradient(135deg, ${accent}, #EF4444)`
                : 'var(--color-bg-base)',
              color:        m.from === 'user' ? '#fff' : 'var(--color-text-primary)',
              border:       m.from === 'bot' ? '1px solid var(--color-border)' : 'none',
              whiteSpace:   'pre-wrap',
            }}>
              {m.from === 'bot' ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 0.75rem 0.5rem', flexWrap: 'wrap' }}>
          {quickReplies.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                background: 'var(--color-bg-base)', border: `1px solid ${accent}55`,
                color: accent, borderRadius: 'var(--radius-full)',
                padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600,
              }}
            >{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '0.75rem', borderTop: '1px solid var(--color-border)',
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Ask anything or type 'help'…"
          style={{
            flex: 1, background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '9px 14px',
            color: 'var(--color-text-primary)', fontSize: 13,
            fontFamily: 'var(--font-body)', outline: 'none',
          }}
        />
        <button
          onClick={submit}
          style={{
            background: `linear-gradient(135deg, ${accent}, #EF4444)`,
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '9px 18px', cursor: 'pointer',
            fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 15,
          }}
        >→</button>
      </div>
    </div>
  )
}
