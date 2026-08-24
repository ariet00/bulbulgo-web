'use client'

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { cn } from '@doska/shared'
import { useEffect, useMemo, useState } from 'react'

import { ProjectSelect } from '@/components/common/ProjectSelect'
import { TaskParamsForm } from '@/components/tasks/TaskParamsForm'
import { useCreateTask } from '@/hooks/mutations'
import { useAccounts, useAudiences, useMeta } from '@/hooks/queries'

/** Tools that walk a list of chats rather than a list of people. */
const CHAT_TOOLS = ['sending_chats']
const STEPS = ['Параметры', 'База', 'Аккаунты'] as const

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Three steps, in the order the operator actually thinks: what to do → over
 *  whom → with which accounts. */
export function TaskWizard({ open, onOpenChange }: Props) {
  const { data: meta } = useMeta()
  const { data: audiences } = useAudiences()
  const { data: accounts } = useAccounts({ size: 200 })
  const create = useCreateTask()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [taskType, setTaskType] = useState('inviting')
  const [params, setParams] = useState<Record<string, any>>({})
  const [projectId, setProjectId] = useState<number | null>(null)
  const [audienceId, setAudienceId] = useState<number | null>(null)
  const [accountIds, setAccountIds] = useState<number[]>([])
  const [mainAccountId, setMainAccountId] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState('')
  const [delayFrom, setDelayFrom] = useState('30')
  const [delayTo, setDelayTo] = useState('90')
  const [autostartAt, setAutostartAt] = useState('')

  useEffect(() => {
    if (open) return
    setStep(0)
    setName('')
    setTaskType('inviting')
    setParams({})
    setProjectId(null)
    setAudienceId(null)
    setAccountIds([])
    setMainAccountId(null)
    setDailyLimit('')
    setDelayFrom('30')
    setDelayTo('90')
    setAutostartAt('')
  }, [open])

  // Tools that broadcast into chats need a chat base, the rest a user base.
  const wantedKind = CHAT_TOOLS.includes(taskType) ? 'chats' : 'users'
  const suitable = useMemo(
    () => (audiences ?? []).filter((audience) => audience.kind === wantedKind),
    [audiences, wantedKind],
  )
  const needsMain = taskType === 'inviting' && params.mode === 'admin'

  const toggleAccount = (id: number) =>
    setAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const submit = () =>
    create.mutate(
      {
        name: name.trim(),
        task_type: taskType,
        account_ids: accountIds,
        main_account_id: needsMain ? mainAccountId : null,
        audience_id: audienceId,
        project_id: projectId,
        daily_limit: dailyLimit ? Number(dailyLimit) : null,
        delay_from: Number(delayFrom) || 0,
        delay_to: Number(delayTo) || 0,
        autostart_at: autostartAt ? new Date(autostartAt).toISOString() : null,
        params,
      },
      { onSuccess: () => onOpenChange(false) },
    )

  const canContinue =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? Boolean(audienceId)
        : accountIds.length > 0 && (!needsMain || Boolean(mainAccountId))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 text-xs">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={cn(
                'rounded-full px-3 py-1',
                index === step
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {index + 1}. {label}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Название</Label>
              <Input
                id="task-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Инструмент</Label>
              <Select
                value={taskType}
                onValueChange={(next) => {
                  setTaskType(next)
                  // Settings belong to a tool — carrying them over makes no sense.
                  setParams({})
                  setAudienceId(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(meta?.task_types ?? [])
                    .filter((option) => option.value !== 'parsing')
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <TaskParamsForm taskType={taskType} value={params} onChange={setParams} />

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Лимит в сутки</Label>
                <Input
                  id="daily-limit"
                  inputMode="numeric"
                  placeholder="без лимита"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay-from">Пауза от, с</Label>
                <Input
                  id="delay-from"
                  inputMode="numeric"
                  value={delayFrom}
                  onChange={(e) => setDelayFrom(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay-to">до, с</Label>
                <Input
                  id="delay-to"
                  inputMode="numeric"
                  value={delayTo}
                  onChange={(e) => setDelayTo(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="autostart">Автозапуск</Label>
                <Input
                  id="autostart"
                  type="datetime-local"
                  value={autostartAt}
                  onChange={(e) => setAutostartAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Проект</Label>
                <ProjectSelect value={projectId} onChange={setProjectId} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {wantedKind === 'chats'
                ? 'Нужна база чатов — рассылка идёт по группам.'
                : 'Нужна база пользователей.'}
            </p>
            {suitable.length === 0 ? (
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Подходящих баз нет. Соберите аудиторию или загрузите свой список в
                разделе «Базы».
              </p>
            ) : (
              suitable.map((audience) => (
                <label
                  key={audience.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md border p-3',
                    audienceId === audience.id && 'border-primary bg-primary/5',
                  )}
                >
                  <span>
                    <span className="font-medium">{audience.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {audience.items_count} записей
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="audience"
                    checked={audienceId === audience.id}
                    onChange={() => setAudienceId(audience.id)}
                  />
                </label>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {needsMain && (
              <div className="space-y-2">
                <Label>Главный аккаунт (выдаёт права)</Label>
                <Select
                  value={mainAccountId ? String(mainAccountId) : ''}
                  onValueChange={(value) => setMainAccountId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите аккаунт" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountIds.map((id) => {
                      const account = accounts?.items.find((a) => a.id === id)
                      return (
                        <SelectItem key={id} value={String(id)}>
                          {account?.username ? `@${account.username}` : account?.phone ?? id}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Он уже должен быть админом чата с правом добавлять админов.
                </p>
              </div>
            )}

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {accounts?.items.map((account) => (
                <label
                  key={account.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-2 text-sm"
                >
                  <Checkbox
                    checked={accountIds.includes(account.id)}
                    onCheckedChange={() => toggleAccount(account.id)}
                  />
                  <span className="flex-1">
                    {account.username ? `@${account.username}` : account.phone || account.id}
                  </span>
                  <span className="text-xs text-muted-foreground">{account.status}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Назад
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              Дальше
            </Button>
          ) : (
            <Button disabled={!canContinue || create.isPending} onClick={submit}>
              Создать
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
