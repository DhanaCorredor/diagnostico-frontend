// Guarda de rutas privadas.
//
// Envuelve las pantallas que requieren sesión. Reglas:
//   - Mientras comprobamos la sesión inicial -> mostramos "Cargando…".
//   - Sin sesión -> redirige a /login (y recuerda a dónde iba, para volver).
//   - Con sesión pero rol no permitido -> redirige al Panel (/).

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-6 text-gray-500">Cargando…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }
  return children
}
