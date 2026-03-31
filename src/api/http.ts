import { isAxiosError } from 'axios'
import { api } from './client'

export async function getFirst<T>(paths: string[]): Promise<T> {
  let last: unknown
  for (const url of paths) {
    try {
      const { data } = await api.get<T>(url)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

export async function postFirst<T>(
  paths: string[],
  body: unknown,
): Promise<T> {
  let last: unknown
  for (const url of paths) {
    try {
      const { data } = await api.post<T>(url, body)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

export async function postFirstWithBodies<T>(
  paths: string[],
  bodies: unknown[],
): Promise<T> {
  let last: unknown
  for (const url of paths) {
    for (const body of bodies) {
      try {
        const { data } = await api.post<T>(url, body)
        return data
      } catch (e) {
        last = e
      }
    }
  }
  throw last
}

export async function putFirst<T>(
  paths: string[],
  body: unknown,
): Promise<T> {
  let last: unknown
  for (const url of paths) {
    try {
      const { data } = await api.put<T>(url, body)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

export async function deleteFirst(paths: string[]): Promise<void> {
  let last: unknown
  for (const url of paths) {
    try {
      await api.delete(url)
      return
    } catch (e) {
      last = e
    }
  }
  throw last
}

export function getApiErrorDetail(err: unknown): string {
  if (isAxiosError(err)) {
    const d = err.response?.data
    if (d && typeof d === 'object' && 'message' in d) {
      const m = (d as { message?: string }).message
      if (typeof m === 'string' && m.trim()) return m
    }
    const st = err.response?.status
    if (st === 404) return 'Endpoint not found — check API path on the server.'
    if (st === 401 || st === 403) return 'Not authorized for this action.'
    if (st === 400) return 'Bad request — check required fields.'
  }
  return ''
}
