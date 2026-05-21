'use client'

import { useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, Mic, Plus, Sparkles, Square } from 'lucide-react'
import { toast } from 'sonner'

import { DateRangeFilter } from '@/components/DateRangeFilter'
import { useDebts, useMe, useWallets } from '@/hooks/queries'
import {
  useAIParseDebtText,
  useAIParseDebtVoice,
  useCreateDebt,
  useUpdateDebt,
} from '@/hooks/mutations'
import { resolveRange, type DateRange } from '@/lib/dateRange'
import { formatDate, formatMoney } from '@/lib/format'
import type { DebtType, ParsedDebt } from '@/types/akcha'

type Filter = 'all' | DebtType

interface DebtDraft {
  type: DebtType
  amount: string
  counterparty_name: string
  counterparty_phone: string
  wallet_id: number | null
  due_date: string
  description: string
}

export default function DebtsPage() {
  const t = useTranslations('debts')
  const { data: me } = useMe()
  const { data: wallets = [] } = useWallets()

  const [filter, setFilter] = useState<Filter>('all')
  const [range, setRange] = useState<DateRange>({ preset: 'd30' })
  const [counterparty, setCounterparty] = useState<string>('all')

  const resolved = useMemo(() => resolveRange(range), [range])
  const { data: debts = [] } = useDebts({
    type: filter === 'all' ? undefined : filter,
    is_closed: false,
    ...resolved,
  })

  const create = useCreateDebt()
  const update = useUpdateDebt()
  const parseText = useAIParseDebtText()
  const parseVoice = useAIParseDebtVoice()

  const currency = me?.currency_code ?? 'KGS'
  const defaultWalletId = me?.default_wallet?.id ?? wallets[0]?.id ?? null

  // Counterparty options from the loaded list; filter applied client-side.
  const counterparties = useMemo(() => {
    const set = new Set<string>()
    for (const d of debts) if (d.counterparty_name) set.add(d.counterparty_name)
    return [...set]
  }, [debts])
  const shownDebts = counterparty === 'all' ? debts : debts.filter(d => d.counterparty_name === counterparty)

  // Shared draft for manual + AI-parsed creation.
  const [draft, setDraft] = useState<DebtDraft | null>(null)
  const [aiText, setAiText] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const emptyDraft = (): DebtDraft => ({
    type: 'i_owe',
    amount: '',
    counterparty_name: '',
    counterparty_phone: '',
    wallet_id: defaultWalletId,
    due_date: '',
    description: '',
  })

  const draftFromParsed = (p: ParsedDebt): DebtDraft => ({
    type: p.type,
    amount: p.amount ? String(p.amount) : '',
    counterparty_name: p.counterparty_name ?? '',
    counterparty_phone: '',
    wallet_id: defaultWalletId,
    due_date: p.due_date ?? '',
    description: p.description ?? '',
  })

  const set = (patch: Partial<DebtDraft>) => setDraft(d => (d ? { ...d, ...patch } : d))

  const onParseText = async () => {
    const value = aiText.trim()
    if (!value) return
    try {
      const parsed = await parseText.mutateAsync(value)
      setDraft(draftFromParsed(parsed))
      setAiText('')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('errorParse'))
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach(tr => tr.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (!blob.size) return
        try {
          const res = await parseVoice.mutateAsync(blob)
          setDraft(draftFromParsed(res.parsed))
        } catch (e: any) {
          toast.error(e?.response?.data?.message ?? t('errorVoice'))
        }
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      toast.error(t('errorMic'))
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  const onSave = async () => {
    if (!draft) return
    const amount = parseFloat(draft.amount)
    if (!amount || amount <= 0) {
      toast.error(t('errorAmount'))
      return
    }
    if (!draft.wallet_id) {
      toast.error(t('errorWallet'))
      return
    }
    try {
      await create.mutateAsync({
        type: draft.type,
        amount,
        counterparty_name: draft.counterparty_name || undefined,
        counterparty_phone: draft.counterparty_phone || undefined,
        wallet_id: draft.wallet_id,
        due_date: draft.due_date ? new Date(draft.due_date).toISOString() : undefined,
        description: draft.description || undefined,
      })
      toast.success(t('saved'))
      setDraft(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('errorSave'))
    }
  }

  const aiBusy = parseText.isPending || parseVoice.isPending

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <button onClick={() => setDraft(draft ? null : emptyDraft())} className="text-primary" aria-label={t('add')}>
          <Plus size={20} />
        </button>
      </div>

      {/* AI quick-add: text + voice */}
      {!draft && (
        <div className="flex items-center gap-2">
          <input
            value={aiText}
            onChange={e => setAiText(e.target.value)}
            placeholder={t('aiPlaceholder')}
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={onParseText}
            disabled={aiBusy || !aiText.trim()}
            aria-label={t('parse')}
            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            {parseText.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={aiBusy && !recording}
            aria-label={t('voice')}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${recording ? 'bg-rose-600 text-white animate-pulse' : ''} disabled:opacity-50`}
          >
            {parseVoice.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : recording ? (
              <Square size={16} />
            ) : (
              <Mic size={16} />
            )}
          </button>
        </div>
      )}

      {/* Draft form (manual or AI-parsed) */}
      {draft && (
        <div className="space-y-2 border rounded-xl p-3">
          <div className="grid grid-cols-2 gap-2">
            {(['i_owe', 'they_owe'] as const).map(tp => (
              <button
                key={tp}
                onClick={() => set({ type: tp })}
                className={`rounded-xl border py-2 text-sm font-medium ${
                  draft.type === tp ? (tp === 'i_owe' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white') : ''
                }`}
              >
                {t(tp)}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={draft.amount}
            onChange={e => set({ amount: e.target.value })}
            placeholder={t('amount')}
            className="w-full rounded-xl border bg-background px-3 py-2 text-lg font-semibold"
          />
          <input
            value={draft.counterparty_name}
            onChange={e => set({ counterparty_name: e.target.value })}
            placeholder={t('counterparty')}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <input
            type="tel"
            value={draft.counterparty_phone}
            onChange={e => set({ counterparty_phone: e.target.value })}
            placeholder={t('phone')}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <label className="block">
            <span className="text-xs text-muted-foreground">{t('wallet')}</span>
            <select
              value={draft.wallet_id ?? ''}
              onChange={e => set({ wallet_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">{t('due')}</span>
              <input
                type="date"
                value={draft.due_date}
                onChange={e => set({ due_date: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">{t('comment')}</span>
              <input
                value={draft.description}
                onChange={e => set({ description: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setDraft(null)} className="rounded-xl border px-4 py-2.5 text-sm">
              {t('cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={create.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {create.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {t('save')}
            </button>
          </div>
        </div>
      )}

      <DateRangeFilter value={range} onChange={setRange} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'i_owe', 'they_owe'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {counterparties.length > 0 && (
        <select
          value={counterparty}
          onChange={e => setCounterparty(e.target.value)}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t('allCounterparties')}</option>
          {counterparties.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      )}

      {shownDebts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {shownDebts.map(d => {
            const isMine = d.type === 'i_owe'
            return (
              <li key={d.id} className="rounded-xl border p-3 flex gap-3">
                <div className="text-2xl">{isMine ? '🔻' : '🔺'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {d.counterparty_name ?? '—'} · {formatMoney(d.amount, currency)}
                  </div>
                  {d.description ? (
                    <div className="text-xs text-muted-foreground truncate">{d.description}</div>
                  ) : null}
                  <div className="text-xs text-muted-foreground">
                    {isMine ? t('i_owe') : t('they_owe')} · {formatDate(d.created_at)}
                    {d.due_date ? ` · 📅 ${formatDate(d.due_date)}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => update.mutate({ id: d.id, payload: { is_closed: true } })}
                  className="text-emerald-600"
                  title={t('close')}
                >
                  <Check size={20} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
