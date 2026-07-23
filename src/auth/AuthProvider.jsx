import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getToken, setToken, setUnauthorizedHandler } from '../api/client'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    async function restaurarSesion() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await api.get('/auth/me')
        setUser(me)
      } catch {
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restaurarSesion()
  }, [])

  async function login(email, password) {
    const { access_token } = await api.post(
      '/auth/login',
      { email, password },
      { auth: false },
    )
    setToken(access_token)
    const me = await api.get('/auth/me')
    setUser(me)
    return me
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
