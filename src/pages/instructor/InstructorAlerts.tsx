import { useCallback, useEffect, useState } from 'react'
import * as instructorApi from '../../api/instructor'
import { SendAlertModal } from '../../components/alerts/SendAlertModal'
import type { InactiveStudent } from '../../types'

export function InstructorAlerts() {
  const [inactive, setInactive] = useState<InactiveStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await instructorApi.fetchInactiveStudents()
      setInactive(Array.isArray(data) ? data : [])
    } catch {
      setInactive([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === inactive.length) setSelected(new Set())
    else setSelected(new Set(inactive.map((s) => s.id)))
  }

  const defaultMessage =
    'We noticed you have been inactive in the LMS. Please log in and catch up on your coursework. Reply if you need help.'

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {toast}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Alert inactive students
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select students, preview the message, then send via email and/or SMS.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            {selected.size === inactive.length ? 'Clear' : 'Select all'}
          </button>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Send alert ({selected.size})
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Inactive</th>
              </tr>
            </thead>
            <tbody>
              {inactive.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.daysInactive != null ? `${s.daysInactive} days` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inactive.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No inactive students — nothing to alert.
            </p>
          )}
        </div>
      )}

      <SendAlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultMessage={defaultMessage}
        onSend={async ({ message, email, sms }) => {
          const channels: ('email' | 'sms')[] = []
          if (email) channels.push('email')
          if (sms) channels.push('sms')
          await instructorApi.sendAlert({
            studentIds: [...selected],
            message,
            channels,
          })
          setToast('Alert sent successfully.')
          setModalOpen(false)
          setSelected(new Set())
          window.setTimeout(() => setToast(''), 5000)
        }}
      />
    </div>
  )
}
