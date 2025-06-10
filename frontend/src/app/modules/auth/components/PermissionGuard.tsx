import { FC, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface PermissionGuardProps {
  children: ReactNode
  requiredPermissions: {
    module: string
    action: string
  }[]
}

const PermissionGuard: FC<PermissionGuardProps> = ({ children, requiredPermissions }) => {
  // Get permissions from localStorage
  const storedPermissions = localStorage.getItem('permissions')
  const userPermissions = storedPermissions ? JSON.parse(storedPermissions) : {}

  // Check if user has all required permissions
  const hasPermission = requiredPermissions.every(({ module, action }) => {
    const modulePermissions = userPermissions[module]
    if (!modulePermissions) return false
    return modulePermissions.includes(action)
  })

  if (!hasPermission) {
    // Redirect to error page if user doesn't have required permissions
    return <Navigate to='/error/401' />
  }

  return <>{children}</>
}

export default PermissionGuard 