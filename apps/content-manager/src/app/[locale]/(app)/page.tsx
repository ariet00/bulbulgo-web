'use client'

import { useEffect } from 'react'

import { Skeleton } from '@doska/ui'
import { PLATFORM_LABELS, useContentAccounts } from '@doska/shared'
import { useRouter } from '@doska/i18n'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { AccountCard } from '@/components/accounts/AccountCard'
import { AccountsEmptyState } from '@/components/accounts/AccountsEmptyState'
import { AddAccountDialog } from '@/components/AddAccountDialog'

// `?<platform>_oauth=` is how the backend reports the result of a Meta OAuth
// round-trip (see backend routes/threads/oauth.py `_fail`).
const OAUTH_RESULT_PARAMS: Array<[string, string]> = [
  ['threads_oauth', PLATFORM_LABELS.threads],
  ['instagram_oauth', PLATFORM_LABELS.instagram],
  ['pages_oauth', PLATFORM_LABELS.pages],
]

function pluralAccounts(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} аккаунт`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} аккаунта`
  return `${n} аккаунтов`
}

export default function AccountsPage() {
  const { data: accounts, isLoading, refetch } = useContentAccounts()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    for (const [param, label] of OAUTH_RESULT_PARAMS) {
      const status = searchParams.get(param)
      if (!status) continue
      if (status === 'connected') {
        toast.success(`${label} подключён`)
        refetch()
      } else if (status === 'denied') {
        toast.error(`Подключение ${label} отменено`)
      } else {
        toast.error(`Не удалось подключить ${label}: ${status}`)
      }
      router.replace('/')
      return
    }
  }, [searchParams, router, refetch])

  const count = accounts?.length ?? 0

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Аккаунты
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Загружаем список'
              : count === 0
                ? 'Здесь появятся подключённые соцсети'
                : `Подключено: ${pluralAccounts(count)}`}
          </p>
        </div>
        {count > 0 && <AddAccountDialog />}
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <AccountsEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts!.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}
    </div>
  )
}
