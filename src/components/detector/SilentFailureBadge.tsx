import { useEffect, useState } from 'react'
import clsx from 'clsx'
import * as systemApi from '../../api/system'
import type { SystemStatus } from '../../types'

export function SilentFailureBadge() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await systemApi.fetchSystemStatus()
        if (!cancelled) setStatus(s)
      } catch {
        if (!cancelled) {
          setErr(true)
          setStatus({
            status: 'SAFE',
            confidence: 0,
            message: 'Status unavailable',
          })
        }
      }
    })()
    const id = window.setInterval(async () => {
      try {
        const s = await systemApi.fetchSystemStatus()
        setStatus(s)
        setErr(false)
      } catch {
        setErr(true)
      }
    }, 45_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const safe = status?.status !== 'FAILURE'
  const raw = status?.confidence ?? 0
  const conf =
    raw > 0 && raw <= 1 ? Math.round(raw * 10000) / 100 : Math.round(raw * 100) / 100

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm',
        safe
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800',
        err && 'opacity-80',
      )}
      title={status?.message ?? 'Detector status'}
    >
      <span
        className={clsx(
          'h-2 w-2 rounded-full',
          safe ? 'bg-emerald-500' : 'bg-red-500 animate-pulse',
        )}
      />
      <span>{safe ? 'SAFE' : 'FAILURE'}</span>
      <span className="text-slate-500">·</span>
      <span className="font-normal text-slate-600">
        {conf}% confidence
      </span>
    </div>
  )
}
