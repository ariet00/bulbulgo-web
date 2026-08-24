'use client'

import {
  Button,
  Card,
  CardContent,
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
import { Pencil, Plus, RefreshCw, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { StatusChip } from '@/components/common/StatusChip'
import { ProxyDialog } from '@/components/proxies/ProxyDialog'
import { useCheckProxy, useDeleteProxy } from '@/hooks/mutations'
import { useMeta, useProxies } from '@/hooks/queries'
import { TGLAB_PERMISSIONS } from '@/lib/constants'
import { labelOf } from '@/lib/labels'
import { useHasPermission } from '@/store/useAuthStore'
import type { Proxy } from '@/types'

export default function ProxiesPage() {
  const { data: proxies, isLoading } = useProxies()
  const { data: meta } = useMeta()
  const canManage = useHasPermission(TGLAB_PERMISSIONS.PROXIES_MANAGE)
  const check = useCheckProxy()
  const remove = useDeleteProxy()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Proxy | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (proxy: Proxy) => {
    setEditing(proxy)
    setDialogOpen(true)
  }
  const onDelete = (proxy: Proxy) => {
    const attached = proxy.accounts_count
      ? ` К нему привязано аккаунтов: ${proxy.accounts_count} — они останутся без прокси.`
      : ''
    if (confirm(`Удалить ${proxy.host}:${proxy.port}?${attached}`)) {
      remove.mutate(proxy.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Прокси</h1>
          <p className="text-sm text-muted-foreground">
            Через них работают аккаунты. IPv6 не поддерживается.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : proxies?.length ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Адрес</TableHead>
                  <TableHead className="w-28">Тип</TableHead>
                  <TableHead className="w-36">Статус</TableHead>
                  <TableHead className="w-40">Проверен</TableHead>
                  <TableHead className="w-28 text-right">Аккаунтов</TableHead>
                  <TableHead className="w-32 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proxies.map((proxy) => (
                  <TableRow key={proxy.id}>
                    <TableCell>
                      <div className="font-medium">
                        {proxy.host}:{proxy.port}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {proxy.name || (proxy.login ? `логин ${proxy.login}` : '—')}
                        {proxy.external_ip ? ` · выход ${proxy.external_ip}` : ''}
                      </div>
                    </TableCell>
                    <TableCell>{labelOf(meta?.proxy_types, proxy.type)}</TableCell>
                    <TableCell>
                      <StatusChip value={proxy.status} options={meta?.proxy_statuses} />
                      {proxy.last_error && (
                        <div className="mt-1 text-xs text-destructive line-clamp-1">
                          {proxy.last_error}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {proxy.checked_at
                        ? `${formatDistanceToNow(new Date(proxy.checked_at), {
                            locale: ru,
                          })} назад`
                        : '—'}
                      {proxy.latency_ms ? ` · ${proxy.latency_ms} мс` : ''}
                    </TableCell>
                    <TableCell className="text-right">{proxy.accounts_count}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Проверить"
                            disabled={check.isPending}
                            onClick={() => check.mutate(proxy.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Изменить"
                            onClick={() => openEdit(proxy)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Удалить"
                            onClick={() => onDelete(proxy)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
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
            <Shield className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Прокси пока нет. Без них аккаунты подключать нельзя.
            </p>
            {canManage && (
              <Button variant="outline" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ProxyDialog open={dialogOpen} onOpenChange={setDialogOpen} proxy={editing} />
    </div>
  )
}
