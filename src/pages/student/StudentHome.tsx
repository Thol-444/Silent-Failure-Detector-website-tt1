import { Link } from 'react-router-dom'

export function StudentHome() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/student/courses"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <p className="text-sm font-medium text-indigo-600">Courses</p>
          <p className="mt-1 text-slate-600">Browse and enroll</p>
        </Link>
        <Link
          to="/student/analytics"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <p className="text-sm font-medium text-indigo-600">Analytics</p>
          <p className="mt-1 text-slate-600">Streaks & heatmap</p>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
          <p className="text-sm font-medium text-indigo-800">Tip</p>
          <p className="mt-1 text-sm text-slate-600">
            Submit assignments on consecutive days to grow your streak.
          </p>
        </div>
      </div>
    </div>
  )
}
