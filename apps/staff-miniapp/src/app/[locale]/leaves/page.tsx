'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { staffApi } from '@/apis/staff'
import type { LeaveItem, LeaveStatus, LeaveType } from '@/types/staff'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function typeBadge(t: LeaveType) {
  const map: Record<LeaveType, string> = {
    vacation: 'bg-green-100 text-green-800',
    sick: 'bg-amber-100 text-amber-800',
    unpaid: 'bg-gray-100 text-gray-700',
    other: 'bg-blue-100 text-blue-800',
  }
  return map[t] ?? 'bg-gray-100 text-gray-700'
}

function statusBadge(s: LeaveStatus) {
  const map: Record<LeaveStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[s] ?? 'bg-gray-100 text-gray-700'
}

export default function LeavesPage() {
  const t = useTranslations('leaves')
  const qc = useQueryClient()

  const meQuery = useQuery({ queryKey: ['staff', 'me'], queryFn: staffApi.me })
  const me = meQuery.data
  const canManage = me ? me.is_owner || me.role === 'staff_manager' : false

  const [showCreate, setShowCreate] = useState(false)

  const leavesQuery = useQuery({
    queryKey: ['staff', 'leaves'],
    queryFn: () => staffApi.listLeaves(),
    enabled: Boolean(me),
  })

  const balanceQuery = useQuery({
    queryKey: ['staff', 'leaves', 'balance', me?.user.id],
    queryFn: () => staffApi.leaveBalance(me!.user.id),
    enabled: Boolean(me),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => staffApi.approveLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'leaves'] })
      toast.success(t('approved'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('error')),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => staffApi.rejectLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'leaves'] })
      toast.success(t('rejected'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('error')),
  })

  if (meQuery.isLoading || !me) return <Shell>…</Shell>

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          {t('newRequest')}
        </button>
      </header>

      {balanceQuery.data && (
        <section className="rounded-lg border bg-card p-4 text-sm">
          <h2 className="font-medium text-muted-foreground">{t('balanceBlock')}</h2>
          <p className="mt-1">
            {t('balanceFor')} {balanceQuery.data.year}:{' '}
            <strong>{balanceQuery.data.balance} {t('days')}</strong>{' '}
            <span className="text-muted-foreground">
              ({balanceQuery.data.default_per_year}
              {balanceQuery.data.carryover > 0 ? ` + ${balanceQuery.data.carryover}` : ''}
              {' − '}
              {balanceQuery.data.used} {t('used')})
            </span>
          </p>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">{t('list')}</h2>
        {leavesQuery.isLoading && <p className="mt-2 text-sm">…</p>}
        {leavesQuery.data && leavesQuery.data.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {leavesQuery.data && leavesQuery.data.length > 0 && (
          <ul className="mt-2 divide-y rounded-lg border bg-card">
            {leavesQuery.data.map((lv) => (
              <li key={lv.id} className="p-3 text-sm flex justify-between gap-2 items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${typeBadge(lv.type)}`}>
                      {t(`type.${lv.type}`)}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-xs ${statusBadge(lv.status)}`}>
                      {t(`status.${lv.status}`)}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">
                    {lv.starts_at} → {lv.ends_at} ({lv.days_count} {t('days')})
                  </p>
                  {lv.manager_comment && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">
                      {t('mgrComment')}: {lv.manager_comment}
                    </p>
                  )}
                </div>
                {canManage && lv.status === 'pending' && (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(lv.id)}
                      disabled={approveMutation.isPending}
                      className="rounded border border-green-600 px-2 py-0.5 text-xs text-green-700"
                    >
                      {t('approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(lv.id)}
                      disabled={rejectMutation.isPending}
                      className="rounded border border-red-600 px-2 py-0.5 text-xs text-red-700"
                    >
                      {t('reject')}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showCreate && (
        <CreateLeaveDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            qc.invalidateQueries({ queryKey: ['staff', 'leaves'] })
          }}
          t={t}
        />
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl p-4 space-y-4">{children}</main>
}

function CreateLeaveDialog({
  onClose,
  onCreated,
  t,
}: {
  onClose: () => void
  onCreated: () => void
  t: (k: string) => string
}) {
  const today = fmtDate(new Date())
  const [type, setType] = useState<LeaveType>('vacation')
  const [starts, setStarts] = useState(today)
  const [ends, setEnds] = useState(today)
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: () => staffApi.createLeave({ type, starts_at: starts, ends_at: ends, notes: notes || undefined }),
    onSuccess: () => {
      toast.success(t('created'))
      onCreated()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('error')),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold">{t('newRequest')}</h2>

        <div className="mt-3 space-y-2 text-sm">
          <label className="block">
            <span>{t('typeLabel')}</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="ml-2 rounded border bg-background px-2 py-1"
            >
              <option value="vacation">{t('type.vacation')}</option>
              <option value="sick">{t('type.sick')}</option>
              <option value="unpaid">{t('type.unpaid')}</option>
              <option value="other">{t('type.other')}</option>
            </select>
          </label>
          <label className="block">
            <span>{t('from')}</span>
            <input
              type="date"
              value={starts}
              onChange={(e) => setStarts(e.target.value)}
              className="ml-2 rounded border bg-background px-2 py-1"
            />
          </label>
          <label className="block">
            <span>{t('to')}</span>
            <input
              type="date"
              value={ends}
              onChange={(e) => setEnds(e.target.value)}
              className="ml-2 rounded border bg-background px-2 py-1"
            />
          </label>
          <label className="block">
            <span>{t('notes')}</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="ml-2 w-full rounded border bg-background px-2 py-1"
            />
          </label>
        </div>

        <footer className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-1.5 text-sm">
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {mutation.isPending ? '…' : t('submit')}
          </button>
        </footer>
      </div>
    </div>
  )
}
