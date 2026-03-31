import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface Notification {
  id: number
  senderEmail: string
  recipientEmail: string
  title: string
  body: string
  readStatus: boolean
  timestamp: string
}

interface User {
  id?: string
  email: string
  name: string
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
}

export function NotificationBell() {
  const { user } = useAuth()
  const userEmail = user?.email ?? ''
  const userRole = user?.role
  const [items, setItems] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [recipientEmail, setRecipientEmail] = useState('')
  const [open, setOpen] = useState(false)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [sending, setSending] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter(n => !n.readStatus).length
  const API = 'http://localhost:8080'

  // Fetch notifications for current user
  useEffect(() => {
    if (!userEmail) return

    async function fetchNotifications() {
      try {
        const res = await fetch(`${API}/notifications?email=${encodeURIComponent(userEmail)}`)
        if (!res.ok) throw new Error(await res.text())
        const data: Notification[] = await res.json()
        setItems(data)
      } catch (err) {
        console.error("Fetch notifications error:", err)
      }
    }

    fetchNotifications()
  }, [userEmail])

  // Fetch users based on role
  useEffect(() => {
    if (!userEmail || !userRole || userRole === 'ADMIN') return

    async function fetchUsers() {
      try {
        // Instructor sees students, Student sees instructors
        const roleToFetch = userRole === 'STUDENT' ? 'INSTRUCTOR' : 'STUDENT'
        const urls = [
          `${API}/notifications/users?role=${roleToFetch}&currentUser=${encodeURIComponent(userEmail)}`,
          `${API}/notifications/users?role=${roleToFetch}`,
          `${API}/users?role=${roleToFetch}`,
        ]
        let loaded: User[] = []
        for (const url of urls) {
          const res = await fetch(url)
          if (!res.ok) continue
          const data: unknown = await res.json()
          if (Array.isArray(data)) {
            loaded = data as User[]
            break
          }
        }
        setUsers(
          loaded
            .map((u) => ({
              id: u.id,
              email: u.email,
              role: u.role,
              name: u.name || u.email?.split('@')[0] || 'User',
            }))
            .filter((u) => u.email && u.email !== userEmail),
        )
      } catch (err) {
        console.error("Fetch users error:", err)
      }
    }

    fetchUsers()
  }, [userEmail, userRole])

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Mark notification as read
  async function markRead(id: number) {
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error(await res.text())
      setItems(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n))
    } catch (err) {
      console.error("Mark read error:", err)
    }
  }

  // Send a new notification
  async function onSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientEmail || !composeTitle.trim() || !composeBody.trim()) {
      alert("Please fill all fields")
      return
    }

    setSending(true)
    try {
      const res = await fetch(`${API}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: userEmail,
          recipientEmail,
          title: composeTitle,
          body: composeBody
        })
      })

      if (!res.ok) throw new Error(await res.text())
      const newNotification: Notification = await res.json()
      setItems(prev => [newNotification, ...prev])
      setComposeTitle('')
      setComposeBody('')
      setRecipientEmail('')
    } catch (err) {
      console.error("Send notification error:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="relative rounded-lg border bg-white p-2"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded">{unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg">
          
          {/* Notifications List */}
          <ul className="max-h-60 overflow-y-auto">
            {items.length === 0 ? (
              <li className="p-2 text-center text-gray-500">No notifications</li>
            ) : (
              items.map(n => (
                <li key={n.id} onClick={() => markRead(n.id)} className="p-2 border-b cursor-pointer hover:bg-gray-100">
                  <b>{n.title}</b>
                  <p>{n.body}</p>
                  <small>{new Date(n.timestamp).toLocaleString()}</small>
                </li>
              ))
            )}
          </ul>

          {/* Compose Message */}
          <form onSubmit={onSendMessage} className="p-2">
            <select
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              className="w-full mb-2 border p-1"
            >
              <option value="">Select user</option>
              {users.map(u => (
                <option key={u.email} value={u.email}>
                  {u.name}
                </option>
              ))}
            </select>

            <input
              value={composeTitle}
              onChange={e => setComposeTitle(e.target.value)}
              placeholder="Title"
              className="w-full mb-2 border p-1"
            />
            <textarea
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              placeholder="Message"
              className="w-full mb-2 border p-1"
            />

            <button type="submit" disabled={sending} className="w-full bg-blue-500 text-white p-1">
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}