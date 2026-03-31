import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorDetail } from '../../api/http'
import * as studentApi from '../../api/student'
import type { Course, CourseContent } from '../../types'

export function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const courseId = id ?? ''

  const [course, setCourse] = useState<Course | null>(null)
  const [content, setContent] = useState<CourseContent>({
    modules: [],
    quizzes: [],
    assignments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [courses, courseContent] = await Promise.all([
          studentApi.fetchStudentCourses(),
          studentApi.fetchCourseContent(courseId),
        ])
        if (cancelled) return
        const found = (courses ?? []).find((c) => c.id === courseId)
        setCourse(found ?? null)
        setContent(courseContent)
        setActionMsg('')
      } catch (err) {
        if (cancelled) return
        setError(
          getApiErrorDetail(err) ||
            'Could not load course. Ensure the API is running at http://localhost:8080.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  async function startModule(moduleId: string) {
    if (!courseId || !moduleId) return
    setActionMsg('')
    try {
      await studentApi.startModule(moduleId, courseId)
      setActionMsg('Module started. Your analytics will update based on your progress.')
      const courseContent = await studentApi.fetchCourseContent(courseId)
      setContent(courseContent)
    } catch (err) {
      setActionMsg(getApiErrorDetail(err) || 'Could not start module.')
    }
  }

  if (!courseId) {
    return (
      <p className="text-sm text-slate-600">
        No course selected.{' '}
        <button
          type="button"
          onClick={() => navigate('/student/courses')}
          className="text-indigo-600 underline"
        >
          Back to courses
        </button>
        .
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/student/courses')}
        className="text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to courses
      </button>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-slate-500">Loading course…</p>
        ) : error ? (
          <p className="text-sm text-amber-800">{error}</p>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {course?.title ?? 'Course'}
            </h2>
            {course?.code && (
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {course.code}
              </p>
            )}
            {course?.description && (
              <p className="mt-3 text-sm text-slate-700">{course.description}</p>
            )}
            {actionMsg && (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {actionMsg}
              </p>
            )}
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Modules</h3>
          <p className="text-xs text-slate-500">
            Start modules to drive your learning analytics.
          </p>
          <div className="mt-2 space-y-2">
            {content.modules.length === 0 && (
              <p className="text-xs text-slate-500">No modules available.</p>
            )}
            {content.modules.map((m) => (
              <div
                key={m.id || m.title}
                className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-slate-600">{m.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void startModule(m.id)}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                  disabled={!!m.started}
                >
                  {m.started ? 'Started' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Quizzes</h3>
          <p className="text-xs text-slate-500">
            Complete quizzes as directed by your instructor.
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {content.quizzes.length === 0 && (
              <li className="text-xs text-slate-500">No quizzes available.</li>
            )}
            {content.quizzes.map((q) => (
              <li
                key={q.id || q.title}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="font-medium">{q.title}</p>
                {q.description && (
                  <p className="mt-0.5 text-xs text-slate-600">{q.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Assignments</h3>
          <p className="text-xs text-slate-500">
            Use the assignment IDs shown here when you submit.
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {content.assignments.length === 0 && (
              <li className="text-xs text-slate-500">No assignments available.</li>
            )}
            {content.assignments.map((a) => (
              <li
                key={a.id || a.title}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="font-medium">{a.title}</p>
                {a.description && (
                  <p className="mt-0.5 text-xs text-slate-600">{a.description}</p>
                )}
                {a.id && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Assignment ID: <span className="font-mono">{a.id}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

