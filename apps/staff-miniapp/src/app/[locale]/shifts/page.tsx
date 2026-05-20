'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { staffApi } from '@/apis/staff'
import type {
  EmployeeItem,
  ShiftCreatePayload,
  ShiftItem,
  ShiftSwapItem,
} from '@/types/staff'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function startOfWeek(d: Date) {
  const c = new Date(d)
  const day = c.getDay() // 0=Sun..6=Sat
  const offsetToMonday = day === 0 ? -6 : 1 - day
  c.setDate(c.getDate() + offsetToMonday)
  c.setHours(0, 0, 0, 0)
  return c
}

function addDays(d: Date, days: number) {
  const c = new Date(d)
  c.setDate(c.getDate() + days)
  return c
}

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ShiftsPage() {
  const t = useTranslations('shifts')
  const qc = useQueryClient()
  const meQuery = useQuery({ queryKey: ['staff', 'me'], queryFn: staffApi.me })
  const me = meQuery.data
  const canManage = me ? me.is_owner || me.role === 'staff_manager' : false

  if (meQuery.isLoading || !me) return <Shell>…</Shell>

  return canManage ? <ManagerView t={t} qc={qc} /> : <EmployeeView t={t} qc={qc} userId={me.user.id} />
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-5xl p-4 space-y-4">{children}</main>
}

// ---------------------------------------------------------------------------
// Manager: week grid
// ---------------------------------------------------------------------------

