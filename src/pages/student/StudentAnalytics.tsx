import { useCallback, useEffect, useMemo, useState } from 'react'
import * as studentApi from '../../api/student'
import { useAuth } from '../../context/AuthContext'
import { ActivityHeatmap } from '../../components/analytics/ActivityHeatmap'
import { StreakStats } from '../../components/analytics/StreakStats'
import { SubmissionsChart } from '../../components/charts/SubmissionsChart'
import type { Submission } from '../../types'
import {
  buildLast30DaysActivity,
  computeStreaks,
  submissionsPerDaySeries,
} from '../../utils/analytics'

export function StudentAnalytics() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [serverAnalytics, setServerAnalytics] = useState<{
    currentStreak: number
    longestStreak: number
    totalSubmissions: number
    activeDays: number
    activity: number[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [s, a] = await Promise.all([
        studentApi.fetchSubmissions(user.id),
        studentApi.fetchLearningAnalytics(user.id),
      ])
      setSubmissions(Array.isArray(s) ? s : [])
      setServerAnalytics(a)
    } catch {
      setSubmissions([])
      setServerAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const activities = useMemo(
    () => {
      const localActivities = buildLast30DaysActivity(submissions)
      if (!serverAnalytics) return localActivities
      return localActivities.map((day, idx) => {
        const count = serverAnalytics.activity[idx] ?? 0
        return { ...day, count, active: count > 0 }
      })
    },
    [serverAnalytics, submissions],
  )
  const streaks = useMemo(
    () =>
      serverAnalytics
        ? {
            current: serverAnalytics.currentStreak,
            longest: serverAnalytics.longestStreak,
            totalSubmissions: serverAnalytics.totalSubmissions,
            activeDays: serverAnalytics.activeDays,
          }
        : computeStreaks(activities),
    [activities, serverAnalytics],
  )
  const chartData = useMemo(
    () => submissionsPerDaySeries(activities),
    [activities],
  )

  if (loading) {
    return <p className="text-slate-500">Loading analytics…</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Learning analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Streaks and activity are derived from your submission timestamps (last 30 days).
        </p>
      </div>
      <StreakStats
        current={streaks.current}
        longest={streaks.longest}
        totalSubmissions={streaks.totalSubmissions}
        activeDays={streaks.activeDays}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityHeatmap days={activities} />
        <SubmissionsChart data={chartData} />
      </div>
    </div>
  )
}
