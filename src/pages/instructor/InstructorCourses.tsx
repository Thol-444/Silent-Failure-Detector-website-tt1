import { useCallback, useEffect, useState } from 'react'
import { getApiErrorDetail } from '../../api/http'
import * as instructorApi from '../../api/instructor'
import type { Course } from '../../types'

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [moduleTitles, setModuleTitles] = useState([''])
  const [quizTitles, setQuizTitles] = useState([''])
  const [assignmentTitles, setAssignmentTitles] = useState([''])
  const [editing, setEditing] = useState<Course | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const c = await instructorApi.fetchInstructorCourses()
      setCourses(Array.isArray(c) ? c : [])
    } catch (err) {
      setCourses([])
      setError(
        getApiErrorDetail(err) ||
          'Could not load courses. Check instructor API paths on the server.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setActionMsg('')
    try {
      const createdCourse = await instructorApi.createCourse({ title, description, code })
      const courseId = createdCourse.id
      if (courseId) {
        const modules = moduleTitles.map((t) => t.trim()).filter(Boolean)
        const quizzes = quizTitles.map((t) => t.trim()).filter(Boolean)
        const assignments = assignmentTitles.map((t) => t.trim()).filter(Boolean)
        await Promise.all([
          ...modules.map((moduleTitle) =>
            instructorApi.createModule({ courseId, title: moduleTitle }),
          ),
          ...quizzes.map((quizTitle) =>
            instructorApi.createQuiz({ courseId, title: quizTitle }),
          ),
          ...assignments.map((assignmentTitle) =>
            instructorApi.createAssignment({ courseId, title: assignmentTitle }),
          ),
        ])
      }
      setTitle('')
      setDescription('')
      setCode('')
      setModuleTitles([''])
      setQuizTitles([''])
      setAssignmentTitles([''])
      setActionMsg('Course and content created.')
      await load()
    } catch (err) {
      setActionMsg(getApiErrorDetail(err) || 'Create course failed.')
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setActionMsg('')
    try {
      await instructorApi.updateCourse(editing.id, {
        title: editing.title,
        description: editing.description,
        code: editing.code,
      })
      setEditing(null)
      setActionMsg('Course updated.')
      await load()
    } catch (err) {
      setActionMsg(getApiErrorDetail(err) || 'Update failed.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this course?')) return
    setActionMsg('')
    try {
      await instructorApi.deleteCourse(id)
      setActionMsg('Course deleted.')
      await load()
    } catch (err) {
      setActionMsg(getApiErrorDetail(err) || 'Delete failed.')
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      )}
      {actionMsg && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          {actionMsg}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          New course
        </h2>
        <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 grid gap-4 lg:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Modules (optional)
              </label>
              <div className="mt-1 space-y-2">
                {moduleTitles.map((moduleTitle, idx) => (
                  <input
                    key={`module-${idx}`}
                    value={moduleTitle}
                    onChange={(e) =>
                      setModuleTitles((prev) =>
                        prev.map((p, i) => (i === idx ? e.target.value : p)),
                      )
                    }
                    placeholder={`Module ${idx + 1}`}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setModuleTitles((prev) => [...prev, ''])}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add module
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Quizzes (optional)
              </label>
              <div className="mt-1 space-y-2">
                {quizTitles.map((quizTitle, idx) => (
                  <input
                    key={`quiz-${idx}`}
                    value={quizTitle}
                    onChange={(e) =>
                      setQuizTitles((prev) =>
                        prev.map((p, i) => (i === idx ? e.target.value : p)),
                      )
                    }
                    placeholder={`Quiz ${idx + 1}`}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setQuizTitles((prev) => [...prev, ''])}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add quiz
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Assignments (optional)
              </label>
              <div className="mt-1 space-y-2">
                {assignmentTitles.map((assignmentTitle, idx) => (
                  <input
                    key={`assignment-${idx}`}
                    value={assignmentTitle}
                    onChange={(e) =>
                      setAssignmentTitles((prev) =>
                        prev.map((p, i) => (i === idx ? e.target.value : p)),
                      )
                    }
                    placeholder={`Assignment ${idx + 1}`}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setAssignmentTitles((prev) => [...prev, ''])}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add assignment
                </button>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create course
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-900">Your courses</h2>
        {loading ? (
          <p className="mt-4 text-slate-500">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-slate-600">{c.code ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...c })}
                        className="mr-2 text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(c.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <p className="py-8 text-center text-slate-500">No courses yet.</p>
            )}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="font-display font-semibold text-slate-900">Edit course</h3>
            <div className="mt-4 space-y-3">
              <input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={editing.description ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={editing.code ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, code: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
