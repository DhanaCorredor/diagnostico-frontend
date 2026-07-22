import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import Spinner from '../components/atoms/Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Spinner className="p-6" />
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }
  return children
}
