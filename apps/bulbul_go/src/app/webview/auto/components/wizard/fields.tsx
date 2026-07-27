'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchRegions, type RegionItem } from '../../lib/api'
import { pickLabel } from '../../lib/format'
import type { EffectiveAttribute } from '../../lib/types'
import { BottomSheet } from '../../../components/BottomSheet'

// Поля формы подачи: подпись + чипсы-enum / переключатель / числовой инпут,
// плюс пикер региона с поиском. Рендер атрибутов — по метаданным каталога.

export function FieldLabel({
    attr,
    required,
}: {
    attr: EffectiveAttribute
    required: boolean
}) {
    return (
        <p className="mb-2 text-[13px] font-semibold">
            {pickLabel(attr.label)}
            {attr.unit ? (
                <span className="font-normal text-muted-foreground">
                    , {pickLabel(attr.unit)}
                </span>
            ) : null}
            {required && <span style={{ color: 'var(--am-accent)' }}> *</span>}
        </p>
    )
}

export function EnumChips({
    attr,
    value,
    onChange,
}: {
    attr: EffectiveAttribute
    value: string | undefined
    onChange: (v: string | undefined) => void
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {attr.options.map((o) => {
                const active = value === o.value
                return (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => onChange(active ? undefined : o.value)}
                        className="rounded-full border px-3 py-1.5 text-[13px] transition-colors"
                        style={
                            active
                                ? {
                                      background: 'var(--am-accent-soft)',
                                      borderColor: 'var(--am-accent-border)',
                                      color: 'var(--am-accent)',
                                      fontWeight: 600,
                                  }
                                : undefined
                        }
                    >
                        {pickLabel(o.label)}
                    </button>
                )
            })}
        </div>
    )
}

export function BoolToggle({
    label,
    value,
    onChange,
}: {
    label: string
    value: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className="flex w-full items-center justify-between py-1"
        >
            <span className="text-[14px]">{label}</span>
            <span
                aria-hidden
                className="relative h-6 w-10 rounded-full transition-colors"
                style={{
                    background: value
                        ? 'var(--am-accent)'
                        : 'color-mix(in srgb, currentColor 20%, transparent)',
                }}
            >
                <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                    style={{
                        left: value ? 'calc(100% - 1.375rem)' : '0.125rem',
                    }}
                />
            </span>
        </button>
    )
}

export const inputCls =
    'w-full rounded-xl border bg-muted/40 px-3.5 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-[var(--am-accent-border)]'

export function NumberInput({
    value,
    onChange,
    placeholder,
    decimal = false,
}: {
    value: number | undefined
    onChange: (v: number | undefined) => void
    placeholder?: string
    decimal?: boolean
}) {
    return (
        <input
            inputMode={decimal ? 'decimal' : 'numeric'}
            placeholder={placeholder}
            defaultValue={value ?? ''}
            onChange={(e) => {
                const raw = e.target.value.replace(/\s/g, '').replace(',', '.')
                const n = decimal ? parseFloat(raw) : parseInt(raw, 10)
                onChange(Number.isNaN(n) ? undefined : n)
            }}
            className={inputCls}
        />
    )
}

/** Шит выбора региона с поиском — используется и формой подачи, и
 * пополевым редактированием на странице владельца. */
export function RegionSheet({
    open,
    onClose,
    onPick,
}: {
    open: boolean
    onClose: () => void
    onPick: (r: RegionItem) => void
}) {
    const [query, setQuery] = useState('')
    const [items, setItems] = useState<RegionItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return
        setLoading(true)
        const t = setTimeout(() => {
            fetchRegions(query)
                .then(setItems)
                .catch(() => setItems([]))
                .finally(() => setLoading(false))
        }, 250)
        return () => clearTimeout(t)
    }, [open, query])

    return (
        <BottomSheet open={open} onClose={onClose} title="Город / регион">
            <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск"
                    className={inputCls}
                />
            </div>
            {loading ? (
                <div className="space-y-3 py-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="am-skeleton h-6 rounded" />
                    ))}
                </div>
            ) : (
                items.map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                            onPick(r)
                            onClose()
                        }}
                        className="block w-full border-t py-3 text-left text-[15px] first:border-t-0"
                    >
                        {r.name}
                    </button>
                ))
            )}
        </BottomSheet>
    )
}

export function RegionField({
    region,
    onChange,
}: {
    region: RegionItem | null
    onChange: (r: RegionItem | null) => void
}) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`${inputCls} flex items-center justify-between text-left`}
            >
                <span className={region ? '' : 'text-muted-foreground'}>
                    {region?.name ?? 'Город / регион'}
                </span>
                <span aria-hidden className="text-muted-foreground">
                    ▾
                </span>
            </button>
            <RegionSheet
                open={open}
                onClose={() => setOpen(false)}
                onPick={(r) => onChange(r)}
            />
        </>
    )
}

export type ModelConstraints = NonNullable<
    import('../../lib/types').AttributeOption['constraints']
>

/** Сужение enum-атрибута по constraints выбранной модели: у Camry остаётся
 * только седан, у электро-модели — только electric. ГБО-вариант (gas_petrol)
 * допустим у всех бензиновых — его не вырезаем. */
export function applyModelConstraints(
    attr: EffectiveAttribute,
    constraints: ModelConstraints | null,
): EffectiveAttribute {
    const allowed = constraints?.[attr.key]
    if (!Array.isArray(allowed) || attr.options.length === 0) return attr
    const ok = new Set(allowed)
    if (attr.key === 'fuel' && ok.has('petrol')) ok.add('gas_petrol')
    const options = attr.options.filter((o) => ok.has(o.value))
    return options.length ? { ...attr, options } : attr
}

/** Границы года из constraints модели ({min,max}), null — нет данных. */
export function modelYearRange(
    constraints: ModelConstraints | null,
): { min?: number; max?: number } | null {
    const y = constraints?.year
    return y && !Array.isArray(y) ? y : null
}

/** Проверка условной видимости (visible_when из каталога) по текущим значениям
 * формы — у электромобиля не спрашиваем объём двигателя и ГБО. */
export function isAttrVisible(
    a: EffectiveAttribute,
    values: Record<string, unknown>,
): boolean {
    const cond = a.visible_when
    if (!cond) return true
    const v = values[cond.key]
    if (v === undefined || v === null || v === '') return true // ещё не выбрано
    if (cond.in) return cond.in.includes(String(v))
    if (cond.not_in) return !cond.not_in.includes(String(v))
    return true
}

/** Атрибуты стороны offer для шага «Параметры» — обязательные сверху;
 * зависимые (visible_when) отфильтровываются по текущим значениям. */
export function useParamAttrs(
    attrs: EffectiveAttribute[],
    values: Record<string, unknown> = {},
) {
    return useMemo(() => {
        const skip = new Set(['make', 'model', 'year'])
        const visible = attrs.filter(
            (a) =>
                a.role !== 'system' &&
                !skip.has(a.key) &&
                (a.applies_to === 'offer' || a.applies_to === 'both') &&
                isAttrVisible(a, values),
        )
        const required = visible.filter((a) =>
            a.required_sides.includes('offer'),
        )
        const optional = visible.filter(
            (a) => !a.required_sides.includes('offer'),
        )
        return { required, optional }
    }, [attrs, values])
}
