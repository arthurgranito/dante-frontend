import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('dante_token')
    const tenantId = localStorage.getItem('dante_tenant_id')
    const businessName = localStorage.getItem('dante_business_name')
    if (token && tenantId) {
      return { token, tenantId: Number(tenantId), businessName }
    }
    return null
  })

  const login = useCallback(({ token, tenantId, businessName }) => {
    localStorage.setItem('dante_token', token)
    localStorage.setItem('dante_tenant_id', String(tenantId))
    localStorage.setItem('dante_business_name', businessName || '')
    setUser({ token, tenantId, businessName })
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('dante_token')
    localStorage.removeItem('dante_tenant_id')
    localStorage.removeItem('dante_business_name')
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
