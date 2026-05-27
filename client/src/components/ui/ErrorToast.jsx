/**
 * Floating error toast — rendered by ShopProvider when a background
 * data load fails. Kept as its own component so ShopContext stays clean.
 */
export function ErrorToast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      background: '#fee2e2', color: '#991b1b',
      padding: '12px 20px', borderRadius: 8,
      border: '1px solid #f87171', fontSize: 14,
      fontWeight: 600, zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      ⚠️ {message}
    </div>
  )
}
