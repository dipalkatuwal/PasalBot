import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authGetMe, authLogin, authRegister, clearToken, setToken } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // checking existing session
  const [error, setError]     = useState('')

  // On mount: try to restore session from stored token
  useEffect(() => {
    authGetMe()
      .then(setUser)
      .catch(() => clearToken()) // token invalid/expired
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError('')
    const data = await authLogin(email, password)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email, password, shopName) => {
    setError('')
    const data = await authRegister(email, password, shopName)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
