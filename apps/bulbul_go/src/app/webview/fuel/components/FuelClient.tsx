'use client'

// Корневой экран «Где Бензин»: определение позиции (мост → браузерная
// геолокация → центр Бишкека), фильтр по маркам и список АЗС по удалению.
// Заголовок экрана рисует нативный AppBar приложения.

import { useEffect, useMemo, useState } from 'react'
import { Chip } from '../../components/Chip'
import { EmptyState } from '../../components/EmptyState'
import { metaLabel } from '../lib/format'
import { useFuelMeta, useStations } from '../lib/queries'
import { useOrigin } from '../lib/useOrigin'
import type { FuelType, Station } from '../lib/types'
import { ReportSheet } from './ReportSheet'
import { StationCard } from './StationCard'
import { StationSheet } from './StationSheet'

// Каскадная анимация карточек — только при первом показе ленты за сессию
// вебвью: при возврате с другого таба список из кэша появляется мгновенно,
// повторный «взлёт» карточек читается как перерисовка с нуля.
let feedAnimated = false

export function FuelClient() {
    const { origin, geoDenied } = useOrigin()
    const [fuelType, setFuelType] = useState<FuelType | null>(null)
    const [openedStation, setOpenedStation] = useState<Station | null>(null)
    const [reportStation, setReportStation] = useState<Station | null>(null)
    const [animate] = useState(() => !feedAnimated)

    const meta = useFuelMeta()
    const stations = useStations(origin, fuelType)

    const chips = useMemo(
        () => meta.data?.fuel_types ?? [],
        [meta.data],
    )

    // АЗС без размеченных марок в ленте не показываем (справочник дозаполняется
    // сидером/админкой; фикстура уже обогащена — это страховка на края)
    const visible = useMemo(
        () => (stations.data ?? []).filter((s) => s.fuel_types.length > 0),
        [stations.data],
    )

    // лента показана с данными — последующие маунты идут без каскада
    useEffect(() => {
        if (visible.length > 0) feedAnimated = true
    }, [visible.length])

    return (
        // +92px снизу: фиксированный таббар сегмента; +60px сверху:
        // фиксированная полоса фильтра
        <div className="mx-auto max-w-lg px-3 pb-[calc(env(safe-area-inset-bottom)+92px)] pt-[60px]">
            {/* фильтр прикреплён к верху fixed'ом: sticky здесь не работает —
                его ломает overflow-x-hidden на html/body вебвью-layout */}
            <div className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
                <div className="wv-chips mx-auto flex max-w-lg gap-2 overflow-x-auto px-3 py-2.5">
                    <Chip
                        active={fuelType === null}
                        onClick={() => setFuelType(null)}
                    >
                        Все
                    </Chip>
                    {chips.map((opt) => (
                        <Chip
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
                        </Chip>
                    ))}
                </div>
            </div>

            {geoDenied && (
                <div className="wv-rise mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[13px] leading-snug text-amber-700 dark:text-amber-400">
                    Геолокация недоступна — показаны АЗС Бишкека. Разрешите
                    доступ к местоположению, чтобы видеть заправки рядом.
                </div>
            )}

            {stations.isLoading || origin === null ? (
                <ListSkeleton />
            ) : stations.isError ? (
                <EmptyState
                    icon={<PumpIcon />}
                    title="Не удалось загрузить"
                    text="Проверьте соединение и попробуйте ещё раз."
                    action={
                        <button
                            className="mt-3 rounded-full bg-[var(--wv-primary)] px-5 py-2 text-[14px] font-semibold text-white active:opacity-80"
                            onClick={() => void stations.refetch()}
                        >
                            Повторить
                        </button>
                    }
                />
            ) : !visible.length ? (
                <EmptyState
                    icon={<PumpIcon />}
                    title="Рядом АЗС не нашлось"
                    text={
                        fuelType
                            ? 'По выбранной марке поблизости пусто — попробуйте убрать фильтр.'
                            : 'В радиусе 30 км нет заправок из справочника.'
                    }
                />
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {visible.map((station, i) => (
                        <li
                            key={station.id}
                            className={animate ? 'wv-rise' : undefined}
                            style={
                                animate
                                    ? ({ '--wv-delay': `${Math.min(i, 8) * 40}ms` } as React.CSSProperties)
                                    : undefined
                            }
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
                origin={origin}
                geoKnown={!geoDenied}
                onClose={() => setReportStation(null)}
            />
        </div>
    )
}


function ListSkeleton() {
    return (
        <div className="flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-3.5"
                >
                    <div className="wv-skeleton mb-2 h-4 w-2/3 rounded" />
                    <div className="wv-skeleton mb-3 h-3 w-1/3 rounded" />
                    <div className="flex gap-1.5">
                        <div className="wv-skeleton h-6 w-16 rounded-full" />
                        <div className="wv-skeleton h-6 w-16 rounded-full" />
                        <div className="wv-skeleton h-6 w-16 rounded-full" />
                    </div>
                </div>
            ))}
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
