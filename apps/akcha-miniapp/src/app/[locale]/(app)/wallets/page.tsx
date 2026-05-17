'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useMe, useWallets } from '@/hooks/queries'
import { useCreateWallet, useDeleteWallet } from '@/hooks/mutations'
import { formatMoney } from '@/lib/format'

export default function WalletsPage() {
  const t = useTranslations('wallets')
  const { data: wallets = [] } = useWallets()
  const { data: me } = useMe()
  const create = useCreateWallet()
  const del = useDeleteWallet()

  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  const onAdd = async () => {
    if (!name.trim()) return
    try {
      await create.mutateAsync({ name: name.trim(), currency: me?.currency_code ?? 'KGS' })
      setName('')
      setAdding(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <button onClick={() => setAdding(v => !v)} className="text-primary">
          <Plus size={20} />
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 border rounded-xl p-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('name')}
            className="flex-1 bg-background border rounded-md px-2 py-1 text-sm"
          />
          <button onClick={onAdd} disabled={create.isPending} className="text-primary text-sm px-3">
            ✓
          </button>
        </div>
      )}

      <ul className="divide-y border rounded-xl">
        {wallets.map(w => (
          <li key={w.id} className="flex items-center gap-3 p-3">
            <div className="text-2xl">{w.icon ?? '💵'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{w.name}</div>
              <div className="text-xs text-muted-foreground">{w.currency ?? 'KGS'}</div>
            </div>
            <div className="font-semibold">{formatMoney(w.balance ?? 0, w.currency)}</div>
            <button
              onClick={() => {
                if (confirm(t('delete_confirm'))) del.mutate(w.id)
              }}
              className="text-muted-foreground hover:text-rose-600"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
