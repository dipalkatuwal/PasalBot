import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--color-bg-base)',
        fontSize: 32,
      }}>
        🏪
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return children
}
