import { useCallback, useEffect, useRef, useState } from 'react'
import * as chatApi from '../../api/chat'
import { localLmsReply } from '../../utils/chatbotReplies'

type Msg = { id: string; role: 'user' | 'assistant'; text: string }

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I am your LMS assistant. Ask me anything about courses, grades, submissions, or streaks.',
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
    }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    try {
      const reply = await chatApi.sendChatMessage(text)
      const trimmed = reply?.trim()
      const finalText =
        trimmed && trimmed.length > 0 ? trimmed : localLmsReply(text)
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: finalText },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: localLmsReply(text),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  return (
    <>
      <button
        type="button"
        aria-label="Open assistant"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 md:bottom-6 md:right-6"
      >
        {open ? (
          <span className="text-xl leading-none">×</span>
        ) : (
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        )}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-28 md:right-6">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
            <p className="font-display text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-indigo-100">Student & instructor queries</p>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === 'user'
                    ? 'ml-6 rounded-lg rounded-br-sm bg-indigo-50 px-3 py-2 text-sm text-slate-800'
                    : 'mr-4 rounded-lg rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap'
                }
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-slate-500">Thinking…</p>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void send()}
                placeholder="Type a message…"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
