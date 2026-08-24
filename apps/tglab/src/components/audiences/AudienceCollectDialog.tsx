'use client'

import {
  Button,
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
  Switch,
} from '@doska/ui'
import { useEffect, useState } from 'react'

import { ProjectSelect } from '@/components/common/ProjectSelect'
import { useCollectAudience } from '@/hooks/mutations'
import { useAccounts, useMeta } from '@/hooks/queries'

/** Modes that walk message history rather than a member list. */
const HISTORY_MODES = ['writers', 'channel_comments', 'channel_discussion']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AudienceCollectDialog({ open, onOpenChange }: Props) {
  const { data: meta } = useMeta()
  // Only a live account can read a chat — a dead one fails on the first call.
  const { data: accounts } = useAccounts({ status: 'active', size: 200 })
  const collect = useCollectAudience()

  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [mode, setMode] = useState('members')
  const [accountId, setAccountId] = useState<string>('')
  const [projectId, setProjectId] = useState<number | null>(null)
  const [limit, setLimit] = useState('10000')
  const [messagesLimit, setMessagesLimit] = useState('')
  const [sinceDays, setSinceDays] = useState('')
  const [excludeBots, setExcludeBots] = useState(true)
  const [excludeAdmins, setExcludeAdmins] = useState(true)
  const [lastSeen, setLastSeen] = useState('any')

  useEffect(() => {
    if (!open) return
    setName('')
    setSource('')
    setMode('members')
    setAccountId(accounts?.items[0] ? String(accounts.items[0].id) : '')
    setProjectId(null)
    setLimit('10000')
    setMessagesLimit('')
    setSinceDays('')
    setExcludeBots(true)
    setExcludeAdmins(true)
    setLastSeen('any')
  }, [open, accounts])

  const walksHistory = HISTORY_MODES.includes(mode)

  const submit = () =>
    collect.mutate(
      {
        name: name.trim(),
        source: source.trim(),
        mode,
        account_id: Number(accountId),
        project_id: projectId,
        limit: Number(limit) || 10000,
        messages_limit: messagesLimit ? Number(messagesLimit) : null,
        since_days: sinceDays ? Number(sinceDays) : null,
        exclude_bots: excludeBots,
        exclude_admins: excludeAdmins,
        last_seen: lastSeen,
      },
      { onSuccess: () => onOpenChange(false) },
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Собрать аудиторию</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название базы</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Группа или канал</Label>
            <Input
              id="source"
              placeholder="@chatname или https://t.me/chatname"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Что собираем</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.parse_modes ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              У канала нет списка участников — его аудиторию видно только по
              комментариям или по группе обсуждений.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Аккаунт-сборщик</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите аккаунт" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.items.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.username ? `@${account.username}` : account.phone || account.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Сколько собрать</Label>
              <Input
                id="limit"
                inputMode="numeric"
                value={limit}
                onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {walksHistory && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="messages">Сообщений просмотреть</Label>
                <Input
                  id="messages"
                  inputMode="numeric"
                  placeholder="без ограничения"
                  value={messagesLimit}
                  onChange={(e) => setMessagesLimit(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="since">…или за последние, дней</Label>
                <Input
                  id="since"
                  inputMode="numeric"
                  placeholder="без ограничения"
                  value={sinceDays}
                  onChange={(e) => setSinceDays(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Был в сети</Label>
            <Select value={lastSeen} onValueChange={setLastSeen}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.last_seen_filters ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="no-bots">Пропускать ботов</Label>
            <Switch id="no-bots" checked={excludeBots} onCheckedChange={setExcludeBots} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="no-admins">Пропускать админов</Label>
            <Switch
              id="no-admins"
              checked={excludeAdmins}
              onCheckedChange={setExcludeAdmins}
            />
          </div>

          <div className="space-y-2">
            <Label>Проект</Label>
            <ProjectSelect value={projectId} onChange={setProjectId} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || !source.trim() || !accountId || collect.isPending}
          >
            Запустить сбор
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
