import { FC, PropsWithChildren, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface PermissionGuardProps {
  children: ReactNode
  requiredPermissions: {
    module: string
    action: string
  }[]
}
interface LocalPermissionData {
  [key: string]: string[]
}
interface PermissionConditionalProps {
  requiredPermission: {
    module: string
    action: string
  }
}

const getPermissions = (): LocalPermissionData => {
  const storedPermissions = localStorage.getItem('permissions')
  return storedPermissions ? JSON.parse(storedPermissions) : {}
}

export const hasPermission = (requiredPermissions: { module: string, action: string }[]): boolean[] => {
  const userPermissions = getPermissions();
  return requiredPermissions.map(({ module, action }) => {
    const modulePermissions = userPermissions[module]
    if (!modulePermissions) return false
    return modulePermissions.includes(action)
  })
}

export const PermissionConditional: FC<PropsWithChildren<PermissionConditionalProps>> = ({ requiredPermission, children }) => {
  const [hasRequiredPermission] = hasPermission([requiredPermission]);
  return hasRequiredPermission ? <>{children}</> : null
}

const PermissionGuard: FC<PermissionGuardProps> = ({ children, requiredPermissions }) => {
  const userPermissions = getPermissions();

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