'use client'

import { cn } from '@doska/shared'

import { OUTCOME, OutcomeBar } from '@/components/stats/StatsBits'
import { useMeta, useTaskStats } from '@/hooks/queries'

/** The numbers the live log only hints at: totals, why targets were skipped,
 *  and which account carried the task. Sits above the log tail in the panel. */
export function TaskStatsBlock({ taskId }: { taskId: number }) {
  const { data: meta } = useMeta()
  const { data: stats } = useTaskStats(taskId)

  if (!stats) return null
  const total = stats.ok + stats.skipped + stats.failed
  if (total === 0) return null

  const errorLabel = (code: string) => meta?.error_code_labels?.[code] ?? code

  return (
    <div className="space-y-3 px-4 pb-1">
      <div className="space-y-1.5">
        <OutcomeBar value={stats} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className={OUTCOME.ok.text}>успех {stats.ok}</span>
          <span className={OUTCOME.skipped.text}>пропуск {stats.skipped}</span>
          <span className={OUTCOME.failed.text}>ошибка {stats.failed}</span>
        </div>
      </div>

      {stats.top_errors.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Причины</div>
          <div className="flex flex-col gap-1">
            {stats.top_errors.map((row) => (
              <div key={row.code} className="flex items-center justify-between text-xs">
                <span className="break-words pr-2">{errorLabel(row.code)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.by_account.length > 1 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">По аккаунтам</div>
          <div className="flex flex-col gap-1">
            {stats.by_account.map((row) => (
              <div
                key={row.account_id}
                className="flex items-center justify-between text-xs"
              >
                <span className="break-all pr-2">{row.label}</span>
                <span className="shrink-0 tabular-nums">
                  <span className={OUTCOME.ok.text}>{row.ok}</span>
                  <span className="text-muted-foreground"> · </span>
                  <span className={cn(row.skipped ? OUTCOME.skipped.text : 'text-muted-foreground')}>
                    {row.skipped}
                  </span>
                  <span className="text-muted-foreground"> · </span>
                  <span className={cn(row.failed ? OUTCOME.failed.text : 'text-muted-foreground')}>
                    {row.failed}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
