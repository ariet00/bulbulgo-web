'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RegionItem } from '../lib/api'
import type { EffectiveAttribute, ListingFilters } from '../lib/types'
import { pickLabel } from '../lib/format'
import { BottomSheet } from '../../components/BottomSheet'
import { RegionField } from './wizard/fields'

// Полный набор фильтров (bottom-sheet): цена с валютой, диапазоны
// (год/пробег/объём), enum-атрибуты чипсами (any-of), bool — переключателями.
// Строится по метаданным каталога (is_filterable), «Показать N» — живой
// счётчик по текущему черновику фильтров.

/** Черновик значений: enum → массив, bool → true, int/decimal → {min,max}. */
export type FilterDraft = {
    priceMin?: number
    priceMax?: number
    priceCurrency: 'USD' | 'KGS'
    region?: RegionItem
    enums: Record<string, string[]>
    bools: Record<string, boolean>
    ranges: Record<string, { min?: number; max?: number }>
}

export function emptyDraft(): FilterDraft {
    return { priceCurrency: 'USD', enums: {}, bools: {}, ranges: {} }
}

export function draftToFilters(
    draft: FilterDraft,
    kind: ListingFilters['kind'],
    makeModel: { make?: string; models?: string[] },
): ListingFilters {
    const eq: Record<string, string | number | boolean> = {}
    const anyOf: Record<string, string[]> = {}
    if (makeModel.make) eq.make = makeModel.make
    if (makeModel.models?.length) anyOf.model = makeModel.models
    for (const [k, v] of Object.entries(draft.bools)) if (v) eq[k] = true
    for (const [k, vals] of Object.entries(draft.enums)) {
        if (vals.length === 1) eq[k] = vals[0]
        else if (vals.length > 1) anyOf[k] = vals
    }
    const ranges: ListingFilters['ranges'] = {}
    for (const [k, r] of Object.entries(draft.ranges)) {
        if (r.min !== undefined || r.max !== undefined) ranges[k] = r
    }
    return {
        kind,
        eq,
        anyOf,
        ranges,
        priceMin: draft.priceMin,
        priceMax: draft.priceMax,
        priceCurrency: draft.priceCurrency,
        regionId: draft.region?.id,
    }
}

export function countActiveFilters(draft: FilterDraft): number {
    let n = 0
    if (draft.priceMin !== undefined || draft.priceMax !== undefined) n++
    if (draft.region) n++
    n += Object.values(draft.enums).filter((v) => v.length).length
    n += Object.values(draft.bools).filter(Boolean).length
    n += Object.values(draft.ranges).filter(
        (r) => r.min !== undefined || r.max !== undefined,
    ).length
    return n
}

const num = (s: string): number | undefined => {
    const v = Number(s.replace(/\s/g, ''))
    return s.trim() === '' || Number.isNaN(v) ? undefined : v
}

function RangeInputs({
    value,
    onChange,
    placeholderMin = 'от',
    placeholderMax = 'до',
}: {
    value: { min?: number; max?: number }
    onChange: (v: { min?: number; max?: number }) => void
    placeholderMin?: string
    placeholderMax?: string
}) {
    const cls =
        'w-full rounded-xl border bg-muted/40 px-3 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-[var(--am-accent-border)]'
    return (
        <div className="flex gap-2">
            <input
                inputMode="numeric"
                placeholder={placeholderMin}
                defaultValue={value.min ?? ''}
                onChange={(e) => onChange({ ...value, min: num(e.target.value) })}
                className={cls}
            />
            <input
                inputMode="numeric"
                placeholder={placeholderMax}
                defaultValue={value.max ?? ''}
                onChange={(e) => onChange({ ...value, max: num(e.target.value) })}
                className={cls}
            />
        </div>
    )
}

