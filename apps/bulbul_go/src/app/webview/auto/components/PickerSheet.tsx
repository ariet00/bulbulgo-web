'use client'

import { useMemo, useState } from 'react'
import type { AttributeOption } from '../lib/types'
import { pickLabel } from '../lib/format'
import { BottomSheet } from '../../components/BottomSheet'
import { Icon } from '../../components/icons'

// Пикер опций словаря (марка/модель): поиск, группа «Популярные» сверху
// (data.popular у топовых марок рынка), одиночный или множественный выбор.

export function PickerSheet({
    open,
    onClose,
    title,
    options,
    loading = false,
    selected,
    multi = false,
    onApply,
}: {
    open: boolean
    onClose: () => void
    title: string
    options: AttributeOption[]
    loading?: boolean
    selected: string[]
    multi?: boolean
    onApply: (values: string[]) => void
}) {
    const [query, setQuery] = useState('')
    const [picked, setPicked] = useState<string[]>(selected)

    // при каждом открытии стартуем с актуального выбора
    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setPicked(selected)
        setQuery('')
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return options
        return options.filter((o) =>
            pickLabel(o.label).toLowerCase().includes(q),
        )
    }, [options, query])

    const popular = filtered.filter((o) => o.popular)
    const rest = filtered.filter((o) => !o.popular)

    const toggle = (value: string) => {
        if (!multi) {
            onApply([value])
            onClose()
            return
        }
        setPicked((p) =>
            p.includes(value) ? p.filter((v) => v !== value) : [...p, value],
        )
    }

    const row = (o: AttributeOption) => {
        const active = picked.includes(o.value)
        return (
            <button
                key={o.id}
                onClick={() => toggle(o.value)}
                className="flex w-full items-center justify-between border-t py-3 text-left first:border-t-0"
            >
                <span className="text-[15px]">{pickLabel(o.label)}</span>
                <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-white transition-colors ${
                        active ? 'border-transparent' : 'border-muted-foreground/40'
                    }`}
                    style={active ? { background: 'var(--wv-primary)' } : undefined}
                >
                    {active && (
                        <Icon name="check" size={14} />
                    )}
                </span>
            </button>
        )
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={title}
            footer={
                multi ? (
                    <button
                        onClick={() => {
                            onApply(picked)
                            onClose()
                        }}
                        className="w-full rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90"
                        style={{ background: 'var(--wv-primary)' }}
                    >
                        Выбрать{picked.length ? ` (${picked.length})` : ''}
                    </button>
                ) : undefined
            }
        >
            <div className="sticky top-0 z-10 -mx-4 bg-card px-4 pb-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск"
                    className="w-full rounded-xl border bg-muted/40 px-3.5 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-[var(--wv-accent-border)]"
                />
            </div>

            {loading ? (
                <div className="space-y-3 py-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="wv-skeleton h-6 w-full rounded" />
                    ))}
                </div>
            ) : (
                <>
                    {popular.length > 0 && (
                        <>
                            <p className="pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Популярные
                            </p>
                            {popular.map(row)}
                            {rest.length > 0 && (
                                <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Все
                                </p>
                            )}
                        </>
                    )}
                    {rest.map(row)}
                    {!filtered.length && (
                        <p className="py-8 text-center text-[14px] text-muted-foreground">
                            Ничего не найдено
                        </p>
                    )}
                </>
            )}
        </BottomSheet>
    )
}
