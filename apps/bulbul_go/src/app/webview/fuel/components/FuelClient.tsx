'use client'

// Корневой экран «Где заправка»: определение позиции (мост → браузерная
// геолокация → центр Бишкека), фильтр по маркам и список АЗС по удалению.
// Заголовок экрана рисует нативный AppBar приложения.

import { useEffect, useMemo, useState } from 'react'
import { getLocation, waitForBridge } from '../../bridge'
import { metaLabel } from '../lib/format'
import { useFuelMeta, useStations } from '../lib/queries'
import type { FuelType, LatLng, Station } from '../lib/types'
import { ReportSheet } from './ReportSheet'
import { StationCard } from './StationCard'
import { StationSheet } from './StationSheet'

const BISHKEK: LatLng = { lat: 42.8746, lng: 74.5698 }

function browserLocation(timeoutMs = 6000): Promise<LatLng | null> {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            return resolve(null)
        }
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(null),
            { timeout: timeoutMs, maximumAge: 60_000 },
        )
    })
}

export function FuelClient() {
    const [origin, setOrigin] = useState<LatLng | null>(null)
    const [geoDenied, setGeoDenied] = useState(false)
    const [fuelType, setFuelType] = useState<FuelType | null>(null)
    const [openedStation, setOpenedStation] = useState<Station | null>(null)
    const [reportStation, setReportStation] = useState<Station | null>(null)

    useEffect(() => {
        let cancelled = false
        void (async () => {
            let loc: LatLng | null = null
            if (await waitForBridge(1500)) {
                const bridged = await getLocation().catch(() => null)
                if (bridged) {
                    loc = { lat: bridged.latitude, lng: bridged.longitude }
                }
            }
            loc ??= await browserLocation()
            if (cancelled) return
            setGeoDenied(loc === null)
            setOrigin(loc ?? BISHKEK)
        })()
        return () => {
            cancelled = true
        }
    }, [])

    const meta = useFuelMeta()
    const stations = useStations(origin, fuelType)

    const chips = useMemo(
        () => meta.data?.fuel_types ?? [],
        [meta.data],
    )

    return (
        <div className="mx-auto max-w-lg px-3 pb-[calc(env(safe-area-inset-bottom)+22px)] pt-3">
            {geoDenied && (
                <div className="fl-rise mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[13px] leading-snug text-amber-700 dark:text-amber-400">
                    Геолокация недоступна — показаны АЗС Бишкека. Разрешите
                    доступ к местоположению, чтобы видеть заправки рядом.
                </div>
            )}

            {/* фильтр по маркам топлива */}
            <div className="fl-chips -mx-3 mb-3 flex gap-2 overflow-x-auto px-3">
                <FilterChip
                    active={fuelType === null}
                    onClick={() => setFuelType(null)}
                >
                    Все
                </FilterChip>
                {chips.map((opt) => (
                    <FilterChip
                        key={opt.value}
                        active={fuelType === opt.value}
                        onClick={() =>
                            setFuelType(
                                fuelType === opt.value
                                    ? null
                                    : (opt.value as FuelType),
                            )
                        }
                    >
                        {metaLabel(chips, opt.value)}
                    </FilterChip>
                ))}
            </div>

            {stations.isLoading || origin === null ? (
                <ListSkeleton />
            ) : stations.isError ? (
                <EmptyState
                    title="Не удалось загрузить"
                    text="Проверьте соединение и попробуйте ещё раз."
                    action={
                        <button
                            className="mt-3 rounded-full bg-[var(--fl-accent)] px-5 py-2 text-[14px] font-semibold text-white active:opacity-80"
                            onClick={() => void stations.refetch()}
                        >
                            Повторить
                        </button>
                    }
                />
            ) : !stations.data?.length ? (
                <EmptyState
                    title="Рядом АЗС не нашлось"
                    text={
                        fuelType
                            ? 'По выбранной марке поблизости пусто — попробуйте убрать фильтр.'
                            : 'В радиусе 30 км нет заправок из справочника.'
                    }
                />
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {stations.data.map((station, i) => (
                        <li
                            key={station.id}
                            className="fl-rise"
                            style={{ '--fl-delay': `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
                        >
                            <StationCard
                                station={station}
                                meta={meta.data}
                                onOpen={() => setOpenedStation(station)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <StationSheet
                station={openedStation}
                origin={origin}
                meta={meta.data}
                onClose={() => setOpenedStation(null)}
                onReport={(s) => {
                    setOpenedStation(null)
                    setReportStation(s)
                }}
            />
            <ReportSheet
                station={reportStation}
                meta={meta.data}
                onClose={() => setReportStation(null)}
            />
        </div>
    )
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ' +
                (active
                    ? 'border-[var(--fl-accent-border)] bg-[var(--fl-accent-soft)] text-[var(--fl-accent)]'
                    : 'border-border bg-background text-muted-foreground active:bg-muted')
            }
        >
            {children}
        </button>
    )
}

function ListSkeleton() {
    return (
        <div className="flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-border p-3.5"
                >
                    <div className="fl-skeleton mb-2 h-4 w-2/3 rounded" />
                    <div className="fl-skeleton mb-3 h-3 w-1/3 rounded" />
                    <div className="flex gap-1.5">
                        <div className="fl-skeleton h-6 w-16 rounded-full" />
                        <div className="fl-skeleton h-6 w-16 rounded-full" />
                        <div className="fl-skeleton h-6 w-16 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function EmptyState({
    title,
    text,
    action,
}: {
    title: string
    text: string
    action?: React.ReactNode
}) {
    return (
        <div className="fl-rise flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fl-accent-soft)] text-[var(--fl-accent)]">
                <PumpIcon />
            </div>
            <p className="text-[16px] font-semibold">{title}</p>
            <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
                {text}
            </p>
            {action}
        </div>
    )
}

export function PumpIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
            <path d="M3 21h14" />
            <path d="M7 7h6v4H7z" />
            <path d="M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 0 3 0v-6.6a2 2 0 0 0-.6-1.4L19 6.5" />
        </svg>
    )
}
