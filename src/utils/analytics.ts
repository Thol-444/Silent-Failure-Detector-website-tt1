import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns'
import type { Submission } from '../types'

function submissionDate(s: Submission): Date | null {
  const raw = s.submittedAt ?? s.createdAt
  if (!raw) return null
  try {
    return parseISO(raw)
  } catch {
    return null
  }
}

export function getActiveDates(submissions: Submission[]): Set<string> {
  const set = new Set<string>()
  for (const s of submissions) {
    const d = submissionDate(s)
    if (d) set.add(format(d, 'yyyy-MM-dd'))
  }
  return set
}

export interface DayActivity {
  date: string
  label: string
  count: number
  active: boolean
}

export function buildLast30DaysActivity(submissions: Submission[]): DayActivity[] {
  const end = new Date()
  const start = subDays(end, 29)
  const days = eachDayOfInterval({ start, end })
  const counts = new Map<string, number>()
  for (const s of submissions) {
    const d = submissionDate(s)
    if (!d) continue
    const key = format(d, 'yyyy-MM-dd')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return days.map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    const count = counts.get(key) ?? 0
    return {
      date: key,
      label: format(d, 'MMM d'),
      count,
      active: count > 0,
    }
  })
}

export function computeStreaks(activities: DayActivity[]): {
  current: number
  longest: number
  totalSubmissions: number
  activeDays: number
} {
  const totalSubmissions = activities.reduce((a, d) => a + d.count, 0)
  const activeDays = activities.filter((d) => d.active).length

  let longest = 0
  let run = 0
  for (const d of activities) {
    if (d.active) {
      run += 1
      longest = Math.max(longest, run)
    } else {
      run = 0
    }
  }

  let current = 0
  for (let i = activities.length - 1; i >= 0; i--) {
    if (activities[i].active) current += 1
    else break
  }

  return { current, longest, totalSubmissions, activeDays }
}

export function submissionsPerDaySeries(activities: DayActivity[]) {
  return activities.map((d) => ({
    date: d.label,
    submissions: d.count,
  }))
}
