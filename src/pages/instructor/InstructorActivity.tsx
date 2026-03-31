import { useCallback, useEffect, useState } from 'react'
import * as instructorApi from '../../api/instructor'
import type { InactiveStudent } from '../../types'

export function InstructorActivity() {
  const [inactive, setInactive] = useState<InactiveStudent[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Inactive students
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Students with low or no recent activity. Use Alerts to notify them.
        </p>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Days inactive</th>
              </tr>
            </thead>
            <tbody>
              {inactive.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.lastActiveAt
                      ? new Date(s.lastActiveAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.daysInactive ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inactive.length === 0 && (
            <p className="py-8 text-center text-slate-500">No inactive students found.</p>
          )}
        </div>
      )}
    </div>
  )
}
