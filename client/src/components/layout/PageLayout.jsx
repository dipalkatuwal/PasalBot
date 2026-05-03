export function PageLayout({ children, maxWidth = 1100 }) {
  return (
    <main style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {children}
    </main>
  )
}
