'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, Check, Loader2, Mic, Plus, Sparkles, Square, X } from 'lucide-react'
import { toast } from 'sonner'

import { useCategories, useMe, useWallets } from '@/hooks/queries'
import {
  useAIParseReceipt,
  useAIParseText,
  useAIParseVoice,
  useCreateCategory,
  useCreateTransaction,
} from '@/hooks/mutations'
import { formatMoney } from '@/lib/format'
import type { ParsedReceipt, ParsedTransaction } from '@/types/akcha'

type TxType = 'income' | 'expense'

interface Draft {
  type: TxType
  amount: string
  category_id: number | null
  category_hint: string | null
  wallet_id: number | null
  description: string
  date: string | null
  clarification: string | null
  confidence: number
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function draftFromTransaction(p: ParsedTransaction, defaultWalletId: number | null): Draft {
  return {
    type: p.type,
    amount: p.amount ? String(p.amount) : '',
    category_id: p.category_id,
    category_hint: p.category_hint,
    wallet_id: defaultWalletId,
    description: p.description ?? '',
    date: p.date ?? todayIso(),
    clarification: p.needs_clarification ? p.clarification_question : null,
    confidence: p.confidence,
  }
}

function draftFromReceipt(p: ParsedReceipt, defaultWalletId: number | null): Draft {
  return {
    type: 'expense',
    amount: p.amount ? String(p.amount) : '',
    category_id: p.category_id,
    category_hint: p.category_hint,
    wallet_id: defaultWalletId,
    description: p.description ?? p.merchant ?? '',
    date: p.date ?? todayIso(),
    clarification: null,
    confidence: p.confidence,
  }
}

export function QuickAdd() {
  const t = useTranslations('quickAdd')
  const { data: me } = useMe()
  const { data: wallets = [] } = useWallets()
  const { data: categories = [] } = useCategories()

  const parseText = useAIParseText()
  const parseVoice = useAIParseVoice()
  const parseReceipt = useAIParseReceipt()
  const createTransaction = useCreateTransaction()
  const createCategory = useCreateCategory()

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [recording, setRecording] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const defaultWalletId = me?.default_wallet?.id ?? wallets[0]?.id ?? null
  const busy = parseText.isPending || parseVoice.isPending || parseReceipt.isPending
  const typeCategories = categories.filter(c => !draft || c.type === draft.type)

  const reset = () => {
    setText('')
    setDraft(null)
  }
  const close = () => {
    setOpen(false)
    reset()
  }

  const onParseText = async () => {
    const value = text.trim()
    if (!value) return
    try {
      const parsed = await parseText.mutateAsync(value)
      setDraft(draftFromTransaction(parsed, defaultWalletId))
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
          setText(res.transcript)
          setDraft(draftFromTransaction(res.parsed, defaultWalletId))
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

  const onReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = await parseReceipt.mutateAsync(file)
      setDraft(draftFromReceipt(parsed, defaultWalletId))
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('errorReceipt'))
    }
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
      // Persist a brand-new AI-suggested category if the user kept the hint.
      let categoryId = draft.category_id
      if (!categoryId && draft.category_hint) {
        const created = await createCategory.mutateAsync({
          name: draft.category_hint,
          type: draft.type,
        })
        categoryId = created.id
      }
      await createTransaction.mutateAsync({
        wallet_id: draft.wallet_id,
        amount,
        type: draft.type,
        description: draft.description || undefined,
        category_id: categoryId ?? undefined,
        date: draft.date ? new Date(draft.date).toISOString() : undefined,
      })
      toast.success(t('saved'))
      close()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('errorSave'))
    }
  }

  // Stop a live recording if the sheet is dismissed mid-capture.
  useEffect(() => {
    if (!open && recorderRef.current && recording) stopRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (patch: Partial<Draft>) => setDraft(d => (d ? { ...d, ...patch } : d))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t('fab')}
        className="fixed z-50 right-4 bottom-20 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus size={26} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-background p-4 pb-6 shadow-2xl max-h-[90vh] overflow-y-auto"
               style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> {t('title')}
              </h2>
              <button onClick={close} className="text-muted-foreground" aria-label={t('close')}>
                <X size={20} />
              </button>
            </div>

            {!draft ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{t('hint')}</p>
                <textarea
                  autoFocus
                  rows={2}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={t('placeholder')}
                  className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={onParseText}
                    disabled={busy || !text.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    {parseText.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {t('parse')}
                  </button>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={busy && !recording}
                    aria-label={t('voice')}
                    className={`h-11 w-11 rounded-xl border flex items-center justify-center ${
                      recording ? 'bg-rose-600 text-white animate-pulse' : ''
                    } disabled:opacity-50`}
                  >
                    {parseVoice.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : recording ? (
                      <Square size={18} />
                    ) : (
                      <Mic size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    aria-label={t('receipt')}
                    className="h-11 w-11 rounded-xl border flex items-center justify-center disabled:opacity-50"
                  >
                    {parseReceipt.isPending ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={onReceipt}
                  />
                </div>
                {recording && <p className="text-center text-xs text-rose-600">{t('recording')}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {draft.clarification && (
                  <p className="rounded-lg bg-amber-50 text-amber-800 px-3 py-2 text-xs">
                    ⚠️ {draft.clarification}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {(['expense', 'income'] as const).map(tp => (
                    <button
                      key={tp}
                      onClick={() => set({ type: tp, category_id: null })}
                      className={`rounded-xl border py-2 text-sm font-medium ${
                        draft.type === tp
                          ? tp === 'expense'
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-600 text-white'
                          : ''
                      }`}
                    >
                      {t(tp)}
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="text-xs text-muted-foreground">{t('amount')}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft.amount}
                    onChange={e => set({ amount: e.target.value })}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-lg font-semibold"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-muted-foreground">{t('category')}</span>
                  <select
                    value={draft.category_id ?? (draft.category_hint ? 'hint' : '')}
                    onChange={e => {
                      if (e.target.value === 'hint') set({ category_id: null })
                      else set({ category_id: e.target.value ? Number(e.target.value) : null, category_hint: null })
                    }}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{t('noCategory')}</option>
                    {draft.category_hint && !draft.category_id && (
                      <option value="hint">＋ {draft.category_hint}</option>
                    )}
                    {typeCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block rounded-xl border border-primary/40 bg-primary/5 p-2">
                  <span className="text-xs font-medium text-primary flex items-center gap-1">
                    💼 {t('wallet')}
                  </span>
                  <select
                    value={draft.wallet_id ?? ''}
                    onChange={e => set({ wallet_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm font-medium"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.icon ? `${w.icon} ` : ''}{w.name} · {formatMoney(w.balance ?? 0, w.currency)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-xs text-muted-foreground">{t('date')}</span>
                    <input
                      type="date"
                      value={draft.date ?? ''}
                      onChange={e => set({ date: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">{t('description')}</span>
                    <input
                      value={draft.description}
                      onChange={e => set({ description: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={reset} className="rounded-xl border px-4 py-2.5 text-sm">
                    {t('back')}
                  </button>
                  <button
                    onClick={onSave}
                    disabled={createTransaction.isPending || createCategory.isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    {createTransaction.isPending || createCategory.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t('save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
