'use client'

import React, { useEffect } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@doska/ui'
import {
  useContentAccounts,
  useDeleteContentAccount,
  type ContentAccount,
  type Platform,
} from '@doska/shared'
import { Link } from '@doska/i18n'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { AddAccountDialog } from '@/components/AddAccountDialog'

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  threads: 'Threads',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  pages: 'Facebook Page',
}

const PLATFORM_COLOR: Record<Platform, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  whatsapp: 'bg-green-100 text-green-700',
  threads: 'bg-slate-900 text-white',
  tiktok: 'bg-black text-white',
  telegram: 'bg-sky-100 text-sky-700',
  pages: 'bg-blue-100 text-blue-700',
}

export default function ContentManagerDashboard() {
  const { data: accounts, isLoading, refetch } = useContentAccounts()
  const deleteAccount = useDeleteContentAccount()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pick up the result of a Meta OAuth round-trip (Threads / Instagram).
  useEffect(() => {
    const checks: Array<[string, string]> = [
      ['threads_oauth', 'Threads'],
      ['instagram_oauth', 'Instagram'],
      ['pages_oauth', 'Facebook Pages'],
    ]
    for (const [param, label] of checks) {
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

  const handleDelete = async (account: ContentAccount) => {
    if (confirm(`Удалить аккаунт @${account.username}?`)) {
      await deleteAccount.mutateAsync({
        platform: account.platform,
        accountId: account.id,
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
          <p className="text-muted-foreground">
            Управление аккаунтами всех соцсетей в одном месте
          </p>
        </div>
        <AddAccountDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 space-y-4">
            <p className="text-muted-foreground">Ещё нет подключённых аккаунтов.</p>
            <AddAccountDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="border-2 hover:border-primary/50 transition-colors h-full flex flex-col"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <Badge className={`${PLATFORM_COLOR[acc.platform]} text-[10px] uppercase`}>
                    {PLATFORM_LABEL[acc.platform]}
                  </Badge>
                  <CardTitle className="text-xl pt-2">
                    {acc.display_name || `@${acc.username}`}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        acc.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {acc.is_active ? 'Активен' : 'Не активен'}
                  </CardDescription>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(acc)}
                  disabled={deleteAccount.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                <p className="text-sm text-muted-foreground">@{acc.username}</p>
                <Link href={`/${acc.id}`}>
                  <Button variant="outline" className="w-full">
                    Открыть
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
