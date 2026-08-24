'use client'

import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@doska/ui'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ListChecks, Play, Plus, Square, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { StatusChip } from '@/components/common/StatusChip'
import { TaskLogPanel } from '@/components/tasks/TaskLogPanel'
import { TaskWizard } from '@/components/tasks/TaskWizard'
import { useDeleteTask, useStartTask, useStopTask } from '@/hooks/mutations'
import { useMeta, useTasks } from '@/hooks/queries'
import { TGLAB_PERMISSIONS } from '@/lib/constants'
import { labelOf } from '@/lib/labels'
import { useHasPermission } from '@/store/useAuthStore'
import type { Task } from '@/types'

const ANY = 'all'
const RUNNING = ['running', 'scheduled']

export default function TasksPage() {
  const [taskType, setTaskType] = useState(ANY)
  const [status, setStatus] = useState(ANY)
  const [opened, setOpened] = useState<Task | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const { data: tasks, isLoading } = useTasks({
    task_type: taskType === ANY ? undefined : taskType,
    status: status === ANY ? undefined : status,
  })
  const { data: meta } = useMeta()
  const canManage = useHasPermission(TGLAB_PERMISSIONS.TASKS_MANAGE)
  const start = useStartTask()
  const stop = useStopTask()
  const remove = useDeleteTask()

  // The panel holds a snapshot — re-read the row after every refetch.
  const openedTask = opened ? tasks?.find((t) => t.id === opened.id) ?? opened : null

  const onDelete = (task: Task) => {
    if (confirm(`Удалить задачу «${task.name}» вместе с её логом?`)) {
      remove.mutate(task.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Задачи</h1>
          <p className="text-sm text-muted-foreground">
            Планировщик ведёт их тиками: каждую минуту задача делает порцию работы и
            отдаёт управление.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новая задача
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={taskType} onValueChange={setTaskType}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Инструмент" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Все инструменты</SelectItem>
            {(meta?.task_types ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Все статусы</SelectItem>
            {(meta?.task_statuses ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : tasks?.length ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Задача</TableHead>
                  <TableHead className="w-44">Инструмент</TableHead>
                  <TableHead className="w-36">Статус</TableHead>
                  <TableHead className="w-44">Сделано</TableHead>
                  <TableHead className="w-36">Последний тик</TableHead>
                  <TableHead className="w-32 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const isRunning = RUNNING.includes(task.status)
                  return (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer"
                      onClick={() => setOpened(task)}
                    >
                      <TableCell>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.audience_name ? `база: ${task.audience_name} · ` : ''}
                          аккаунтов: {task.account_ids.length}
                        </div>
                      </TableCell>
                      <TableCell>{labelOf(meta?.task_types, task.task_type)}</TableCell>
                      <TableCell>
                        <StatusChip value={task.status} options={meta?.task_statuses} />
                      </TableCell>
                      <TableCell className="text-sm">
                        сегодня {task.progress.done_today}
                        {task.daily_limit ? ` / ${task.daily_limit}` : ''}
                        <div className="text-xs text-muted-foreground">
                          всего {task.progress.done_total} · ошибок{' '}
                          {task.progress.failed_total}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {task.progress.last_tick_at
                          ? `${formatDistanceToNow(new Date(task.progress.last_tick_at), {
                              locale: ru,
                            })} назад`
                          : '—'}
                      </TableCell>
                      <TableCell
                        className="text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canManage && (
                          <>
                            {isRunning ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Остановить"
                                onClick={() => stop.mutate(task.id)}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Запустить"
                                onClick={() => start.mutate(task.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Удалить"
                              onClick={() => onDelete(task)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ListChecks className="h-8 w-8 text-muted-foreground" />
            <p className="max-w-md text-sm text-muted-foreground">
              Задач пока нет. Создайте первую — инвайтинг, рассылку в ЛС, рассылку по
              чатам или отметки в историях. Сборы аудитории тоже попадают сюда.
            </p>
          </CardContent>
        </Card>
      )}

      <TaskWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <TaskLogPanel
        task={openedTask}
        onOpenChange={(open) => !open && setOpened(null)}
      />
    </div>
  )
}
