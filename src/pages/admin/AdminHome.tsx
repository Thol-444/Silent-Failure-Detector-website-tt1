import { Link } from 'react-router-dom'

export function AdminHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        to="/admin/users"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200"
      >
        <p className="font-display font-semibold text-slate-900">User management</p>
        <p className="mt-2 text-sm text-slate-600">View and delete users</p>
      </Link>
      <Link
        to="/admin/system"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200"
      >
        <p className="font-display font-semibold text-slate-900">System monitor</p>
        <p className="mt-2 text-sm text-slate-600">Silent failure detector status</p>
      </Link>
    </div>
  )
}
