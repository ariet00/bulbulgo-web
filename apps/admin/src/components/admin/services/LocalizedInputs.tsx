'use client'

import { Input, Label } from '@doska/ui'
import type { LocalizedText } from '@/apis/admin'

/// Локали, которые админка заполняет для любых мультиязычных текстов
/// (названия сервисов, описания, заголовки групп).
export const LANGS = [
    { code: 'ru', name: 'RU' },
    { code: 'ky', name: 'KY' },
    { code: 'en', name: 'EN' },
]

/** Строка ввода мультиязычного текста: по полю на локаль. */
export function LocalizedInputs({
    value,
    onChange,
    label,
}: {
    value: LocalizedText
    onChange: (next: LocalizedText) => void
    label: string
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="grid grid-cols-3 gap-2">
                {LANGS.map((l) => (
                    <div key={l.code} className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground">
                            {l.name}
                        </span>
                        <Input
                            value={value?.[l.code] ?? ''}
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
