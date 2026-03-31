import { useEffect, useState } from 'react'

export function SendAlertModal({
  open,
  onClose,
  defaultMessage,
  onSend,
}: {
  open: boolean
  onClose: () => void
  defaultMessage: string
  onSend: (opts: {
    message: string
    email: boolean
    sms: boolean
  }) => Promise<void>
}) {
  const [message, setMessage] = useState(defaultMessage)
  const [email, setEmail] = useState(true)
  const [sms, setSms] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage)
      setEmail(true)
      setSms(true)
    }
  }, [open, defaultMessage])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal
        aria-labelledby="alert-modal-title"
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 id="alert-modal-title" className="font-display text-lg font-semibold text-slate-900">
            Send alert
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Preview the message students will receive via email and/or SMS.
          </p>
        </div>
        <div className="space-y-4 px-6 py-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Email
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={sms}
                onChange={(e) => setSms(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              SMS
            </label>
          </div>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Preview</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || (!email && !sms) || !message.trim()}
            onClick={async () => {
              setLoading(true)
              try {
                await onSend({ message: message.trim(), email, sms })
                onClose()
              } finally {
                setLoading(false)
              }
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send alert'}
          </button>
        </div>
      </div>
    </div>
  )
}
