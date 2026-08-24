'use client'

import { Input, Label } from '@doska/ui'
import type { LabelMap, McCategoryNode } from '@/apis/marketplace'

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

/** Дерево категорий в плоский список (с уровнем вложенности) — для селектов. */
export function flattenTree(
    nodes: McCategoryNode[] | undefined,
    depth = 0,
): { node: McCategoryNode; depth: number }[] {
    return (nodes ?? []).flatMap((node) => [
        { node, depth },
        ...flattenTree(node.children, depth + 1),
    ])
}

/** Пути от корня до узла включительно: 'real_estate.land' → [real_estate, land]. */
export function ancestorSlugs(path: string): string[] {
    return path.split('.')
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
