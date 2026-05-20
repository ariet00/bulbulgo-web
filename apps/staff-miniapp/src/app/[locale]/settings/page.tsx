'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { staffApi } from '@/apis/staff'
import type { BonusRule, StaffSettingsData } from '@/types/staff'

function num(input: string | number): number {
  const n = typeof input === 'number' ? input : parseFloat(input)
  return Number.isFinite(n) ? n : 0
}

function livePreview(data: StaffSettingsData, sampleBaseRate: number, sampleHours: number) {
  const formula = data.salary_formula
  const overtimeMul = formula.overtime_multiplier
  const taxRate = formula.tax_rate
  const socialRate = formula.social_rate
  const regular = sampleHours
  const overtimeHours = 8
  const base = sampleBaseRate * regular
  const overtime = sampleBaseRate * overtimeHours * overtimeMul
  const bonuses = formula.bonuses.reduce((acc, b) => acc + (b.amount || 0), 0)
  const gross = base + overtime + bonuses
  const tax = gross * taxRate
  const social = gross * socialRate
  const net = Math.max(0, gross - tax - social)
  return { gross, tax, social, net, base, overtime, bonuses }
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const qc = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['staff', 'settings'],
    queryFn: staffApi.getSettings,
  })

  const [data, setData] = useState<StaffSettingsData | null>(null)
  useEffect(() => {
    if (settingsQuery.data) setData(settingsQuery.data.data)
  }, [settingsQuery.data])

  const updateMutation = useMutation({
    mutationFn: (next: StaffSettingsData) =>
      staffApi.updateSettings({ data: next }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'settings'] })
      toast.success(t('saved'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('error'))
    },
  })

  const preview = useMemo(
    () => (data ? livePreview(data, 500, 160) : null),
    [data],
  )

  if (settingsQuery.isLoading || !data) {
    return <Shell>…</Shell>
  }

  const update = (patch: Partial<StaffSettingsData>) =>
    setData((cur) => (cur ? { ...cur, ...patch } : cur))
  const updateFormula = (patch: Partial<StaffSettingsData['salary_formula']>) =>
    setData((cur) =>
      cur ? { ...cur, salary_formula: { ...cur.salary_formula, ...patch } } : cur,
    )

  const addBonus = () => {
    if (!data) return
    update({
      salary_formula: {
        ...data.salary_formula,
        bonuses: [...data.salary_formula.bonuses, { name: '', amount: 0, condition: null }],
      },
    })
  }
  const updateBonus = (idx: number, patch: Partial<BonusRule>) => {
    if (!data) return
    const next = data.salary_formula.bonuses.map((b, i) => (i === idx ? { ...b, ...patch } : b))
    update({ salary_formula: { ...data.salary_formula, bonuses: next } })
  }
  const removeBonus = (idx: number) => {
    if (!data) return
    update({
      salary_formula: {
        ...data.salary_formula,
        bonuses: data.salary_formula.bonuses.filter((_, i) => i !== idx),
      },
    })
  }

  return (
    <Shell>
      <header>
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('subtitle')}</p>
      </header>

      <Section title={t('workdayBlock')}>
        <Field label={t('workDayHours')}>
          <input
            type="number"
            min={1}
            max={24}
            value={data.work_day_hours}
            onChange={(e) => update({ work_day_hours: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
        <Field label={t('overtimeThreshold')}>
          <input
            type="number"
            min={0}
            value={data.overtime_threshold_min}
            onChange={(e) => update({ overtime_threshold_min: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
      </Section>

      <Section title={t('formulaBlock')}>
        <Field label={t('overtimeMul')}>
          <input
            type="number"
            step="0.1"
            min={1}
            value={data.salary_formula.overtime_multiplier}
            onChange={(e) => updateFormula({ overtime_multiplier: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
        <Field label={t('taxRate')}>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.salary_formula.tax_rate}
            onChange={(e) => updateFormula({ tax_rate: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
        <Field label={t('socialRate')}>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.salary_formula.social_rate}
            onChange={(e) => updateFormula({ social_rate: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
        <Field label={t('lateFine')}>
          <input
            type="number"
            min={0}
            value={data.salary_formula.late_fine_per_min}
            onChange={(e) => updateFormula({ late_fine_per_min: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>
        <Field label={t('absenceFine')}>
          <input
            type="number"
            min={0}
            value={data.salary_formula.absence_fine_per_day}
            onChange={(e) => updateFormula({ absence_fine_per_day: num(e.target.value) })}
            className="w-24 rounded border bg-background px-2 py-1 text-sm"
          />
        </Field>

        <div className="mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('bonuses')}</h3>
            <button
              type="button"
              onClick={addBonus}
              className="rounded border px-2 py-0.5 text-xs hover:bg-gray-50"
            >
              {t('addBonus')}
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {data.salary_formula.bonuses.map((b, idx) => (
              <li key={idx} className="grid grid-cols-[1fr_6rem_auto] gap-2">
                <input
                  type="text"
                  placeholder={t('bonusName')}
                  value={b.name}
                  onChange={(e) => updateBonus(idx, { name: e.target.value })}
                  className="rounded border bg-background px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  value={b.amount}
                  onChange={(e) => updateBonus(idx, { amount: num(e.target.value) })}
                  className="rounded border bg-background px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeBonus(idx)}
                  className="rounded px-2 text-xs text-red-600 hover:bg-red-50"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {preview && (
        <Section title={t('previewBlock')}>
          <p className="text-xs text-muted-foreground mb-2">{t('previewHint')}</p>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt>{t('base')}</dt><dd className="text-right">{preview.base.toFixed(2)}</dd>
            <dt>{t('overtime')}</dt><dd className="text-right">{preview.overtime.toFixed(2)}</dd>
            <dt>{t('bonusesShort')}</dt><dd className="text-right">{preview.bonuses.toFixed(2)}</dd>
            <dt>{t('gross')}</dt><dd className="text-right font-semibold">{preview.gross.toFixed(2)}</dd>
            <dt>{t('tax')}</dt><dd className="text-right">−{preview.tax.toFixed(2)}</dd>
            <dt>{t('social')}</dt><dd className="text-right">−{preview.social.toFixed(2)}</dd>
            <dt className="border-t pt-1 font-semibold">{t('net')}</dt>
            <dd className="border-t pt-1 text-right font-semibold">{preview.net.toFixed(2)}</dd>
          </dl>
        </Section>
      )}

      <div className="sticky bottom-0 bg-background py-2">
        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => data && updateMutation.mutate(data)}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {updateMutation.isPending ? '…' : t('save')}
        </button>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl p-4 space-y-4">{children}</main>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-4 space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      {children}
    </label>
  )
}
