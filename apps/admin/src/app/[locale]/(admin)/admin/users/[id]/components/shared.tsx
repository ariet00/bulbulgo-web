'use client'

import { useState, type ReactNode } from 'react'
import { Activity } from 'lucide-react'
import { Button, Card, CardContent } from '@doska/ui'

export const PERIODS = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

// Active tab lives in the URL (?tab=wallet) so it survives refresh/back and
// can be shared as a link.

/* ────────────────────────── per-tab components (lazy: mount = fetch) ────────────────────────── */

export type PeriodProductProps = {
    uid: number
    period: string
    setPeriod: (v: string) => void
    product: string
    setProduct: (v: string) => void
}

/* ────────────────────────── analytics sub-components ────────────────────────── */

// Client-side row limiter — renders first `step` rows with a "show more" toggle
// so analytics tables stay compact instead of dumping hundreds of rows.
export function LimitedRows<T>({
    items,
    step = 10,
    children,
}: {
    items: T[]
    step?: number
    children: (rows: T[]) => ReactNode
}) {
    const [limit, setLimit] = useState(step)
    const visible = items.slice(0, limit)
    const rest = items.length - limit
    return (
        <div className="space-y-3">
            {children(visible)}
            {rest > 0 && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLimit(l => l + step)}
                    >
                        Показать ещё ({rest})
                    </Button>
                </div>
            )}
            {limit > step && rest <= 0 && (
                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setLimit(step)}>
                        Свернуть
                    </Button>
                </div>
            )}
        </div>
    )
}

export function Metric({
    label,
    value,
    accent,
    hint,
}: {
    label: string
    value: number
    accent?: 'green' | 'red'
    hint?: string
}) {
    const valueCls =
        accent === 'green'
            ? 'text-green-600 dark:text-green-400'
            : accent === 'red'
            ? 'text-red-600 dark:text-red-400'
            : ''
    return (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <div className={`mt-0.5 text-xl font-semibold tabular-nums ${valueCls}`}>{value}</div>
            {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
        </div>
    )
}

export function SummaryCard({
    title,
    value,
    icon: Icon,
}: {
    title: string
    value: number | undefined
    icon?: typeof Activity
}) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-4">
                {Icon && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {title}
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {value?.toLocaleString() ?? '—'}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/* ────────────────────────── per-tab components (lazy: mount = fetch) ────────────────────────── */
