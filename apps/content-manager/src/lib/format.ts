import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? d : null
}

/** "3 сент., 14:50" */
export function formatDateTime(value: string | Date | undefined | null): string {
  const d = toDate(value)
  return d ? format(d, 'd MMM, HH:mm', { locale: ru }) : ''
}

/** "5 минут назад" — for feeds where recency matters more than the date. */
export function formatRelative(value: string | Date | undefined | null): string {
  const d = toDate(value)
  return d ? formatDistanceToNowStrict(d, { locale: ru, addSuffix: true }) : ''
}

/** 12 345 → "12 345", 1 234 567 → "1,2 млн" */
export function formatCount(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return String(value)
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} млн`
  if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} тыс.`
  return new Intl.NumberFormat('ru-RU').format(n)
}
