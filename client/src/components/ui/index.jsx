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
import { useEffect } from 'react'
import { STATUS_STYLES } from '@/data/mockData'

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || {}
  return (
    <Badge style={{ background: s.bg, color: s.text }}>
      {status}
    </Badge>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, maxWidth = 500 }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--color-bg-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              fontSize: 20, color: 'var(--color-text-muted)',
              padding: 4, display: 'flex'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── ConfirmModal ───────────────────────────────────────────────────────── */
export function ConfirmModal({ isOpen, onClose, onConfirm, title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
  const brandColor = type === 'danger' ? '#EF4444' : 'var(--color-brand)'
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={400}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 1.5rem', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', 
              borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, 
              cursor: 'pointer', color: 'var(--color-text-primary)', flex: 1
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{ 
              background: brandColor, color: '#fff', border: 'none', 
              borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, 
              cursor: 'pointer', flex: 1, boxShadow: `0 4px 12px ${brandColor}33`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
export function Toast({ message, onClear, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClear, duration)
    return () => clearTimeout(timer)
  }, [message, onClear, duration])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)', 
      padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, 
      zIndex: 3000, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      border: '1px solid var(--color-border)',
      animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <span>✨</span> {message}
      <style>{`
        @keyframes toastIn {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
