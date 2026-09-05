'use client'

import { useState } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@doska/ui'
import { PLATFORM_LABELS, useContentAccounts } from '@doska/shared'

import { WeekPlanner } from '@/components/schedule/WeekPlanner'

const ALL = 'all'

export default function SchedulePage() {
  const { data: accounts } = useContentAccounts()
  const [accountId, setAccountId] = useState<string>(ALL)

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Планировщик</h1>
          <p className="text-sm text-muted-foreground">
            Посты уходят в соцсети сами в назначенное время. Время показано в вашем часовом поясе.
          </p>
        </div>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Аккаунт">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все аккаунты</SelectItem>
            {(accounts || []).map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {PLATFORM_LABELS[a.platform]}: @{a.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <WeekPlanner accountId={accountId === ALL ? undefined : Number(accountId)} />
    </div>
  )
}
