import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorDetail } from '../../api/http'
import * as studentApi from '../../api/student'
import { useAuth } from '../../context/AuthContext'
import type { Course, Submission } from '../../types'

export function StudentCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [localEnrolledIds, setLocalEnrolledIds] = useState<Record<string, true>>({})
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [assignmentId, setAssignmentId] = useState('')
  const [content, setContent] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [c, s] = await Promise.all([
        studentApi.fetchStudentCourses(),
        studentApi.fetchSubmissions(user.id, user.email),
      ])
      setCourses(Array.isArray(c) ? c : [])
      setSubmissions(Array.isArray(s) ? s : [])
    } catch (err) {
      const detail = getApiErrorDetail(err)
      setError(
        detail
          ? `Could not load courses or submissions: ${detail}`
          : 'Could not load data. Ensure the API is running at http://localhost:8080 and you are signed in.',
      )
      setCourses([])
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  async function enroll(courseId: string) {
    setActionMsg('')
    try {
      await studentApi.enrollInCourse(courseId)
      setLocalEnrolledIds((prev) => ({ ...prev, [courseId]: true }))
      setActionMsg('Enrolled successfully.')
      await load()
    } catch (err) {
      setError(getApiErrorDetail(err) || 'Enroll failed.')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitMsg('')
    try {
      await studentApi.submitAssignment({
        assignmentId: assignmentId.trim(),
        content: content.trim() || undefined,
      })
      setAssignmentId('')
      setContent('')
      setSubmitMsg('Submission received.')
      await load()
    } catch {
      setSubmitMsg('Submit failed. Check assignment ID.')
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold text-slate-900">Courses</h2>
        {error && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </p>
        )}
        {actionMsg && (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {actionMsg}
          </p>
        )}
        {loading ? (
          <p className="mt-4 text-slate-500">Loading courses…</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              (() => {
                const isEnrolled = Boolean(c.enrolled || localEnrolledIds[c.id])
                return (
              <div
                key={c.id}
                className={`flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${isEnrolled ? 'cursor-pointer hover:border-indigo-300' : ''}`}
                onClick={() => {
                  if (isEnrolled && c.id) {
                    navigate(`/student/courses/${encodeURIComponent(c.id)}`)
                  }
                }}
                role={isEnrolled ? 'button' : undefined}
                tabIndex={isEnrolled ? 0 : -1}
                onKeyDown={(e) => {
                  if (!isEnrolled || !c.id) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/student/courses/${encodeURIComponent(c.id)}`)
                  }
                }}
              >
                <h3 className="font-medium text-slate-900">{c.title}</h3>
                {c.code && (
                  <p className="text-xs text-slate-500">{c.code}</p>
                )}
                {c.description && (
                  <p className="mt-2 flex-1 text-sm text-slate-600">{c.description}</p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    void enroll(c.id)
                  }}
                  disabled={isEnrolled}
                  className="mt-4 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isEnrolled ? 'Enrolled' : 'Enroll'}
                </button>
              </div>
                )
              })()
            ))}
            {courses.length === 0 && !error && (
              <p className="text-slate-500">No courses yet.</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Submit assignment
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          POST /student/submit — provide assignment ID and optional content.
        </p>
        <form onSubmit={submit} className="mt-4 max-w-lg space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Assignment ID</label>
            <input
              required
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. assign-uuid"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Content (optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Paste your answer or notes…"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Submit
          </button>
          {submitMsg && (
            <p className="text-sm text-emerald-600" role="status">
              {submitMsg}
            </p>
          )}
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Submission history
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Assignment</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.title ?? s.assignmentId ?? s.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(s.submittedAt ?? s.createdAt)
                      ? new Date(s.submittedAt ?? s.createdAt!).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-slate-500">No submissions yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
