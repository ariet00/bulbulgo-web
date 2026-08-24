import type { AdminComplaintTarget, AdminComplaintStatus } from '@/apis/admin'

export const TARGET_TYPES: { value: string; label: string }[] = [
    { value: 'trip', label: 'Поездка' },
    { value: 'user', label: 'Пользователь' },
    { value: 'listing', label: 'Объявление' },
    { value: 'fuel_station', label: 'АЗС' },
]

export const STATUSES: { value: string; label: string }[] = [
    { value: 'open', label: 'Открыта' },
    { value: 'resolved', label: 'Решена' },
    { value: 'dismissed', label: 'Отклонена' },
]

// Report screens in the mobile app (open set — the backend accepts any string).
export const COMPLAINT_CONTEXTS: { value: string; label: string }[] = [
    { value: 'rideshare', label: 'Попутки' },
    { value: 'freight', label: 'Грузовые' },
    { value: 'real_estate', label: 'Недвижимость' },
    { value: 'user', label: 'Пользователь' },
]

export function contextLabel(value: string): string {
    return COMPLAINT_CONTEXTS.find((c) => c.value === value)?.label ?? value
}

export function targetHref(t: AdminComplaintTarget | null): string | null {
    if (!t || !t.exists) return null
    if (t.type === 'user') return `/admin/users/${t.id}`
    if (t.type === 'trip') return `/admin/trips/${t.id}`
    if (t.type === 'listing') return `/admin/marketplace/listings/${t.id}`
    if (t.type === 'fuel_station') return '/admin/fuel/stations'
    return null
}

export function targetTypeLabel(type: string): string {
    return TARGET_TYPES.find((t) => t.value === type)?.label ?? type
}

export function StatusBadge({ status }: { status: AdminComplaintStatus }) {
    const map: Record<AdminComplaintStatus, { label: string; cls: string }> = {
        open: { label: 'Открыта', cls: 'bg-amber-100 text-amber-700' },
        resolved: { label: 'Решена', cls: 'bg-green-100 text-green-700' },
        dismissed: { label: 'Отклонена', cls: 'bg-gray-200 text-gray-600' },
    }
    const s = map[status] ?? map.open
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
            {s.label}
        </span>
    )
}
