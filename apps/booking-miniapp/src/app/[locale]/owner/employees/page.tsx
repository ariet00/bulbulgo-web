'use client'

import { Badge, Button, Card, Skeleton } from '@doska/ui'
import { Copy, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { useCreateInvite } from '@/hooks/mutations'
import { useEmployees } from '@/hooks/queries'

export default function OwnerEmployees() {
  const { data, isLoading } = useEmployees()
  const invite = useCreateInvite()
  const [lastUrl, setLastUrl] = useState<string | null>(null)

  const onInvite = async () => {
    try {
      const res = await invite.mutateAsync()
      setLastUrl(res.url)
      try {
        await navigator.clipboard.writeText(res.url)
        toast.success('Ссылка скопирована')
      } catch {
        toast.success('Ссылка готова — скопируйте вручную')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-3">Сотрудники</h1>

      <Card className="p-3 mb-3 space-y-2">
        <Button onClick={onInvite} disabled={invite.isPending} className="w-full">
          <Plus className="size-4 mr-1" /> Пригласить сотрудника
        </Button>
        {lastUrl && (
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground">
              Передайте ссылку новому сотруднику — он откроет её в Telegram и автоматически войдёт в команду.
              Срок: 7 дней, одноразовая.
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[11px] font-mono break-all flex-1 bg-muted/30 rounded p-2">
                {lastUrl}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(lastUrl).then(() => toast.success('Скопировано'))
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {isLoading ? (
        <>
          <Skeleton className="h-14 w-full mb-2" />
          <Skeleton className="h-14 w-full" />
        </>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">Сотрудников пока нет.</Card>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((e) => (
            <Link
              key={e.user_id}
              href={e.is_owner ? '/owner' : `/owner/employees/${e.user_id}`}
            >
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {e.color && (
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ background: e.color }}
                      />
                    )}
                    <div>
                      <div className="font-medium">
                        {e.display_name}
                        {e.is_owner && <span className="ml-1 text-xs text-muted-foreground">(вы)</span>}
                      </div>
                      {e.position && (
                        <div className="text-xs text-muted-foreground">{e.position}</div>
                      )}
                    </div>
                  </div>
                  {e.is_owner ? (
                    <Badge variant="default">Владелец</Badge>
                  ) : e.status === 'active' ? (
                    <Badge variant="secondary">Сотрудник</Badge>
                  ) : (
                    <Badge variant="outline">{e.status}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
