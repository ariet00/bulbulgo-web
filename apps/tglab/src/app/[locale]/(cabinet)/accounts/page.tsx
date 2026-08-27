'use client'

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
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
import { Loader2, Plus, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'

import { AccountBulkBar } from '@/components/accounts/AccountBulkBar'
import { AccountImportDialog } from '@/components/accounts/AccountImportDialog'
import { AccountSheet } from '@/components/accounts/AccountSheet'
import { ProxySelect } from '@/components/common/ProxySelect'
import { StatusChip } from '@/components/common/StatusChip'
import { useCheckAccount, useUpdateAccount } from '@/hooks/mutations'
import { useAccounts, useMeta } from '@/hooks/queries'
import { TGLAB_PERMISSIONS } from '@/lib/constants'
import { useAuthStore, useHasPermission } from '@/store/useAuthStore'
import type { Account } from '@/types'

const ANY_STATUS = 'all'

export default function AccountsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(ANY_STATUS)
  const [selected, setSelected] = useState<number[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [opened, setOpened] = useState<Account | null>(null)

  const { data, isLoading } = useAccounts({
    q: q || undefined,
    status: status === ANY_STATUS ? undefined : status,
  })
  const { data: meta } = useMeta()
  const quotas = useAuthStore((s) => s.user?.quotas)
  const canManage = useHasPermission(TGLAB_PERMISSIONS.ACCOUNTS_MANAGE)
  const check = useCheckAccount()
  const update = useUpdateAccount()

  const items = data?.items ?? []
  const allSelected = items.length > 0 && selected.length === items.length

  const toggleAll = () => setSelected(allSelected ? [] : items.map((a) => a.id))
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // The sheet holds a snapshot, so re-read the row after a refetch.
  const openedAccount = opened ? items.find((a) => a.id === opened.id) ?? opened : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Аккаунты</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} из ${quotas?.max_accounts ?? '—'} по лимиту` : ' '}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setImportOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Телефон или @username"
          className="max-w-xs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_STATUS}>Все статусы</SelectItem>
            {(meta?.account_statuses ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canManage && selected.length > 0 && (
        <AccountBulkBar ids={selected} onDone={() => setSelected([])} />
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Аккаунт</TableHead>
                  <TableHead className="w-40">Статус</TableHead>
                  <TableHead className="w-44">Прокси</TableHead>
                  <TableHead className="w-40">Лимиты сегодня</TableHead>
                  <TableHead className="w-36">Проверен</TableHead>
                  <TableHead className="w-24 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((account) => (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer"
                    onClick={() => setOpened(account)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(account.id)}
                        onCheckedChange={() => toggleOne(account.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {account.username ? `@${account.username}` : account.phone || '—'}
                        {account.is_premium && (
                          <span className="ml-2 text-xs text-amber-600">premium</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {[account.profile.first_name, account.profile.last_name]
                          .filter(Boolean)
                          .join(' ') || `id ${account.id}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusChip value={account.status} options={meta?.account_statuses} />
                      {account.is_frozen && account.freezing_at && (
                        <div className="mt-1 text-xs text-sky-600 dark:text-sky-400">
                          отлёжка ещё{' '}
                          {formatDistanceToNow(new Date(account.freezing_at), { locale: ru })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm" onClick={(e) => e.stopPropagation()}>
                      {canManage ? (
                        <ProxySelect
                          value={account.proxy_id}
                          onChange={(proxyId) =>
                            update.mutate({ id: account.id, proxy_id: proxyId })
                          }
                          className="h-8"
                        />
                      ) : (
                        account.proxy_label ?? (
                          <span className="text-muted-foreground">без прокси</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {Object.entries(account.limits)
                        .map(([key, limit]) => `${key} ${account.usage_today[key] ?? 0}/${limit}`)
                        .join(' · ')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.checked_at
                        ? `${formatDistanceToNow(new Date(account.checked_at), {
                            locale: ru,
                          })} назад`
                        : '—'}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Проверить"
                          disabled={check.isPending}
                          onClick={() => check.mutate(account.id)}
                        >
                          {check.isPending && check.variables === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Аккаунтов нет. Импортируйте сессию — и запустите проверку, чтобы аккаунт
              представился.
            </p>
            {canManage && (
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AccountImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <AccountSheet
        account={openedAccount}
        onOpenChange={(open) => !open && setOpened(null)}
      />
    </div>
  )
}
