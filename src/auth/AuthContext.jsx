// Contexto de autenticación.
//
// Un "contexto" de React es una forma de compartir datos (aquí: el usuario y la
// sesión) con toda la app sin ir pasándolos manualmente por props. Cualquier
// componente llama a `useAuth()` y obtiene { user, login, logout, ... }.

import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // datos del usuario logueado (o null)
  const [loading, setLoading] = useState(true) // true mientras comprobamos la sesión inicial

  // Al abrir la app: si hay un token guardado, preguntamos al backend quién es
  // (GET /auth/me). Así la sesión se mantiene tras recargar la página.
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
        setToken(null) // el token no vale (caducado o inválido): lo descartamos
      } finally {
        setLoading(false)
      }
    }
    restaurarSesion()
  }, [])

  // Inicia sesión: pide el token, lo guarda y recupera los datos del usuario.
  async function login(email, password) {
    const { access_token } = await api.post(
      '/auth/login',
      { email, password },
      { auth: false }, // el login es público: no lleva token
    )
    setToken(access_token)
    const me = await api.get('/auth/me')
    setUser(me)
    return me
  }

  // Cierra sesión: borra el token y limpia el usuario.
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

// Hook cómodo para consumir el contexto desde cualquier componente.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
