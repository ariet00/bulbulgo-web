'use client'

import type { Listing } from '../lib/types'
import {
    formatPrice,
    formatPriceAlt,
    pickLabel,
    specLine,
    timeAgo,
} from '../lib/format'
import { Icon } from '../../components/icons'

// Карточка ленты: фото-обложка, цена (моно, крупно) + пересчёт во вторую
// валюту, заголовок, спек-строка, регион и свежесть. Для want фото обычно
// нет — карточка с бейджем «Куплю» и критериями в заголовке.

export function ListingCard({
    listing,
    rates,
    optionLabel,
    onOpen,
    delayMs = 0,
}: {
    listing: Listing
    rates: Record<string, number>
    optionLabel: (key: string, value: string) => string
    onOpen: (l: Listing) => void
    delayMs?: number
}) {
    const l = listing
    const cover = l.photos?.[0]
    const title =
        typeof l.title === 'string' ? l.title : pickLabel(l.title ?? undefined)
    const alt = formatPriceAlt(l.price, l.currency_code, rates)
    const spec = specLine(l, optionLabel)
    const isWant = l.kind === 'want'

    return (
        <button
            onClick={() => onOpen(l)}
            className="wv-rise block w-full overflow-hidden rounded-2xl border bg-card text-left active:scale-[0.99] transition-transform"
            style={{ '--wv-delay': `${delayMs}ms` } as React.CSSProperties}
        >
            {cover ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element — MinIO/CDN, без next/image в вебвью */}
                    <img
                        src={cover.thumb ?? cover.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                    {l.photos.length > 1 && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
                            {l.photos.length} фото
                        </span>
                    )}
                </div>
            ) : null}

            <div className="px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[17px] font-bold tracking-tight">
                        {isWant && l.price != null ? 'до ' : ''}
                        {formatPrice(l.price, l.currency_code)}
                    </span>
                    {alt && (
                        <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                            {alt}
                        </span>
                    )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                    {isWant && (
                        <span className="shrink-0 rounded-md border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider"
                            style={{
                                color: 'var(--wv-accent)',
                                borderColor: 'var(--wv-accent-border)',
                                background: 'var(--wv-accent-soft)',
                            }}
                        >
                            Куплю
                        </span>
                    )}
                    <span className="truncate text-[15px] font-medium leading-snug">
                        {title}
                    </span>
                </div>

                {spec && (
                    <p className="mt-1 truncate text-[13px] text-muted-foreground">
                        {spec}
                    </p>
                )}

                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground/80">
                    {l.region_name && <span>{l.region_name}</span>}
                    {l.region_name && <span aria-hidden>·</span>}
                    <span>{timeAgo(l.created_at)}</span>
                    {l.views > 0 && (
                        <>
                            <span aria-hidden>·</span>
                            <span className="flex items-center gap-1">
                                <Icon name="eye" size={12} />
                                {l.views}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </button>
    )
}

export function ListingCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="wv-skeleton aspect-[4/3] w-full" />
            <div className="space-y-2 px-3.5 py-3">
                <div className="wv-skeleton h-5 w-28 rounded" />
                <div className="wv-skeleton h-4 w-44 rounded" />
                <div className="wv-skeleton h-3 w-36 rounded" />
            </div>
        </div>
    )
}
