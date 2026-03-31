import clsx from 'clsx'
import type { DayActivity } from '../../utils/analytics'

export function ActivityHeatmap({ days }: { days: DayActivity[] }) {
  const weeks: DayActivity[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-display text-sm font-semibold text-slate-900">
        30-day activity
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Darker cells = more submissions that day
      </p>
      <div className="mt-4 flex flex-col gap-1.5">
        {weeks.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((d) => {
              const intensity =
                d.count === 0
                  ? 0
                  : d.count === 1
                    ? 1
                    : d.count < 4
                      ? 2
                      : 3
              return (
                <div
                  key={d.date}
                  title={`${d.label}: ${d.count} submission(s)`}
                  className={clsx(
                    'h-3.5 w-3.5 rounded-sm border border-slate-100 md:h-4 md:w-4',
                    intensity === 0 && 'bg-slate-100',
                    intensity === 1 && 'bg-emerald-200',
                    intensity === 2 && 'bg-emerald-400',
                    intensity === 3 && 'bg-emerald-600',
                  )}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={clsx(
                'h-3 w-3 rounded-sm',
                i === 0 && 'bg-slate-100',
                i === 1 && 'bg-emerald-200',
                i === 2 && 'bg-emerald-400',
                i === 3 && 'bg-emerald-600',
              )}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
