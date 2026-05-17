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


export function dailyIncomeExpense(txs: Transaction[]): DailyPoint[] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const map = new Map<string, DailyPoint>()
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const k = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(k, { day: k, income: 0, expense: 0 })
  }
  for (const tx of txs) {
    const d = new Date(tx.date)
    const k = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
    const point = map.get(k)
    if (!point) continue
    if (tx.type === 'income') point.income += tx.amount
    else if (tx.type === 'expense') point.expense += tx.amount
  }
  return [...map.values()]
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
