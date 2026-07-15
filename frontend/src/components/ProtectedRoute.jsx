import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function homePathForRole(role) {
  if (role === 'admin') return '/admin'
  if (role === 'seller') return '/seller'
  if (role === 'buyer') return '/user'
  return '/'
}

export default function ProtectedRoute({ children, roles, loginPath = '/login' }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to={homePathForRole(user.role)}
        replace
        state={{ message: 'You do not have access to that page.' }}
      />
    )
  }

  return children
}
