'use client'

import { Button } from '@doska/ui'

// Зеркало backend/shared/products.py:Product (+ unknown — события без
// атрибуции). Держать в синхроне.
export const PRODUCTS = [
    { value: '', label: 'Все' },
    { value: 'bulbulgo', label: 'bulbulgo' },
    { value: 'booking', label: 'booking' },
    { value: 'akcha', label: 'akcha' },
    { value: 'staff', label: 'staff' },
    { value: 'marketplace', label: 'marketplace' },
    { value: 'tglab', label: 'tglab' },
    { value: 'content_manager', label: 'content_manager' },
    { value: 'admin', label: 'admin' },
    { value: 'moderator', label: 'moderator' },
    { value: 'unknown', label: 'unknown' },
] as const

// Клиенты (ось analytics_events.client): канонические значения X-Client.
// Slug'и конкретных ботов сюда не входят — их фильтруют текстовым полем.
export const CLIENTS = [
    { value: '', label: 'Все' },
    { value: 'bulbulgo', label: 'bulbulgo (app)' },
    { value: 'booking', label: 'booking (miniapp)' },
    { value: 'akcha', label: 'akcha (miniapp)' },
    { value: 'staff', label: 'staff (miniapp)' },
    { value: 'tglab', label: 'tglab' },
    { value: 'admin', label: 'admin' },
] as const

export function ProductSelector({
    value,
    onChange,
}: {
    value: string
    onChange: (next: string) => void
}) {
    return (
        <div className="flex gap-1 flex-wrap">
            {PRODUCTS.map(p => (
                <Button
                    key={p.value || 'all'}
                    variant={value === p.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onChange(p.value)}
                >
                    {p.label}
                </Button>
            ))}
        </div>
    )
}

export function ClientSelector({
    value,
    onChange,
}: {
    value: string
    onChange: (next: string) => void
}) {
    return (
        <div className="flex gap-1 flex-wrap">
            {CLIENTS.map(c => (
                <Button
                    key={c.value || 'all'}
                    variant={value === c.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onChange(c.value)}
                >
                    {c.label}
                </Button>
            ))}
        </div>
    )
}
