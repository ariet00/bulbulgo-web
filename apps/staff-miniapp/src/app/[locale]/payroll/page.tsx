'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { staffApi } from '@/apis/staff'
import type { PayrollPeriodDetail, PayrollPeriodItem } from '@/types/staff'

function fmtMoney(value: number, currency: string | null) {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ''}`.trim()
}

function statusBadge(status: PayrollPeriodItem['status']) {
  const map: Record<typeof status, string> = {
    draft: 'bg-gray-100 text-gray-700',
    calculated: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

export default function PayrollPage() {
  const t = useTranslations('payroll')
  const qc = useQueryClient()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [activePeriodId, setActivePeriodId] = useState<number | null>(null)

  const meQuery = useQuery({ queryKey: ['staff', 'me'], queryFn: staffApi.me })
  const me = meQuery.data
  const canManage = me ? me.is_owner || me.role === 'staff_manager' || me.role === 'staff_accountant' : false

  const listQuery = useQuery({
    queryKey: ['staff', 'payroll', 'list'],
    queryFn: () => staffApi.listPayrollPeriods(),
    enabled: Boolean(me),
  })

  const detailQuery = useQuery({
    queryKey: ['staff', 'payroll', 'detail', activePeriodId],
    queryFn: () => staffApi.getPayrollPeriod(activePeriodId!),
    enabled: Boolean(activePeriodId),
  })

  const calculateMutation = useMutation({
    mutationFn: () => staffApi.calculatePayroll(year, month),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['staff', 'payroll'] })
      setActivePeriodId(data.id)
      toast.success(t('calculated'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('calcError'))
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => staffApi.approvePayroll(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'payroll'] })
      toast.success(t('approved'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('approveError'))
    },
  })

  const sendSlipsMutation = useMutation({
    mutationFn: (id: number) => staffApi.sendPayslips(id),
    onSuccess: (res) => {
      toast.success(t('sentPayslips', { count: res.queued }))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('sendError'))
    },
  })

  if (meQuery.isLoading || !me) return <Shell>…</Shell>

  return (
    <Shell>
      <header>
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('subtitle')}</p>
      </header>

      {canManage && (
        <section className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t('calculateBlock')}</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded border bg-background px-2 py-1 text-sm"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={calculateMutation.isPending}
              onClick={() => calculateMutation.mutate()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {calculateMutation.isPending ? t('calculating') : t('calculate')}
            </button>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">{t('periods')}</h2>
        {listQuery.isLoading && <p className="text-sm">…</p>}
        {listQuery.data && listQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('noPeriods')}</p>
        )}
        {listQuery.data && listQuery.data.length > 0 && (
          <ul className="divide-y rounded-lg border bg-card">
            {listQuery.data.map((p) => (
              <li key={p.id} className="p-3 text-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setActivePeriodId(p.id === activePeriodId ? null : p.id)}
                >
                  <span>
                    <strong>{p.year}-{String(p.month).padStart(2, '0')}</strong>
                    <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-xs ${statusBadge(p.status)}`}>
                      {t(`status.${p.status}`)}
                    </span>
                  </span>
                  <span>{fmtMoney(p.total_amount, null)}</span>
                </button>

                {activePeriodId === p.id && detailQuery.data && (
                  <PayrollDetail
                    detail={detailQuery.data}
                    canManage={canManage}
                    isOwner={me.is_owner}
                    onApprove={() => approveMutation.mutate(p.id)}
                    onSend={() => sendSlipsMutation.mutate(p.id)}
                    approving={approveMutation.isPending}
                    sending={sendSlipsMutation.isPending}
                  />
                )}
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

function PayrollDetail({
  detail,
  canManage,
  isOwner,
  onApprove,
  onSend,
  approving,
  sending,
}: {
  detail: PayrollPeriodDetail
  canManage: boolean
  isOwner: boolean
  onApprove: () => void
  onSend: () => void
  approving: boolean
  sending: boolean
}) {
  const t = useTranslations('payroll')
  const currency = detail.currency_code
  return (
    <div className="mt-3 space-y-3">
      <table className="w-full text-xs">
        <thead className="text-muted-foreground">
          <tr>
            <th className="text-left py-1">{t('employee')}</th>
            <th className="text-right py-1">{t('hours')}</th>
            <th className="text-right py-1">{t('gross')}</th>
            <th className="text-right py-1">{t('net')}</th>
          </tr>
        </thead>
        <tbody>
          {detail.entries.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="py-1 truncate">{e.display_name ?? `#${e.user_id}`}</td>
              <td className="py-1 text-right">{e.hours_worked.toFixed(1)}</td>
              <td className="py-1 text-right">{fmtMoney(e.gross, currency)}</td>
              <td className="py-1 text-right font-semibold">{fmtMoney(e.net, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {canManage && (
        <div className="flex flex-wrap gap-2">
          {isOwner && detail.status !== 'approved' && detail.status !== 'paid' && (
            <button
              type="button"
              disabled={approving}
              onClick={onApprove}
              className="rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
            >
              {approving ? '…' : t('approve')}
            </button>
          )}
          {detail.status !== 'draft' && (
            <button
              type="button"
              disabled={sending}
              onClick={onSend}
              className="rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
            >
              {sending ? '…' : t('sendPayslips')}
            </button>
          )}
          <a
            href={`/api/v1/staff/payroll/${detail.id}/export`}
            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            {t('exportXlsx')}
          </a>
        </div>
      )}
    </div>
  )
}
