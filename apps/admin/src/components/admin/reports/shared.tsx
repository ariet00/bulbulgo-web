'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'

export const REPORT_PERIODS = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

export function SummaryCard({
    title,
    value,
    prev,
    suffix = '',
    goodWhenUp = false,
    hint,
}: {
    title: string
    value: number | undefined
    prev?: number
    suffix?: string
    goodWhenUp?: boolean
    hint?: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-2xl font-semibold">
                        {value ?? '—'}
                        {value !== undefined ? suffix : ''}
                    </div>
                    <DeltaBadge value={value} prev={prev} goodWhenUp={goodWhenUp} />
                </div>
                {hint && <div className="text-xs text-amber-600 dark:text-amber-400">{hint}</div>}
            </CardContent>
        </Card>
    )
}

// Δ к окну той же длины перед периодом. goodWhenUp: рост — это хорошо
// (подтверждения, выплаты) или плохо (ошибки, отклонения).
export function DeltaBadge({
    value,
    prev,
    goodWhenUp,
}: {
    value: number | undefined
    prev: number | undefined
    goodWhenUp: boolean
}) {
    if (value === undefined || prev === undefined) return null
    if (prev === 0 && value === 0) return null
    if (prev === 0) return <span className="text-xs text-muted-foreground">новое</span>
    const pct = Math.round(((value - prev) / prev) * 100)
    if (pct === 0) return <span className="text-xs text-muted-foreground">±0%</span>
    const good = pct > 0 ? goodWhenUp : !goodWhenUp
    return (
        <span
            className={`text-xs font-medium ${
                good ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
            title={`Прошлый период: ${prev}`}
        >
            {pct > 0 ? '+' : ''}
            {pct}%
        </span>
    )
}
