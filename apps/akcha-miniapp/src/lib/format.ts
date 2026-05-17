import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const CODE_TO_INTL: Record<string, string> = {
  KGS: 'KGS',
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
  KZT: 'KZT',
  CNY: 'CNY',
}

export function formatMoney(amount: number | string, code: string | null = 'KGS'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(n)) return String(amount)
  const cur = code && CODE_TO_INTL[code.toUpperCase()] ? code.toUpperCase() : 'KGS'
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: n === Math.trunc(n) ? 0 : 2,
    }).format(n)
  } catch {
    return `${n} ${cur}`
  }
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'd MMMM yyyy', { locale: ru })
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'd MMM, HH:mm', { locale: ru })
}

export function startOfMonthIso(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
