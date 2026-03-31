import { NotificationBell } from '../notifications/NotificationBell'
import { SilentFailureBadge } from '../detector/SilentFailureBadge'
import { useAuth } from '../../context/AuthContext'

export function Header({ title }: { title: string }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
          {title}
        </h1>
        {user && (
          <p className="text-sm text-slate-500">
            {user.name} ·{' '}
            <span className="font-medium text-slate-700">{user.role}</span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <SilentFailureBadge />
        <NotificationBell />
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
