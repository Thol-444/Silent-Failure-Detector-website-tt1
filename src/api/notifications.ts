import { api } from './client'
import { getFirst } from './http'
import type { AppNotification } from '../types'

const LIST_PATHS = ['http://localhost:8080/notifications']

export async function fetchNotifications() {
  const raw = await getFirst<unknown>(LIST_PATHS)
  if (Array.isArray(raw)) return raw as AppNotification[]
  if (raw && typeof raw === 'object' && 'notifications' in raw) {
    const n = (raw as { notifications: unknown }).notifications
    if (Array.isArray(n)) return n as AppNotification[]
  }
  return []
}

export async function markNotificationRead(id: string) {
  const enc = encodeURIComponent(id)
  const paths = [
    `/notifications/${enc}/read`,
    `/api/notifications/${enc}/read`,
    `/notifications/${enc}`,
  ]
  let last: unknown
  for (const path of paths) {
    try {
      await api.patch(path)
      return
    } catch {
      try {
        await api.put(path)
        return
      } catch (e) {
        last = e
      }
    }
  }
  throw last
}

export interface SendMessagePayload {
  title: string
  body: string
}

export async function sendNotificationMessage(payload: SendMessagePayload) {
  const bodies = [
    payload,
    { subject: payload.title, message: payload.body },
    { title: payload.title, content: payload.body },
  ]
  const paths = [
    '/notifications/send',
    '/notifications',
    '/api/notifications/send',
    '/api/notifications',
    '/messages',
    '/api/messages',
  ]
  let last: unknown
  for (const path of paths) {
    for (const body of bodies) {
      try {
        const { data } = await api.post(path, body)
        return data
      } catch (e) {
        last = e
      }
    }
  }
  throw last
}
