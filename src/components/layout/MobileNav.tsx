import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { NAV_LINKS } from '../../nav/links'
import type { Role } from '../../types'

export function MobileNav({ role }: { role: Role }) {
  const links = NAV_LINKS[role]
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            clsx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600',
            )
          }
        >
          {l.label}
        </NavLink>
      ))}
    </div>
  )
}
