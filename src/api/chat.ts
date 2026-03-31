import { api } from './client'

function extractReply(data: Record<string, unknown>): string | null {
  const candidates = [
    data.reply,
    data.answer,
    data.response,
    data.message,
    data.content,
    data.text,
    data.output,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c
  }
  return null
}

export async function sendChatMessage(message: string): Promise<string> {
  const paths = [
    '/assistant/chat',
    '/api/assistant/chat',
    '/chat',
    '/api/chat',
    '/ai/chat',
    '/api/ai/chat',
  ]
  const bodies = [
    { message },
    { query: message },
    { prompt: message },
    { prompt: message, message },
  ]

  let last: unknown
  for (const path of paths) {
    for (const body of bodies) {
      try {
        const { data } = await api.post<Record<string, unknown>>(path, body)
        if (data && typeof data === 'object') {
          const r = extractReply(data)
          if (r) return r
        }
      } catch (e) {
        last = e
      }
    }
  }
  throw last instanceof Error ? last : new Error('Chat unavailable')
}
