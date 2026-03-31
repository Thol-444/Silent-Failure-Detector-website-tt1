import { Link } from 'react-router-dom'

export function InstructorHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/instructor/courses"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
      >
        <p className="font-medium text-indigo-700">Courses</p>
        <p className="mt-1 text-sm text-slate-600">Create and manage</p>
      </Link>
      <Link
        to="/instructor/assignments"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
      >
        <p className="font-medium text-indigo-700">Assignments</p>
        <p className="mt-1 text-sm text-slate-600">Create new tasks</p>
      </Link>
      <Link
        to="/instructor/alerts"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200"
      >
        <p className="font-medium text-amber-800">Alerts</p>
        <p className="mt-1 text-sm text-slate-600">Inactive students</p>
      </Link>
    </div>
  )
}
