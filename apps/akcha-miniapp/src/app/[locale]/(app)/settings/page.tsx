'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { akchaApi } from '@/apis/akcha'
import { useMe } from '@/hooks/queries'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { data: me } = useMe()
  const qc = useQueryClient()

  const [weekly, setWeekly] = useState(false)
  const [debtDays, setDebtDays] = useState<number>(1)
  const [limit, setLimit] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('Asia/Bishkek')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!me) return
    const d = me.settings.data ?? {}
    setWeekly(Boolean(d.weekly_summary_enabled))
    setDebtDays(Number(d.debt_reminder_days ?? 1))
    setLimit(d.monthly_limit != null ? String(d.monthly_limit) : '')
    setTimezone(me.settings.timezone ?? 'Asia/Bishkek')
  }, [me])

  const save = async () => {
    setSaving(true)
    try {
      const monthly_limit = limit.trim() === '' ? null : Number(limit)
      await akchaApi.updateMe({
        timezone,
        data: {
          weekly_summary_enabled: weekly,
          debt_reminder_days: debtDays,
          monthly_limit,
        },
      })
      await qc.invalidateQueries({ queryKey: ['akcha', 'me'] })
      toast.success('Сохранено')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Настройки</h1>

      <section className="rounded-xl border p-3 space-y-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">Еженедельная сводка</span>
          <input
            type="checkbox"
            checked={weekly}
            onChange={e => setWeekly(e.target.checked)}
            className="size-5"
          />
        </label>

        <label className="block">
          <span className="text-sm">Напоминать о долгах за (дней)</span>
          <input
            type="number"
            min={0}
            max={30}
            value={debtDays}
            onChange={e => setDebtDays(Number(e.target.value))}
            className="mt-1 w-full bg-background border rounded-md px-2 py-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm">Месячный лимит расходов ({me?.currency_code ?? 'KGS'})</span>
          <input
            type="number"
            min={0}
            value={limit}
            onChange={e => setLimit(e.target.value)}
            placeholder="не задан"
            className="mt-1 w-full bg-background border rounded-md px-2 py-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm">Часовой пояс</span>
          <input
            type="text"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="mt-1 w-full bg-background border rounded-md px-2 py-1 text-sm"
            placeholder="Asia/Bishkek"
          />
        </label>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-60"
      >
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </div>
  )
}
