'use client'

import { cn } from '@doska/shared'

import type { DayPoint } from '@/types'

/** Shared outcome palette — the same three colours everywhere a result splits
 *  into success / skip / error, matching the log-level tones. */
export const OUTCOME = {
  ok: { label: 'успех', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  skipped: { label: 'пропуск', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  failed: { label: 'ошибка', bar: 'bg-destructive', text: 'text-destructive' },
} as const

interface Outcome {
  ok: number
  failed: number
  skipped: number
}

/** One horizontal ok/skip/error bar — used for a task's totals and each
 *  action kind on the dashboard. Empty renders as a faint track. */
export function OutcomeBar({ value, className }: { value: Outcome; className?: string }) {
  const total = value.ok + value.skipped + value.failed
  const pct = (n: number) => (total ? `${(n / total) * 100}%` : '0%')
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      {total > 0 && (
        <div className="flex h-full w-full">
          <div className={OUTCOME.ok.bar} style={{ width: pct(value.ok) }} />
          <div className={OUTCOME.skipped.bar} style={{ width: pct(value.skipped) }} />
          <div className={OUTCOME.failed.bar} style={{ width: pct(value.failed) }} />
        </div>
      )}
    </div>
  )
}

/** Legend + counts for an outcome triple. */
export function OutcomeLegend({ value }: { value: Outcome }) {
  const items: [keyof typeof OUTCOME, number][] = [
    ['ok', value.ok],
    ['skipped', value.skipped],
    ['failed', value.failed],
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {items.map(([key, count]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', OUTCOME[key].bar)} />
          <span className="text-muted-foreground">{OUTCOME[key].label}</span>
          <span className="font-medium tabular-nums">{count}</span>
        </span>
      ))}
    </div>
  )
}

/** A compact stacked column chart of the daily activity. Pure divs so it works
 *  under the artifact/CSP sandbox and needs no chart dependency. */
export function ActivityBars({ series }: { series: DayPoint[] }) {
  const max = Math.max(1, ...series.map((d) => d.ok + d.skipped + d.failed))
  const totalAll = series.reduce((sum, d) => sum + d.ok + d.skipped + d.failed, 0)

  if (totalAll === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Пока нет действий за период.
      </div>
    )
  }

  return (
    <div className="flex items-end gap-1.5" style={{ height: 96 }}>
      {series.map((day) => {
        const total = day.ok + day.skipped + day.failed
        const h = (n: number) => `${(n / max) * 100}%`
        const label = new Date(`${day.date}T00:00:00`).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        })
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="flex w-full flex-col-reverse overflow-hidden rounded-sm bg-muted"
              style={{ height: '100%' }}
              title={`${label}: успех ${day.ok}, пропуск ${day.skipped}, ошибка ${day.failed}`}
            >
              {total > 0 && (
                <>
                  <div className={OUTCOME.ok.bar} style={{ height: h(day.ok) }} />
                  <div className={OUTCOME.skipped.bar} style={{ height: h(day.skipped) }} />
                  <div className={OUTCOME.failed.bar} style={{ height: h(day.failed) }} />
                </>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{label.slice(0, 5)}</span>
          </div>
        )
      })}
    </div>
  )
}
