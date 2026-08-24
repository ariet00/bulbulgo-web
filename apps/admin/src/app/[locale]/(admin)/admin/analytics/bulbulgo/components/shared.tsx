'use client'

import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Link, useRouter, usePathname } from '@doska/i18n'

// Page size for every paginated card on the BulBul Go analytics page.
export const LIST_SIZE = 20

export const PERIODS: Array<{ value: string; label: string }> = [
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

// Russian labels for the driver/passenger role dimension.
export const ROLE_LABELS: Record<string, string> = {
    driver: 'водители',
    passenger: 'пассажиры',
    unknown: '—',
}

export const roleLabel = (role: string | null) => (role ? ROLE_LABELS[role] ?? role : '—')

// Props every tab section takes: the global period plus the nonce that resets
// per-card overrides back to it.
export type TabSectionProps = {
    period: string
    resetNonce: number
}

// Per-card period override. Falls back to the global period and resets itself
// (back to global) whenever the global period changes — keyed by `resetNonce`,
// which the top-level selector bumps so even re-picking the same global value
// clears every card's override.
export function useCardPeriod(globalPeriod: string, resetNonce: number) {
    const [override, setOverride] = useState<string | null>(null)
    const [seenNonce, setSeenNonce] = useState(resetNonce)
    if (seenNonce !== resetNonce) {
        setSeenNonce(resetNonce)
        setOverride(null)
    }
    return [override ?? globalPeriod, setOverride, override !== null] as const
}

// Tab selection synced to a URL query param, so it survives back/forward, a
// reload, and is shareable. Reads the param (falling back to `defaultValue`)
// and writes via a scroll-preserving replace (no history entry per click).
export function useTabParam(key: string, defaultValue: string) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const value = searchParams.get(key) ?? defaultValue
    const set = (v: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, v)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
    return [value, set] as const
}

export function PeriodPicker({
    value,
    onChange,
    overridden,
    size = 'sm',
}: {
    value: string
    onChange: (p: string | null) => void
    overridden?: boolean
    size?: 'sm' | 'default'
}) {
    return (
        <div className="flex gap-1 items-center flex-wrap">
            {PERIODS.map(p => (
                <Button
                    key={p.value}
                    variant={value === p.value ? 'default' : 'outline'}
                    size={size}
                    className={size === 'sm' ? 'h-7 px-2 text-xs' : undefined}
                    onClick={() => onChange(p.value)}
                >
                    {p.label}
                </Button>
            ))}
            {overridden && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-xs text-muted-foreground"
                    onClick={() => onChange(null)}
                    title="Сбросить к общему периоду"
                >
                    ↺
                </Button>
            )}
        </div>
    )
}

// Loading / empty / content — the three states every card body has.
export function AsyncBlock({
    loading,
    empty,
    children,
}: {
    loading: boolean
    empty: boolean
    children: ReactNode
}) {
    if (loading) return <div>Загрузка…</div>
    if (empty) return <div className="text-muted-foreground">Нет данных</div>
    return <>{children}</>
}

export function StatCard({
    title,
    value,
    loading,
    hint,
}: {
    title: string
    value: number | string | undefined
    loading?: boolean
    hint?: string | string[]
}) {
    const hints = hint === undefined ? [] : Array.isArray(hint) ? hint : [hint]
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                    {loading
                        ? '…'
                        : value === undefined || value === null
                        ? '—'
                        : typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                </div>
                {hints.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {hints.map((h, i) => (
                            <div key={i} className="truncate" title={h}>
                                {h}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function UserAvatar({
    url,
    name,
    className = 'h-7 w-7',
}: {
    url?: string | null
    name?: string | null
    className?: string
}) {
    if (url) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={url}
                alt=""
                className={`${className} shrink-0 rounded-full bg-muted object-cover`}
            />
        )
    }
    return (
        <div
            className={`${className} flex shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground`}
        >
            {(name ?? '?').slice(0, 1).toUpperCase()}
        </div>
    )
}

// Avatar + name + #id on one line, linking to the user's admin page.
export function UserInlineLink({
    userId,
    name,
    avatarUrl,
}: {
    userId: number
    name?: string | null
    avatarUrl?: string | null
}) {
    return (
        <Link
            href={`/admin/users/${userId}`}
            className="flex items-center gap-2 hover:underline"
        >
            <UserAvatar url={avatarUrl} name={name} />
            <span>{name ?? `user #${userId}`}</span>
            <span className="text-xs text-muted-foreground tabular-nums">#{userId}</span>
        </Link>
    )
}
