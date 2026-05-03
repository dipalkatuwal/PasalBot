/* ─── Badge ──────────────────────────────────────────────────────────────── */
export function Badge({ children, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
export function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
export function StatCard({ label, value, icon, change, up }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 6px' }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, margin: 0 }}>{value}</p>
        </div>
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      {change && (
        <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: up ? '#22C55E' : '#EF4444' }}>
          {up ? '↑' : '↓'} {change}
        </p>
      )}
    </Card>
  )
}

/* ─── Input ──────────────────────────────────────────────────────────────── */
export function Input({ label, id, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          width: '100%',
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '9px 12px',
          color: 'var(--color-text-primary)',
          fontSize: 14,
        }}
        {...props}
      />
    </div>
  )
}

/* ─── Textarea ───────────────────────────────────────────────────────────── */
export function Textarea({ label, id, rows = 3, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        style={{
          width: '100%',
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '9px 12px',
          color: 'var(--color-text-primary)',
          fontSize: 14,
          resize: 'vertical',
        }}
        {...props}
      />
    </div>
  )
}

/* ─── Select ─────────────────────────────────────────────────────────────── */
export function Select({ label, id, children, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        id={id}
        style={{
          width: '100%',
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '9px 12px',
          color: 'var(--color-text-primary)',
          fontSize: 14,
          cursor: 'pointer',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

/* ─── SectionHeader ──────────────────────────────────────────────────────── */
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h2>
      {action}
    </div>
  )
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 44, marginBottom: '0.75rem' }}>{icon}</div>
      {title && <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{title}</p>}
      {desc  && <p style={{ fontSize: 14 }}>{desc}</p>}
    </div>
  )
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
import { STATUS_STYLES } from '@/data/mockData'

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || {}
  return (
    <Badge style={{ background: s.bg, color: s.text }}>
      {status}
    </Badge>
  )
}
