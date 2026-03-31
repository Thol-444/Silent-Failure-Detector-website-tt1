import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStoredToken, setStoredToken } from '../api/client'
import * as authApi from '../api/auth'
import type { LoginPayload, RegisterPayload } from '../api/auth'
import type { AuthResponse, User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (p: LoginPayload) => Promise<AuthResponse>
  register: (p: RegisterPayload) => Promise<AuthResponse>
  logout: () => void
  setSession: (user: User, token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authApi.getStoredUser())
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [loading] = useState(false)

  const login = useCallback(async (p: LoginPayload) => {
    const res = await authApi.login(p)
    setUser(res.user)
    setToken(res.token)
    return res
  }, [])

  const register = useCallback(async (p: RegisterPayload) => {
    const res = await authApi.register(p)
    setUser(res.user)
    setToken(res.token)
    return res
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    setToken(null)
  }, [])

  const setSession = useCallback((u: User, t: string) => {
    setStoredToken(t)
    authApi.setStoredUser(u)
    setUser(u)
    setToken(t)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setSession,
    }),
    [user, token, loading, login, register, logout, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
