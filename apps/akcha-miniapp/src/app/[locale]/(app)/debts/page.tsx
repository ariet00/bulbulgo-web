'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

import { DateRangeFilter } from '@/components/DateRangeFilter'
import { useDebts, useMe } from '@/hooks/queries'
import { useUpdateDebt } from '@/hooks/mutations'
import { resolveRange, type DateRange } from '@/lib/dateRange'
import { formatDate, formatMoney } from '@/lib/format'
import type { DebtType } from '@/types/akcha'

type Filter = 'all' | DebtType

export default function DebtsPage() {
  const t = useTranslations('debts')
  const { data: me } = useMe()

  const [filter, setFilter] = useState<Filter>('all')
  const [range, setRange] = useState<DateRange>({ preset: 'd30' })
  const [counterparty, setCounterparty] = useState<string>('all')

  const resolved = useMemo(() => resolveRange(range), [range])
  const { data: debts = [] } = useDebts({
    type: filter === 'all' ? undefined : filter,
    is_closed: false,
    ...resolved,
  })

  const update = useUpdateDebt()
  const currency = me?.currency_code ?? 'KGS'

  // Counterparty options from the loaded list; filter applied client-side.
  const counterparties = useMemo(() => {
    const set = new Set<string>()
    for (const d of debts) if (d.counterparty_name) set.add(d.counterparty_name)
    return [...set]
  }, [debts])
  const shownDebts = counterparty === 'all' ? debts : debts.filter(d => d.counterparty_name === counterparty)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{t('title')}</h1>

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