export function FilterSheet({
    open,
    onClose,
    attributes,
    draft: outerDraft,
    onApply,
    countResults,
}: {
    open: boolean
    onClose: () => void
    /** filterable-атрибуты категории (без make/model — у них свои чипсы) */
    attributes: EffectiveAttribute[]
    draft: FilterDraft
    onApply: (draft: FilterDraft) => void
    /** живой счётчик результатов по черновику */
    countResults: (draft: FilterDraft) => Promise<number>
}) {
    const [draft, setDraft] = useState<FilterDraft>(outerDraft)
    const [count, setCount] = useState<number | null>(null)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setDraft(outerDraft)
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    // debounce живого счётчика
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    useEffect(() => {
        if (!open) return
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            countResults(draft)
                .then(setCount)
                .catch(() => setCount(null))
        }, 350)
        return () => {
            if (timer.current) clearTimeout(timer.current)
        }
    }, [draft, open, countResults])

    const visible = useMemo(
        () =>
            attributes.filter(
                (a) =>
                    a.is_filterable &&
                    a.role !== 'system' &&
                    !['make', 'model'].includes(a.key),
            ),
        [attributes],
    )

    const toggleEnum = (key: string, value: string) =>
        setDraft((d) => {
            const cur = d.enums[key] ?? []
            const next = cur.includes(value)
                ? cur.filter((v) => v !== value)
                : [...cur, value]
            return { ...d, enums: { ...d.enums, [key]: next } }
        })

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="Фильтры"
            footer={
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setDraft(emptyDraft())}
                        className="rounded-xl border px-4 py-3 text-[14px] font-medium text-muted-foreground active:bg-muted"
                    >
                        Сбросить
                    </button>
                    <button
                        onClick={() => {
                            onApply(draft)
                            onClose()
                        }}
                        className="flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90"
                        style={{ background: 'var(--am-accent)' }}
                    >
                        {count === null ? 'Показать' : `Показать ${count}`}
                    </button>
                </div>
            }
        >
            {/* Цена + валюта */}
            <section className="pb-4 pt-1">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[13px] font-semibold">Цена</p>
                    <div className="flex overflow-hidden rounded-lg border text-[12px] font-semibold">
                        {(['USD', 'KGS'] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() =>
                                    setDraft((d) => ({ ...d, priceCurrency: c }))
                                }
                                className="px-2.5 py-1"
                                style={
                                    draft.priceCurrency === c
                                        ? {
                                              background: 'var(--am-accent)',
                                              color: '#fff',
                                          }
                                        : undefined
                                }
                            >
                                {c === 'USD' ? '$' : 'сом'}
                            </button>
                        ))}
                    </div>
                </div>
                <RangeInputs
                    value={{ min: draft.priceMin, max: draft.priceMax }}
                    onChange={(v) =>
                        setDraft((d) => ({ ...d, priceMin: v.min, priceMax: v.max }))
                    }
                />
            </section>

            <section className="border-t py-4">
                <p className="mb-2 text-[13px] font-semibold">Город / регион</p>
                <RegionField
                    region={draft.region ?? null}
                    onChange={(r) =>
                        setDraft((d) => ({ ...d, region: r ?? undefined }))
                    }
                />
            </section>

            {visible.map((a) => (
                <section key={a.key} className="border-t py-4">
                    <p className="mb-2 text-[13px] font-semibold">
                        {pickLabel(a.label)}
                        {a.unit ? (
                            <span className="text-muted-foreground">
                                , {pickLabel(a.unit)}
                            </span>
                        ) : null}
                    </p>

                    {a.type === 'enum' || a.type === 'multi_enum' ? (
                        <div className="flex flex-wrap gap-1.5">
                            {a.options.map((o) => {
                                const active = (
                                    draft.enums[a.key] ?? []
                                ).includes(o.value)
                                return (
                                    <button
                                        key={o.id}
                                        onClick={() => toggleEnum(a.key, o.value)}
                                        className="rounded-full border px-3 py-1.5 text-[13px] transition-colors"
                                        style={
                                            active
                                                ? {
                                                      background:
                                                          'var(--am-accent-soft)',
                                                      borderColor:
                                                          'var(--am-accent-border)',
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
                    ) : a.type === 'bool' ? (
                        <button
                            onClick={() =>
                                setDraft((d) => ({
                                    ...d,
                                    bools: {
                                        ...d.bools,
                                        [a.key]: !d.bools[a.key],
                                    },
                                }))
                            }
                            className="flex w-full items-center justify-between"
                        >
                            <span className="text-[14px] text-muted-foreground">
                                Только с отметкой
                            </span>
                            <span
                                aria-hidden
                                className="relative h-6 w-10 rounded-full transition-colors"
                                style={{
                                    background: draft.bools[a.key]
                                        ? 'var(--am-accent)'
                                        : 'color-mix(in srgb, currentColor 20%, transparent)',
                                }}
                            >
                                <span
                                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                                    style={{
                                        left: draft.bools[a.key]
                                            ? 'calc(100% - 1.375rem)'
                                            : '0.125rem',
                                    }}
                                />
                            </span>
                        </button>
                    ) : (
                        <RangeInputs
                            value={draft.ranges[a.key] ?? {}}
                            onChange={(v) =>
                                setDraft((d) => ({
                                    ...d,
                                    ranges: { ...d.ranges, [a.key]: v },
                                }))
                            }
                        />
                    )}
                </section>
            ))}
        </BottomSheet>
    )
}
