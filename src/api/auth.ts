import { isAxiosError } from 'axios'
import { api, setStoredToken } from './client'
import type { AuthResponse, Role, User } from '../types'

const USER_KEY = 'sfd_user'

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setStoredUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phoneNumber: string
  role: Role
}

export interface LoginPayload {
  email: string
  password: string
}

/** Decode JWT payload (no verification) for `sub` when API omits user id */
function idFromJwt(token: string): string | undefined {
  try {
    const part = token.split('.')[1]
    if (!part) return undefined
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    const p = JSON.parse(json) as { sub?: string; userId?: string; id?: string }
    return p.sub ?? p.userId ?? p.id
  } catch {
    return undefined
  }
}

function normalizeRole(value: unknown): Role {
  const s = String(value ?? '').toUpperCase()
  if (s === 'ADMIN' || s === 'INSTRUCTOR' || s === 'STUDENT') return s
  return 'STUDENT'
}

function mapUser(raw: Record<string, unknown>, token: string): User {
  const email = String(raw.email ?? '')
  const name = String(raw.name ?? '')
  const phoneNumber = raw.phoneNumber != null ? String(raw.phoneNumber) : undefined
  const role = normalizeRole(raw.role)
  let id = raw.id != null ? String(raw.id) : ''
  if (!id) id = idFromJwt(token) ?? email
  return { id, name, email, phoneNumber, role }
}

function isApiErrorPayload(data: Record<string, unknown>): boolean {
  const s = data.status
  if (typeof s === 'number' && (s === 401 || s === 403 || s === 404 || s >= 400)) {
    return true
  }
  return false
}

function getMessage(data: Record<string, unknown>): string {
  const m = data.message
  return typeof m === 'string' && m.trim() ? m : 'Authentication failed'
}

function normalizeAuth(data: Record<string, unknown>): AuthResponse {
  if (isApiErrorPayload(data)) {
    throw new Error(getMessage(data))
  }

  const token =
    (data.token as string) ??
    (data.accessToken as string) ??
    (data.access_token as string) ??
    (data.jwt as string) ??
    ''

  const rawUser = (data.user ?? data.account ?? data) as Record<string, unknown>
  if (!token) {
    throw new Error(getMessage(data))
  }

  if (typeof rawUser.email !== 'string' && typeof rawUser.name !== 'string') {
    throw new Error('Invalid auth response: missing user')
  }

  const user = mapUser(rawUser, token)
  return { token, user }
}

function persistSession(auth: AuthResponse) {
  setStoredToken(auth.token)
  setStoredUser(auth.user)
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<Record<string, unknown>>(
    '/auth/register',
    payload,
  )

  const hasJwt =
    typeof data.token === 'string' ||
    typeof data.accessToken === 'string' ||
    typeof data.access_token === 'string'

  if (hasJwt && !isApiErrorPayload(data)) {
    const auth = normalizeAuth(data)
    persistSession(auth)
    return auth
  }

  if (isApiErrorPayload(data)) {
    throw new Error(getMessage(data))
  }

  return login({ email: payload.email, password: payload.password })
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<Record<string, unknown>>('/auth/login', payload)
  const auth = normalizeAuth(data)
  persistSession(auth)
  return auth
}

export function logout() {
  setStoredToken(null)
  setStoredUser(null)
}

export function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const d = err.response?.data
    if (d && typeof d === 'object') {
      const o = d as Record<string, unknown>
      if (typeof o.message === 'string' && o.message.trim()) return o.message
      if (typeof o.error === 'string' && o.error.trim()) return o.error
    }
    if (typeof d === 'string' && d.trim()) return d
    if (err.response?.status === 500) {
      return 'Server error (500). The API crashed — check the Spring Boot console/logs for the stack trace.'
    }
  }
  if (err instanceof Error && err.message && err.message !== 'Invalid auth response') {
    return err.message
  }
  return fallback
}
