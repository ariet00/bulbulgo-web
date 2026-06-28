'use client'

import { Input, Label } from '@doska/ui'
import type { LabelMap } from '@/apis/marketplace'

export const LANGS: { code: string; name: string }[] = [
    { code: 'ru', name: 'RU' },
    { code: 'ky', name: 'KY' },
    { code: 'en', name: 'EN' },
]

/** Best-effort display label: ru → ky → en → first value → fallback. */
export function pickLabel(map?: LabelMap | null, fallback = ''): string {
    if (!map) return fallback
    return map.ru || map.ky || map.en || Object.values(map)[0] || fallback
}

/** Three small inputs (RU/KY/EN) editing a LabelMap. */
export function LabelInputs({
    value,
    onChange,
    label,
    placeholder,
}: {
    value: LabelMap
    onChange: (next: LabelMap) => void
    label: string
    placeholder?: string
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="grid grid-cols-3 gap-2">
                {LANGS.map((l) => (
                    <div key={l.code} className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground">{l.name}</span>
                        <Input
                            value={value?.[l.code] ?? ''}
                            placeholder={placeholder}
                            onChange={(e) => {
                                const next = { ...(value ?? {}) }
                                if (e.target.value) next[l.code] = e.target.value
                                else delete next[l.code]
                                onChange(next)
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
