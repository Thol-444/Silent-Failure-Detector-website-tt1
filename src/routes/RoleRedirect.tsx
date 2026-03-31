import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />
    case 'INSTRUCTOR':
      return <Navigate to="/instructor" replace />
    case 'STUDENT':
      return <Navigate to="/student" replace />
    default:
      return <Navigate to="/login" replace />
  }
}
