interface StreakStatsProps {
  current: number
  longest: number
  totalSubmissions: number
  activeDays: number
}

export function StreakStats({ current, longest, totalSubmissions, activeDays }: StreakStatsProps) {
  const cards = [
    { label: 'Current streak', value: current, suffix: 'days' },
    { label: 'Longest streak', value: longest, suffix: 'days' },
    { label: 'Total submissions', value: totalSubmissions, suffix: '' },
    { label: 'Active days (30d)', value: activeDays, suffix: '' },
  ]

  return (
    <div>
      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {c.label}
            </p>
            <p className="mt-0.5 font-display text-2xl font-semibold text-slate-900">
              {c.value}
              {c.suffix ? (
                <span className="ml-1 text-base font-normal text-slate-500">
                  {c.suffix}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}