import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <p style={{ fontSize: 64, margin: '0 0 1rem' }}>🏪</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, margin: '0 0 0.5rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>This shop shelf is empty.</p>
      <Button onClick={() => navigate('/')}>← Back to Home</Button>
    </div>
  )
}
