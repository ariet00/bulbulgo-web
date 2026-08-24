// Форматирование: локализованные подписи каталога, двухвалютная цена,
// спек-строка карточки, относительное время.

import type { LabelMap, Listing } from './types'

export function getLocale(): string {
    if (typeof document !== 'undefined' && document.documentElement.lang) {
        return document.documentElement.lang
    }
    return 'ru'
}

/** Подпись из {lang: text} с фолбэком на ru (марки/модели заведены только в ru). */
export function pickLabel(map: LabelMap | null | undefined, locale = getLocale()): string {
    if (!map) return ''
    return map[locale] ?? map.ru ?? Object.values(map)[0] ?? ''
}

const NBSP = ' '

export function formatNumber(n: number): string {
    return new Intl.NumberFormat('ru-RU').format(n)
}

/** Основная цена в валюте объявления: «15 000 $» / «1 310 000 сом». */
export function formatPrice(price: number | null, code: string | null): string {
    if (price == null) return 'Цена не указана'
    const suffix = code === 'USD' ? '$' : code === 'KGS' ? 'сом' : (code ?? '')
    return `${formatNumber(Math.round(price))}${NBSP}${suffix}`.trim()
}

/** Пересчёт во «вторую» валюту по курсу (USD↔KGS): «≈ 1 311 750 сом». */
export function formatPriceAlt(
    price: number | null,
    code: string | null,
    rates: Record<string, number>,
): string | null {
    const usd = rates.USD
    if (price == null || !usd) return null
    if (code === 'USD') return `≈${NBSP}${formatNumber(Math.round(price * usd))}${NBSP}сом`
    if (code === 'KGS') return `≈${NBSP}${formatNumber(Math.round(price / usd))}${NBSP}$`
    return null
}

const attr = (l: Listing, key: string): unknown => l.attributes?.[key]

/** Спек-строка карточки: «2019 · 87 000 км · 2.5 л · Автомат · Слева». */
export function specLine(
    l: Listing,
    optionLabel: (key: string, value: string) => string,
): string {
    const parts: string[] = []
    const year = attr(l, 'year')
    if (year) parts.push(String(year))
    const mileage = attr(l, 'mileage')
    if (typeof mileage === 'number') parts.push(`${formatNumber(mileage)}${NBSP}км`)
    const vol = attr(l, 'engine_volume')
    if (vol) parts.push(`${vol}${NBSP}л`)
    const gearbox = attr(l, 'transmission')
    if (typeof gearbox === 'string') parts.push(optionLabel('transmission', gearbox))
    const steering = attr(l, 'steering')
    if (steering === 'right') parts.push(optionLabel('steering', 'right'))
    return parts.filter(Boolean).join(' · ')
}

export function timeAgo(iso: string | null): string {
    if (!iso) return ''
    const diffMs = Date.now() - new Date(iso).getTime()
    const min = Math.floor(diffMs / 60_000)
    if (min < 1) return 'только что'
    if (min < 60) return `${min} мин. назад`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h} ч. назад`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d} дн. назад`
    const mo = Math.floor(d / 30)
    if (mo < 12) return `${mo} мес. назад`
    return `${Math.floor(mo / 12)} г. назад`
}
