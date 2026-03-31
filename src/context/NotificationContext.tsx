import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStoredToken } from '../api/client'
import * as notificationsApi from '../api/notifications'
import type { AppNotification } from '../types'

interface NotificationContextValue {
  items: AppNotification[]
  unreadCount: number
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  sendMessage: (title: string, body: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([])

  const refresh = useCallback(async () => {
    try {
      const data = await notificationsApi.fetchNotifications()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    if (!getStoredToken()) return
    startTransition(() => {
      void refresh()
    })
    const id = window.setInterval(() => {
      startTransition(() => {
        void refresh()
      })
    }, 60_000)
    return () => window.clearInterval(id)
  }, [refresh])

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markNotificationRead(id)
    } catch {
      /* offline */
    }
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const sendMessage = useCallback(
    async (title: string, body: string) => {
      const t = title.trim()
      const b = body.trim()
      if (!t || !b) return
      try {
        await notificationsApi.sendNotificationMessage({ title: t, body: b })
      } catch {
        /* still show locally */
      }
      const local: AppNotification = {
        id: crypto.randomUUID(),
        title: t,
        body: b,
        read: false,
        createdAt: new Date().toISOString(),
      }
      setItems((prev) => [local, ...prev])
    },
    [],
  )

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  )

  const value = useMemo(
    () => ({ items, unreadCount, refresh, markRead, sendMessage }),
    [items, unreadCount, refresh, markRead, sendMessage],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook
export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
