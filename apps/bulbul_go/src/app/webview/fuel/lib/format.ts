// Форматирование и цветовая система статусов «Где заправка».
// Лейблы enum'ов приходят из /fuel/meta (мультиязычные) — здесь только
// отображение: цвета, расстояние, относительное время.

import { currentLocale } from '../../bridge'
import type { FuelStatus, MetaOption } from './types'

/** Цвет статуса (совпадает с переменными в fuel.css). */
export const STATUS_COLOR: Record<FuelStatus, string> = {
    available: 'var(--fl-ok)',
    incoming: 'var(--fl-soon)',
    queue: 'var(--fl-warn)',
    out: 'var(--fl-bad)',
}

export function metaLabel(options: MetaOption[] | undefined, value: string): string {
    const locale = currentLocale()
    const opt = options?.find((o) => o.value === value)
    return opt?.label[locale] || opt?.label.ru || value
}

export function formatDistance(km: number | null): string {
    if (km == null) return ''
    if (km < 1) return `${Math.round(km * 1000)} м`
    return `${km < 10 ? km.toFixed(1) : Math.round(km)} км`
}

export function formatPrice(price: number | null): string {
    if (price == null) return ''
    return `${price % 1 ? price.toFixed(1) : price} с`
}

/** «только что» / «N мин назад» / «N ч назад» — свежесть репорта. */
export function timeAgo(iso: string): string {
    const minutes = Math.max(
        0,
        Math.round((Date.now() - new Date(iso).getTime()) / 60_000),
    )
    if (minutes < 2) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    const hours = Math.round(minutes / 60)
    return `${hours} ч назад`
}
