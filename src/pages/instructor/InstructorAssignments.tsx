import { useState } from 'react'
import { getApiErrorDetail } from '../../api/http'
import * as instructorApi from '../../api/instructor'

export function InstructorAssignments() {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    try {
      await instructorApi.createAssignment({ courseId, title, description })
      setMsg('Assignment created.')
      setTitle('')
      setDescription('')
      setCourseId('')
    } catch (err) {
      setMsg(getApiErrorDetail(err) || 'Failed to create assignment.')
    }
  }

  return (
    <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Create assignment
      </h2>
      <p className="mt-1 text-sm text-slate-500">POST /instructor/assignments</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Course ID</label>
          <input
            required
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </form>
    </div>
  )
}
