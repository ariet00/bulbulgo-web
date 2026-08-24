import type { AdminReviewStatus, AdminReviewSubject } from '@/apis/admin'

// Типы «середины» взаимодействия — синхронно с `apps/reviews/constants.py`.
export const SUBJECT_TYPES: { value: string; label: string }[] = [
    { value: 'trip', label: 'Поездка' },
    { value: 'listing', label: 'Объявление' },
]

export const STATUSES: { value: string; label: string }[] = [
    { value: 'approved', label: 'Опубликован' },
    { value: 'hidden', label: 'Скрыт' },
]

// Слаги сервисов (mobile_services) — их проставляет бэкенд по объекту отзыва.
export const SERVICES: { value: string; label: string }[] = [
    { value: 'rideshare', label: 'Попутки' },
    { value: 'freight', label: 'Грузовые' },
    { value: 'bus', label: 'Автобусы' },
    { value: 'real_estate', label: 'Недвижимость' },
]

export function serviceLabel(value: string | null): string {
    if (!value) return '—'
    return SERVICES.find((s) => s.value === value)?.label ?? value
}

export function subjectTypeLabel(type: string | null): string {
    if (!type) return '—'
    return SUBJECT_TYPES.find((t) => t.value === type)?.label ?? type
}

/** Ссылка в админке на объект, за который оставлен отзыв. */
export function subjectHref(
    subjectType: string | null,
    subjectId: number | null,
): string | null {
    if (!subjectType || subjectId == null) return null
    if (subjectType === 'trip') return `/admin/trips/${subjectId}`
    if (subjectType === 'listing') return `/admin/marketplace/listings/${subjectId}`
    return null
}

export function subjectTitle(
    subject: AdminReviewSubject | null,
    subjectId: number | null,
): string {
    return subject?.title || (subjectId != null ? `#${subjectId}` : '—')
}

export function StatusBadge({ status }: { status: AdminReviewStatus }) {
    const map: Record<AdminReviewStatus, { label: string; cls: string }> = {
        approved: { label: 'Опубликован', cls: 'bg-green-100 text-green-700' },
        hidden: { label: 'Скрыт', cls: 'bg-gray-200 text-gray-600' },
    }
    const s = map[status] ?? map.approved
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
            {s.label}
        </span>
    )
}

/** Оценка звёздами — в таблице читается быстрее числа. */
export function RatingStars({ rating }: { rating: number }) {
    return (
        <span className="whitespace-nowrap text-amber-500" title={`${rating} из 5`}>
            {'★'.repeat(rating)}
            <span className="text-muted-foreground">{'☆'.repeat(Math.max(0, 5 - rating))}</span>
        </span>
    )
}
