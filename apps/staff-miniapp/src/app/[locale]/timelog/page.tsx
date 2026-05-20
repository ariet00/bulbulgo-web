'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { staffApi } from '@/apis/staff'
import type { TimeEntry } from '@/types/staff'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function ymRange(year: number, month: number) {
  const from = `${year}-${pad2(month)}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${pad2(month)}-${pad2(lastDay)}`
  return { from, to }
}

function fmtMinutes(m: number) {
  if (!m) return '—'
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h}:${pad2(mm)}`
}

function statusColor(entry: TimeEntry) {
  if (entry.status === 'approved') return 'text-green-700'
  if (entry.status === 'rejected') return 'text-red-700'
  if (entry.late_minutes > 0) return 'text-amber-700'
  if (entry.overtime_minutes > 0) return 'text-blue-700'
  return 'text-foreground'
}

export default function TimelogPage() {
  const t = useTranslations('timelog')
  const qc = useQueryClient()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const { from, to } = useMemo(() => ymRange(year, month), [year, month])

  const meQuery = useQuery({ queryKey: ['staff', 'me'], queryFn: staffApi.me })
  const me = meQuery.data
  const canManage = me ? me.is_owner || me.role === 'staff_manager' : false

  const timelogQuery = useQuery({
    queryKey: ['staff', 'timelog', { from, to, scope: canManage ? 'all' : me?.user.id }],
    queryFn: () =>
      staffApi.listTimelog({
        from,
        to,
        ...(canManage ? {} : me ? { user_id: me.user.id } : {}),
      }),
    enabled: Boolean(me),
  })

  const summaryQuery = useQuery({
    queryKey: ['staff', 'timelog', 'summary', { year, month }],
    queryFn: () => staffApi.timelogSummary(year, month),
    enabled: canManage,
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => staffApi.approveEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff', 'timelog'] }),
  })

  if (meQuery.isLoading || !me) {
    return <Shell>…</Shell>
  }

  return (
    <Shell>
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <MonthSwitcher year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </header>

      {canManage && summaryQuery.data && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t('summary')}</h2>
          <p className="mt-1 text-sm">
            {t('grandTotal')}: <strong>{fmtMinutes(summaryQuery.data.grand_total_minutes)}</strong>
            {' · '}
            {t('grandOvertime')}: <strong>{fmtMinutes(summaryQuery.data.grand_overtime_minutes)}</strong>
          </p>
        </section>
      )}

      <section>
        {timelogQuery.isLoading && <p className="text-sm text-muted-foreground">…</p>}
        {timelogQuery.data && timelogQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {timelogQuery.data && timelogQuery.data.length > 0 && (
          <ul className="divide-y rounded-lg border bg-card">
            {timelogQuery.data.map((entry) => (
              <li key={entry.id} className="p-3 text-sm flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.check_in_at
                      ? new Date(entry.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                    {' → '}
                    {entry.check_out_at
                      ? new Date(entry.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                    {' · '}
                    {entry.method}
                  </p>
                </div>
                <div className={`text-right ${statusColor(entry)}`}>
                  <p className="font-semibold">{fmtMinutes(entry.total_minutes)}</p>
                  {entry.overtime_minutes > 0 && (
                    <p className="text-xs">+{fmtMinutes(entry.overtime_minutes)} {t('ot')}</p>
                  )}
                  {canManage && entry.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(entry.id)}
                      disabled={approveMutation.isPending}
                      className="mt-2 rounded border px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                    >
                      {t('approve')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl p-4 space-y-4">{children}</main>
}

function MonthSwitcher({
  year,
  month,
  onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) {
  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    onChange(d.getFullYear(), d.getMonth() + 1)
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-sm">
      <button type="button" onClick={() => shift(-1)} className="px-1">‹</button>
      <span className="min-w-[5rem] text-center">
        {year}-{pad2(month)}
      </span>
      <button type="button" onClick={() => shift(1)} className="px-1">›</button>
    </div>
  )
}
