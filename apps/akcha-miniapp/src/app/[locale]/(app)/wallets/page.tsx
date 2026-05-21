'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useMe, useWallets } from '@/hooks/queries'
import {
  useCreateWallet,
  useDeleteWallet,
  useSetDefaultWallet,
  useUpdateWallet,
} from '@/hooks/mutations'
import { formatMoney } from '@/lib/format'
import type { Wallet } from '@/types/akcha'

const MAX_WALLETS = 5
const CURRENCIES = ['KGS', 'USD', 'EUR', 'RUB', 'KZT', 'CNY']
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#ef4444', '#64748b']

export default function WalletsPage() {
  const t = useTranslations('wallets')
  const { data: wallets = [] } = useWallets()
  const { data: me } = useMe()
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const del = useDeleteWallet()
  const setDefault = useSetDefaultWallet()

  const defaultWalletId = me?.settings?.data?.default_wallet_id as number | undefined
  const primaryCurrency = me?.currency_code ?? 'KGS'
  const atLimit = wallets.length >= MAX_WALLETS

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState(primaryCurrency)

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('')

  const onAdd = async () => {
    if (!name.trim()) return
    try {
      await create.mutateAsync({
        name: name.trim(),
        balance: balance ? parseFloat(balance) : 0,
        currency,
      })
      setName('')
      setBalance('')
      setCurrency(primaryCurrency)
      setAdding(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    }
  }

  const startEdit = (w: Wallet) => {
    setEditId(w.id)
    setEditName(w.name)
    setEditIcon(w.icon ?? '')
    setEditColor(w.color ?? COLORS[0])
  }

  const onSaveEdit = async () => {
    if (editId == null || !editName.trim()) return
    try {
      await update.mutateAsync({
        id: editId,
        payload: { name: editName.trim(), icon: editIcon || null, color: editColor || null },
      })
      setEditId(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        {!atLimit && (
          <button onClick={() => setAdding(v => !v)} className="text-primary" aria-label={t('add')}>
            <Plus size={20} />
          </button>
        )}
      </div>

      {atLimit && <p className="text-xs text-muted-foreground">{t('limitReached', { max: MAX_WALLETS })}</p>}

      {adding && !atLimit && (
        <div className="space-y-2 border rounded-xl p-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('name')}
            className="w-full bg-background border rounded-md px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              placeholder={t('initialBalance')}
              className="flex-1 bg-background border rounded-md px-2 py-1.5 text-sm"
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-background border rounded-md px-2 py-1.5 text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="text-sm text-muted-foreground px-3">
              {t('cancelShort')}
            </button>
            <button
              onClick={onAdd}
              disabled={create.isPending || !name.trim()}
              className="rounded-md bg-primary text-primary-foreground text-sm px-4 py-1.5 disabled:opacity-50"
            >
              {t('add')}
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {wallets.map(w => {
          const isDefault = w.id === defaultWalletId
          if (editId === w.id) {
            return (
              <li key={w.id} className="space-y-2 border rounded-xl p-3">
                <div className="flex gap-2">
                  <input
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    placeholder="💵"
                    maxLength={2}
                    className="w-12 text-center bg-background border rounded-md px-2 py-1.5 text-lg"
                  />
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder={t('name')}
                    className="flex-1 bg-background border rounded-md px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`h-6 w-6 rounded-full border-2 ${editColor === c ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditId(null)} className="text-sm text-muted-foreground px-3">
                    {t('cancelShort')}
                  </button>
                  <button
                    onClick={onSaveEdit}
                    disabled={update.isPending || !editName.trim()}
                    className="rounded-md bg-primary text-primary-foreground text-sm px-4 py-1.5 disabled:opacity-50"
                  >
                    {t('saveShort')}
                  </button>
                </div>
              </li>
            )
          }
          return (
            <li
              key={w.id}
              className="flex items-center gap-3 border rounded-xl p-3"
              style={w.color ? { borderLeft: `4px solid ${w.color}` } : undefined}
            >
              <div className="text-2xl">{w.icon ?? '💵'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{w.name}</span>
                  {isDefault && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {t('default')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{w.currency ?? 'KGS'}</div>
              </div>
              <div className="font-semibold">{formatMoney(w.balance ?? 0, w.currency)}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {!isDefault && (
                  <button
                    onClick={() => setDefault.mutate(w.id)}
                    disabled={setDefault.isPending}
                    title={t('setDefault')}
                    className="hover:text-amber-500"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button onClick={() => startEdit(w)} title={t('edit')} className="hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('delete_confirm'))) del.mutate(w.id)
                  }}
                  className="hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
