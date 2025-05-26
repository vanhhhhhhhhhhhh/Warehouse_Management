export interface Auth {
  api_token?: string
}

export interface User {
  [key: string]: any
}

export interface AuthContextProps {
  auth: Auth | undefined
  saveAuth: (auth: Auth | undefined) => void
  currentUser: User | undefined
  setCurrentUser: (user: User | undefined) => void
  logout: () => void
}

export function useAuth(): AuthContextProps
export function AuthPage(): JSX.Element
export function Logout(): JSX.Element
declare module '../modules/auth' {
  export function Logout(): JSX.Element
  export function AuthPage(): JSX.Element
  export function useAuth(): {
    currentUser: any
  }
}
