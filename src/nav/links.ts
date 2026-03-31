import type { Role } from '../types'

export const NAV_LINKS: Record<
  Role,
  { to: string; label: string; end?: boolean }[]
> = {
  STUDENT: [
    { to: '/student', label: 'Overview', end: true },
    { to: '/student/courses', label: 'Courses' },
    { to: '/student/analytics', label: 'Analytics' },
  ],
  INSTRUCTOR: [
    { to: '/instructor', label: 'Overview', end: true },
    { to: '/instructor/courses', label: 'Courses' },
    { to: '/instructor/assignments', label: 'Assignments' },
    { to: '/instructor/activity', label: 'Activity' },
    { to: '/instructor/alerts', label: 'Alerts' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/system', label: 'System' },
  ],
}