function ManagerView({ t, qc }: { t: (k: string) => string; qc: ReturnType<typeof useQueryClient> }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const range = useMemo(() => ({ from: fmtDate(weekStart), to: fmtDate(weekEnd) }), [weekStart, weekEnd])

  const employeesQuery = useQuery({
    queryKey: ['staff', 'employees'],
    queryFn: staffApi.listEmployees,
  })
  const shiftsQuery = useQuery({
    queryKey: ['staff', 'shifts', range],
    queryFn: () => staffApi.listShifts(range),
  })

  const [editing, setEditing] = useState<{
    user: EmployeeItem
    date: string
    shift?: ShiftItem
  } | null>(null)

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const grid = useMemo(() => {
    const map = new Map<string, ShiftItem[]>()
    for (const s of shiftsQuery.data ?? []) {
      const key = `${s.user_id}:${s.date}`
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [shiftsQuery.data])

  const copyWeekMutation = useMutation({
    mutationFn: () =>
      staffApi.copyWeek({
        from_week_start: fmtDate(addDays(weekStart, -7)),
        to_week_start: fmtDate(weekStart),
        overwrite: false,
      }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['staff', 'shifts'] })
      toast.success(t('copied').replace('{count}', String(created.length)))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('copyError'))
    },
  })

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="rounded border px-2 py-1"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ‹
          </button>
          <span className="min-w-[10rem] text-center">
            {fmtDate(weekStart)} – {fmtDate(weekEnd)}
          </span>
          <button
            type="button"
            className="rounded border px-2 py-1"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            ›
          </button>
          <button
            type="button"
            disabled={copyWeekMutation.isPending}
            onClick={() => copyWeekMutation.mutate()}
            className="ml-2 rounded border border-blue-600 px-2 py-1 text-blue-700 disabled:opacity-60"
          >
            {copyWeekMutation.isPending ? '…' : t('copyFromLastWeek')}
          </button>
        </div>
      </header>

      {(employeesQuery.isLoading || shiftsQuery.isLoading) && (
        <p className="text-sm text-muted-foreground">…</p>
      )}

      {employeesQuery.data && shiftsQuery.data && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 p-2 text-left">{t('employee')}</th>
                {days.map((d) => (
                  <th key={d.toISOString()} className="p-2 text-center font-medium">
                    <div>{WEEKDAYS_RU[(d.getDay() + 6) % 7]}</div>
                    <div className="text-muted-foreground">{pad2(d.getDate())}.{pad2(d.getMonth() + 1)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeesQuery.data
                .filter((e) => e.status === 'active' || e.is_owner)
                .map((emp) => (
                  <tr key={emp.user_id} className="border-t">
                    <td className="sticky left-0 z-10 bg-card p-2 font-medium">
                      {emp.display_name}
                      {emp.is_owner && <span className="ml-1 text-xs text-muted-foreground">★</span>}
                    </td>
                    {days.map((d) => {
                      const dateStr = fmtDate(d)
                      const shifts = grid.get(`${emp.user_id}:${dateStr}`) ?? []
                      return (
                        <td
                          key={dateStr}
                          className="border-l p-1 align-top hover:bg-blue-50"
                          onClick={() => setEditing({ user: emp, date: dateStr })}
                          style={{ cursor: 'pointer' }}
                        >
                          {shifts.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditing({ user: emp, date: dateStr, shift: s })
                              }}
                              className={`mb-1 block w-full rounded px-1 py-0.5 text-left text-[10px] ${
                                s.status === 'swapped'
                                  ? 'bg-purple-100 text-purple-800'
                                  : s.status === 'cancelled'
                                    ? 'bg-gray-100 text-gray-500 line-through'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {hhmm(s.start_at)}–{hhmm(s.end_at)}
                            </button>
                          ))}
                          {shifts.length === 0 && <span className="text-[10px] text-muted-foreground">+</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ShiftEditDialog
          user={editing.user}
          date={editing.date}
          shift={editing.shift}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            qc.invalidateQueries({ queryKey: ['staff', 'shifts'] })
          }}
          t={t}
        />
      )}
    </Shell>
  )
}

function ShiftEditDialog({
  user,
  date,
  shift,
  onClose,
  onSaved,
  t,
}: {
  user: EmployeeItem
  date: string
  shift?: ShiftItem
  onClose: () => void
  onSaved: () => void
  t: (k: string) => string
}) {
  const [startTime, setStartTime] = useState<string>(
    shift ? hhmm(shift.start_at) : '09:00',
  )
  const [endTime, setEndTime] = useState<string>(shift ? hhmm(shift.end_at) : '18:00')
  const [notes, setNotes] = useState(shift?.notes ?? '')

  const toISO = (hm: string) => {
    const [h, m] = hm.split(':').map(Number)
    const d = new Date(`${date}T00:00:00`)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user.user_id,
        date,
        start_at: toISO(startTime),
        end_at: toISO(endTime),
        notes: notes || null,
      }
      if (shift) {
        return staffApi.updateShift(shift.id, payload)
      }
      return staffApi.createShift(payload)
    },
    onSuccess: () => {
      toast.success(t('shiftSaved'))
      onSaved()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('shiftError')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => staffApi.deleteShift(shift!.id),
    onSuccess: () => {
      toast.success(t('shiftDeleted'))
      onSaved()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('shiftError')),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-background p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-3">
          <h2 className="font-semibold">
            {shift ? t('editShift') : t('newShift')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.display_name} · {date}
          </p>
        </header>

        <div className="space-y-2">
          <label className="block text-sm">
            <span>{t('startTime')}</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="ml-2 rounded border bg-background px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            <span>{t('endTime')}</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="ml-2 rounded border bg-background px-2 py-1"
            />
          </label>
          <label className="block text-sm">
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
          {shift && (
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-700 disabled:opacity-60"
            >
              {t('delete')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-3 py-1.5 text-sm"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saveMutation.isPending ? '…' : t('save')}
          </button>
        </footer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Employee: list + swap
// ---------------------------------------------------------------------------

function EmployeeView({
  t,
  qc,
  userId,
}: {
  t: (k: string) => string
  qc: ReturnType<typeof useQueryClient>
  userId: number
}) {
  const today = useMemo(() => new Date(), [])
  const range = useMemo(() => {
    const start = new Date(today)
    start.setDate(today.getDate() - 1)
    const end = new Date(today)
    end.setDate(today.getDate() + 13)
    return { from: fmtDate(start), to: fmtDate(end), user_id: userId }
  }, [today, userId])

  const shiftsQuery = useQuery({
    queryKey: ['staff', 'shifts', 'self', range],
    queryFn: () => staffApi.listShifts(range),
  })
  const swapsQuery = useQuery({
    queryKey: ['staff', 'shifts', 'swap', 'mine'],
    queryFn: () => staffApi.listSwapRequests(),
  })

  const [swapFor, setSwapFor] = useState<ShiftItem | null>(null)

  const cancelMutation = useMutation({
    mutationFn: (id: number) => staffApi.actSwapRequest(id, { action: 'cancel' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff', 'shifts', 'swap'] }),
  })

  return (
    <Shell>
      <header>
        <h1 className="text-xl font-semibold">{t('myShifts')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('myShiftsHint')}</p>
      </header>

      {shiftsQuery.isLoading && <p className="text-sm">…</p>}
      {shiftsQuery.data && shiftsQuery.data.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('noShifts')}</p>
      )}
      {shiftsQuery.data && shiftsQuery.data.length > 0 && (
        <ul className="divide-y rounded-lg border bg-card">
          {shiftsQuery.data.map((s) => (
            <li key={s.id} className="p-3 text-sm flex justify-between items-center gap-2">
              <div>
                <p className="font-medium">{s.date}</p>
                <p className="text-xs text-muted-foreground">
                  {hhmm(s.start_at)} – {hhmm(s.end_at)} · {t(`status.${s.status}`)}
                </p>
                {s.notes && <p className="text-xs italic">{s.notes}</p>}
              </div>
              {s.status === 'scheduled' && (
                <button
                  type="button"
                  onClick={() => setSwapFor(s)}
                  className="rounded border border-blue-600 px-2 py-1 text-xs text-blue-700"
                >
                  {t('swap')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {swapsQuery.data && swapsQuery.data.length > 0 && (
        <section>
          <h2 className="mt-4 text-sm font-medium text-muted-foreground">{t('mySwaps')}</h2>
          <ul className="mt-2 divide-y rounded-lg border bg-card">
            {swapsQuery.data.map((req) => (
              <SwapRequestRow
                key={req.id}
                req={req}
                myUserId={userId}
                onCancel={() => cancelMutation.mutate(req.id)}
                onAct={() => qc.invalidateQueries({ queryKey: ['staff', 'shifts', 'swap'] })}
                t={t}
              />
            ))}
          </ul>
        </section>
      )}

      {swapFor && (
        <SwapDialog
          shift={swapFor}
          userId={userId}
          onClose={() => setSwapFor(null)}
          onCreated={() => {
            setSwapFor(null)
            qc.invalidateQueries({ queryKey: ['staff', 'shifts', 'swap'] })
          }}
          t={t}
        />
      )}
    </Shell>
  )
}

function SwapRequestRow({
  req,
  myUserId,
  onCancel,
  onAct,
  t,
}: {
  req: ShiftSwapItem
  myUserId: number
  onCancel: () => void
  onAct: () => void
  t: (k: string) => string
}) {
  const acceptMutation = useMutation({
    mutationFn: () => staffApi.actSwapRequest(req.id, { action: 'accept' }),
    onSuccess: () => {
      toast.success(t('swapAccepted'))
      onAct()
    },
  })
  const rejectMutation = useMutation({
    mutationFn: () => staffApi.actSwapRequest(req.id, { action: 'reject' }),
    onSuccess: () => {
      toast.success(t('swapRejected'))
      onAct()
    },
  })
  const isMine = req.from_user_id === myUserId
  return (
    <li className="p-3 text-sm flex justify-between items-center gap-2">
      <div className="min-w-0">
        <p className="font-medium">#{req.id} · {t(`swapStatus.${req.status}`)}</p>
        <p className="text-xs text-muted-foreground">
          {t('from')}: shift #{req.from_shift_id} → {t('to')}: shift #{req.to_shift_id ?? '—'}
        </p>
        {req.notes && <p className="text-xs italic">{req.notes}</p>}
      </div>
      <div className="flex flex-col gap-1">
        {isMine && (req.status === 'pending' || req.status === 'accepted') && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-2 py-0.5 text-xs"
          >
            {t('cancel')}
          </button>
        )}
        {!isMine && req.status === 'pending' && req.to_user_id === myUserId && (
          <>
            <button
              type="button"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
              className="rounded border border-green-600 px-2 py-0.5 text-xs text-green-700"
            >
              {t('accept')}
            </button>
            <button
              type="button"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
              className="rounded border border-red-600 px-2 py-0.5 text-xs text-red-700"
            >
              {t('reject')}
            </button>
          </>
        )}
      </div>
    </li>
  )
}

function SwapDialog({
  shift,
  userId,
  onClose,
  onCreated,
  t,
}: {
  shift: ShiftItem
  userId: number
  onClose: () => void
  onCreated: () => void
  t: (k: string) => string
}) {
  const [notes, setNotes] = useState('')
  const createMutation = useMutation({
    mutationFn: () =>
      staffApi.createSwapRequest({ from_shift_id: shift.id, notes: notes || undefined }),
    onSuccess: () => {
      toast.success(t('swapCreated'))
      onCreated()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('shiftError')),
  })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold">{t('swapDialog')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {shift.date}, {hhmm(shift.start_at)} – {hhmm(shift.end_at)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('swapDialogHint')}</p>

        <label className="mt-3 block text-sm">
          <span>{t('notes')}</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('swapPlaceholder')}
            className="mt-1 w-full rounded border bg-background px-2 py-1"
          />
        </label>

        <footer className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-1.5 text-sm">
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {createMutation.isPending ? '…' : t('createSwap')}
          </button>
        </footer>
      </div>
    </div>
  )
}
