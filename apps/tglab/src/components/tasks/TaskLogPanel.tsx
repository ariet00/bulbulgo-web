'use client'

import { Badge, Button, Sheet, SheetContent, SheetHeader, SheetTitle } from '@doska/ui'
import { cn } from '@doska/shared'
import { Play, Square } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { StatusChip } from '@/components/common/StatusChip'
import { TaskStatsBlock } from '@/components/tasks/TaskStatsBlock'
import { useStartTask, useStopTask } from '@/hooks/mutations'
import { useMeta, useTaskLogs } from '@/hooks/queries'
import { useLiveStore } from '@/store/useLiveStore'
import type { Task, TaskLog } from '@/types'

/** Colour per log level — an error has to be findable in a long tail. */
const LEVEL_TONES: Record<string, string> = {
  info: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-destructive',
}

const RUNNING = ['running', 'scheduled']

/** Stable reference for "no lines yet".
 *
 * zustand 5 reads through `useSyncExternalStore`, which compares snapshots by
 * identity — a selector that builds a fresh `[]` on every call looks like an
 * endless stream of changes and re-renders until React gives up. So the empty
 * case has to be one and the same array. */
const NO_LINES: TaskLog[] = []

interface Props {
  task: Task | null
  onOpenChange: (open: boolean) => void
}

/** The task's live log: the tail comes over REST, new lines over the socket. */
export function TaskLogPanel({ task, onOpenChange }: Props) {
  const { data: meta } = useMeta()
  const { data: tail } = useTaskLogs(task?.id ?? null)
  // The selector returns only what the store already holds (or undefined) —
  // never a freshly built value.
  const lines = useLiveStore((s) => (task ? s.logs[task.id] : undefined)) ?? NO_LINES
  const primeLogs = useLiveStore((s) => s.primeLogs)
  const connected = useLiveStore((s) => s.connected)
  const start = useStartTask()
  const stop = useStopTask()
  const bottom = useRef<HTMLDivElement>(null)

  // Seed the panel once the tail arrives; from then on the socket appends.
  useEffect(() => {
    if (task && tail) primeLogs(task.id, tail.items)
  }, [task, tail, primeLogs])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines.length])

  if (!task) return null
  const isRunning = RUNNING.includes(task.status)

  return (
    <Sheet open={Boolean(task)} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2">
            {task.name}
            <StatusChip value={task.status} options={meta?.task_statuses} />
            {!connected && (
              <Badge variant="outline" title="Строки подтянутся при обновлении">
                нет связи
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-3 px-4 text-sm text-muted-foreground">
          <span>сегодня: {task.progress.done_today}</span>
          <span>всего: {task.progress.done_total}</span>
          <span>ошибок: {task.progress.failed_total}</span>
          {task.audience_name && <span>база: {task.audience_name}</span>}
          <span>аккаунтов: {task.account_ids.length}</span>
        </div>

        <div className="flex gap-2 px-4">
          {isRunning ? (
            <Button size="sm" variant="outline" onClick={() => stop.mutate(task.id)}>
              <Square className="mr-1 h-4 w-4" />
              Остановить
            </Button>
          ) : (
            <Button size="sm" onClick={() => start.mutate(task.id)}>
              <Play className="mr-1 h-4 w-4" />
              Запустить
            </Button>
          )}
        </div>

        <TaskStatsBlock taskId={task.id} />

        <div className="mt-2 flex-1 overflow-y-auto border-t px-4 py-3 font-mono text-xs">
          {lines.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Лог пуст — он наполнится, когда задача пойдёт.
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-2 py-0.5">
                <span className="shrink-0 text-muted-foreground/70">
                  {new Date(line.created_at).toLocaleTimeString('ru-RU')}
                </span>
                <span className={cn('break-words', LEVEL_TONES[line.level])}>
                  {line.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottom} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
