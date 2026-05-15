'use client'

import { Button, Card, Input, Label, Skeleton } from '@doska/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import { formatDateTime } from '@/lib/format'

export default function TimeOffPage() {
  const router = useRouter()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['booking', 'time-off'],
    queryFn: () => bookingApi.listTimeOff(),
  })

  const create = useMutation({
    mutationFn: bookingApi.createTimeOff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'time-off'] }),
  })
  const remove = useMutation({
    mutationFn: bookingApi.deleteTimeOff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'time-off'] }),
  })

  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [reason, setReason] = useState('')

  const submit = async () => {
    if (!startsAt || !endsAt) {
      toast.error('Укажите начало и конец')
      return
    }
    try {
      await create.mutateAsync({
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        reason: reason || undefined,
      })
      toast.success('Создано')
      setStartsAt('')
      setEndsAt('')
      setReason('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Удалить?')) return
    try {
      await remove.mutateAsync(id)
      toast.success('Удалено')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold mb-3">Исключения</h1>

      <Card className="p-3 mb-4 space-y-2">
        <div>
          <Label>Начало</Label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div>
          <Label>Конец</Label>
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
        <div>
          <Label>Причина (необязательно)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Отпуск" />
        </div>
        <Button onClick={submit} disabled={create.isPending} className="w-full">
          Добавить
        </Button>
      </Card>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">Нет исключений.</Card>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((t) => (
            <Card key={t.id} className="p-3 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{t.reason || 'Без причины'}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(t.starts_at)} — {formatDateTime(t.ends_at)}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onDelete(t.id)}>
                Удалить
              </Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
