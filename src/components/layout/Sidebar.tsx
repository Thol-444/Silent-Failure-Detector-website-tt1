import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { NAV_LINKS } from '../../nav/links'
import type { Role } from '../../types'

export function Sidebar({ role }: { role: Role }) {
  const links = NAV_LINKS[role]

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white/90 backdrop-blur md:w-60">
      <div className="border-b border-slate-100 px-4 py-5">
        <p className="font-display text-lg font-semibold tracking-tight text-slate-900">
          SFD LMS
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Silent Failure Detector</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              clsx(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
