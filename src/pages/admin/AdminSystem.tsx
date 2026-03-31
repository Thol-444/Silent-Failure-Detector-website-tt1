import { startTransition, useCallback, useEffect, useState } from 'react'
import { getApiErrorDetail } from '../../api/http'
import * as systemApi from '../../api/system'
import type { SystemStatus } from '../../types'

function formatConfidence(c: number) {
  const v = c > 0 && c <= 1 ? c * 100 : c
  return `${Math.round(v * 100) / 100}%`
}

export function AdminSystem() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const s = await systemApi.fetchSystemStatus()
      setStatus(s)
    } catch (err) {
      setStatus(null)
      setLoadError(
        getApiErrorDetail(err) ||
          'No detector endpoint responded. Tried /system/status and similar paths.',
      )
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      void load()
    })
  }, [load])

  const safe = status?.status !== 'FAILURE'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          System monitor
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Retry
        </button>
      </div>
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          safe
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <p className="text-sm font-medium text-slate-600">Silent Failure Detector</p>
        <p className="mt-2 font-display text-3xl font-bold text-slate-900">
          {status?.status ?? 'UNKNOWN'}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Confidence:{' '}
          <span className="font-semibold">
            {status != null ? formatConfidence(status.confidence) : '—'}
          </span>
        </p>
        {status?.message && (
          <p className="mt-3 text-sm text-slate-600">{status.message}</p>
        )}
        {status?.lastChecked && (
          <p className="mt-2 text-xs text-slate-500">
            Last checked: {new Date(status.lastChecked).toLocaleString()}
          </p>
        )}
        {loadError && (
          <p className="mt-3 text-sm text-amber-800">{loadError}</p>
        )}
      </div>
    </div>
  )
}
