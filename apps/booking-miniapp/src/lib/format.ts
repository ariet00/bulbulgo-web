import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatPrice(amount: string | number, currency = 'KZT'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(n)) return String(amount)
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'd MMMM, EEEE', { locale: ru })
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'd MMM, HH:mm', { locale: ru })
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h} ч ${m} мин`
  if (h) return `${h} ч`
  return `${m} мин`
}
