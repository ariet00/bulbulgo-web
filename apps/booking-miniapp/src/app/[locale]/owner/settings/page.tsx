'use client'

import { Button, Card, Input, Label, Skeleton, Switch } from '@doska/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useUpdateSettings } from '@/hooks/mutations'
import { useCurrencies, useSettings } from '@/hooks/queries'
import { useBookingStore } from '@/store/useBookingStore'
import type { BookingSettings } from '@/types/booking'

const TIMEZONES = ['UTC', 'Asia/Almaty', 'Asia/Bishkek', 'Asia/Tashkent', 'Europe/Moscow']

export default function OwnerSettings() {
  const { data, isLoading } = useSettings()
  const { data: currencies } = useCurrencies()
  const update = useUpdateSettings()
  const { business } = useBookingStore()
  const isLegal = business?.company?.legal_form === 'legal'
  const [draft, setDraft] = useState<BookingSettings | null>(null)

  useEffect(() => {
    if (data) setDraft(data)
  }, [data])

  const setField = <K extends keyof BookingSettings>(key: K, value: BookingSettings[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const save = async () => {
    if (!draft) return
    try {
      await update.mutateAsync({
        timezone: draft.timezone,
        currency: draft.currency,
        min_lead_time_min: draft.min_lead_time_min,
        max_horizon_days: draft.max_horizon_days,
        cancellation_window_min: draft.cancellation_window_min,
        auto_confirm: draft.auto_confirm,
        reminder_24h_enabled: draft.reminder_24h_enabled,
        reminder_2h_enabled: draft.reminder_2h_enabled,
      })
      toast.success('Настройки сохранены')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  if (isLoading || !draft) {
    return (
      <main className="mx-auto max-w-md p-4">
        <Skeleton className="h-72 w-full" />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-3">Настройки</h1>

      <Card className="p-3 space-y-3 mb-3">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">Регион</h2>
        <div>
          <Label>Часовой пояс</Label>
          <select
            value={draft.timezone}
            onChange={(e) => setField('timezone', e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {TIMEZONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Валюта</Label>
          <select
            value={draft.currency}
            onChange={(e) => setField('currency', e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {(currencies ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
                {c.symbol ? ` (${c.symbol})` : ''}
              </option>
            ))}
            {!currencies?.some((c) => c.code === draft.currency) && (
              <option value={draft.currency}>{draft.currency}</option>
            )}
          </select>
        </div>
      </Card>

      <Card className="p-3 space-y-3 mb-3">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">Окна записи</h2>
        <div>
          <Label>Минимум до записи, мин</Label>
          <Input
            type="number"
            value={draft.min_lead_time_min}
            onChange={(e) => setField('min_lead_time_min', parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div>
          <Label>Горизонт, дней</Label>
          <Input
            type="number"
            value={draft.max_horizon_days}
            onChange={(e) => setField('max_horizon_days', parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div>
          <Label>Окно отмены клиентом, мин</Label>
          <Input
            type="number"
            value={draft.cancellation_window_min}
            onChange={(e) => setField('cancellation_window_min', parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Label>Автоподтверждение</Label>
          <Switch
            checked={draft.auto_confirm}
            onCheckedChange={(v) => setField('auto_confirm', v)}
          />
        </div>
      </Card>

      <Card className="p-3 space-y-3 mb-3">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">Напоминания</h2>
        <div className="flex items-center justify-between">
          <Label>За 24 часа</Label>
          <Switch
            checked={draft.reminder_24h_enabled}
            onCheckedChange={(v) => setField('reminder_24h_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>За 2 часа</Label>
          <Switch
            checked={draft.reminder_2h_enabled}
            onCheckedChange={(v) => setField('reminder_2h_enabled', v)}
          />
        </div>
      </Card>

      <Card className="p-3 space-y-2 mb-3">
        <Link href="/owner/services" className="block text-sm">
          Услуги →
        </Link>
        <Link href="/owner/finance" className="block text-sm">
          Финансы →
        </Link>
        {isLegal && (
          <Link href="/owner/employees" className="block text-sm">
            Команда →
          </Link>
        )}
        <Link href="/owner/schedule/time-off" className="block text-sm">
          Исключения →
        </Link>
      </Card>

      <Button className="w-full" onClick={save} disabled={update.isPending}>
        Сохранить
      </Button>
    </main>
  )
}
