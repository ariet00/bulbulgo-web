'use client'

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@doska/ui'
import { Loader2, LogOut, RefreshCw, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

import { StatusChip } from '@/components/common/StatusChip'
import {
  useCheckAccount,
  useCheckAccountSpamBlock,
  useTerminateAccountSessions,
  useUpdateAccountProfile,
} from '@/hooks/mutations'
import { useAccountSessions, useMeta } from '@/hooks/queries'
import type { Account } from '@/types'

interface Props {
  account: Account | null
  onOpenChange: (open: boolean) => void
}

/** Everything about one account: profile, limits usage, other devices, @SpamBot. */
export function AccountSheet({ account, onOpenChange }: Props) {
  const { data: meta } = useMeta()
  const check = useCheckAccount()
  const spamCheck = useCheckAccountSpamBlock()
  const updateProfile = useUpdateAccountProfile()
  const terminate = useTerminateAccountSessions()
  // Listing devices is a live Telegram call — only while the panel is open.
  const sessions = useAccountSessions(account?.id ?? null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [about, setAbout] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!account) return
    setFirstName(account.profile.first_name ?? '')
    setLastName(account.profile.last_name ?? '')
    setAbout(account.profile.about ?? '')
    setUsername(account.username ?? '')
  }, [account])

  if (!account) return null

  const title = account.username
    ? `@${account.username}`
    : account.phone || `Аккаунт ${account.id}`

  return (
    <Sheet open={Boolean(account)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {title}
            <StatusChip value={account.status} options={meta?.account_statuses} />
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={check.isPending}
              onClick={() => check.mutate(account.id)}
            >
              {check.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Проверить
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={spamCheck.isPending}
              onClick={() => spamCheck.mutate(account.id)}
            >
              <ShieldAlert className="mr-1 h-4 w-4" />
              @SpamBot
            </Button>
          </div>

          {account.last_error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {account.last_error.message}
            </div>
          )}

          {account.spam_block?.text && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Ограничения</div>
              <p className="whitespace-pre-line rounded-md bg-muted p-3 text-xs">
                {account.spam_block.text}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-medium">Расход лимитов сегодня</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(account.limits).map(([key, limit]) => (
                <div key={key} className="flex justify-between rounded-md bg-muted px-3 py-2">
                  <span className="text-muted-foreground">{key}</span>
                  <span>
                    {account.usage_today[key] ?? 0} / {limit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Профиль в Telegram</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first-name">Имя</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Фамилия</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">О себе</Label>
              <Textarea
                id="about"
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              disabled={updateProfile.isPending}
              onClick={() =>
                updateProfile.mutate({
                  id: account.id,
                  first_name: firstName,
                  last_name: lastName,
                  about,
                  ...(username !== (account.username ?? '') ? { username } : {}),
                })
              }
            >
              Сохранить профиль
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Сессии</div>
              <Button
                size="sm"
                variant="ghost"
                disabled={terminate.isPending}
                onClick={() => {
                  if (confirm('Завершить все остальные сессии аккаунта?')) {
                    terminate.mutate(account.id)
                  }
                }}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Завершить чужие
              </Button>
            </div>
            {sessions.isLoading ? (
              <div className="text-sm text-muted-foreground">Загрузка…</div>
            ) : sessions.isError ? (
              <div className="text-sm text-muted-foreground">
                Не удалось получить — аккаунт не на связи.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.data?.map((session) => (
                  <div key={session.hash} className="rounded-md border p-3 text-xs">
                    <div className="font-medium">
                      {session.device_model || session.app_name || 'Устройство'}
                      {session.current ? ' · текущая' : ''}
                    </div>
                    <div className="text-muted-foreground">
                      {[session.platform, session.system_version, session.country, session.ip]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
