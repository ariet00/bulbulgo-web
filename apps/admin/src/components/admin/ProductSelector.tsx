'use client'

import { Button } from '@doska/ui'

export const PRODUCTS = [
    { value: '', label: 'Все' },
    { value: 'bulbulgo', label: 'bulbulgo' },
    { value: 'booking', label: 'booking' },
    { value: 'akcha', label: 'akcha' },
    { value: 'staff', label: 'staff' },
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
