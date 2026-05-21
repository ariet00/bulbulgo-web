import type { FinanceCategory, Transaction } from '@/types/akcha'

export interface PiePoint {
  name: string
  value: number
  color?: string
}

export interface DailyPoint {
  day: string  // dd.MM
  income: number
  expense: number
}

export interface MonthPoint {
  month: string  // MMM yyyy
  net: number
}

const PALETTE = [
  '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6',
  '#ec4899', '#6366f1', '#84cc16', '#64748b', '#0ea5e9', '#f43f5e',
]


export function expensesByCategory(
  txs: Transaction[],
  cats: FinanceCategory[],
): PiePoint[] {
  const catMap = new Map(cats.map(c => [c.id, c]))
  const byCat = new Map<string, { total: number; color?: string }>()
  for (const tx of txs) {
    if (tx.type !== 'expense') continue
    const cat = tx.category_id ? catMap.get(tx.category_id) : null
    const key = cat?.name ?? 'Без категории'
    const entry = byCat.get(key) ?? { total: 0, color: cat?.color ?? undefined }
    entry.total += tx.amount
    byCat.set(key, entry)
  }
  return [...byCat.entries()]
    .map(([name, { total, color }], i) => ({
      name,
      value: Math.round(total),
      color: color ?? PALETTE[i % PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value)
}


const dayKey = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`

/**
 * Daily income/expense buckets across [from, to]. Defaults to the current month
 * when bounds are omitted. Caps at 120 buckets to keep the chart readable for
 * long ranges.
 */
export function dailyIncomeExpense(txs: Transaction[], from?: string, to?: string): DailyPoint[] {
  const now = new Date()
  const end = to ? new Date(to) : now
  const start = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1)
  start.setHours(0, 0, 0, 0)

  const map = new Map<string, DailyPoint>()
  let guard = 0
  for (let d = new Date(start); d <= end && guard < 120; d.setDate(d.getDate() + 1), guard++) {
    const k = dayKey(d)
    map.set(k, { day: k, income: 0, expense: 0 })
  }
  for (const tx of txs) {
    const point = map.get(dayKey(new Date(tx.date)))
    if (!point) continue
    if (tx.type === 'income') point.income += tx.amount
    else if (tx.type === 'expense') point.expense += tx.amount
  }
  return [...map.values()]
}

export interface DateGroup {
  date: string // ISO 'YYYY-MM-DD'
  items: Transaction[]
}

/** Bucket transactions by calendar day (local), newest day first. */
export function groupByDate(txs: Transaction[]): DateGroup[] {
  const sorted = [...txs].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const groups = new Map<string, Transaction[]>()
  for (const tx of sorted) {
    const d = new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const bucket = groups.get(key)
    if (bucket) bucket.push(tx)
    else groups.set(key, [tx])
  }
  return [...groups.entries()].map(([date, items]) => ({ date, items }))
}


export function monthlyNet(txs: Transaction[], months = 6): MonthPoint[] {
  const now = new Date()
  const points: MonthPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
    points.push({ month: label, net: 0 })
  }
  for (const tx of txs) {
    const d = new Date(tx.date)
    const idx = months - 1 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()))
    if (idx < 0 || idx >= months) continue
    const sign = tx.type === 'income' ? 1 : tx.type === 'expense' ? -1 : 0
    points[idx].net += sign * tx.amount
  }
  return points.map(p => ({ ...p, net: Math.round(p.net) }))
}
