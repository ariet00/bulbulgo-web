'use client'

// Карточка АЗС в боттом-шите: сводка статусов по маркам, контакты и лента
// свежих репортов. Кнопка «Сообщить» открывает форму репорта (гейт auth —
// внутри ReportSheet).

import { BottomSheet } from '../../auto/components/BottomSheet'
import { callPhone, bridgeAvailable } from '../../bridge'
import {
    STATUS_COLOR,
    formatDistance,
    formatPrice,
    metaLabel,
    timeAgo,
} from '../lib/format'
import { useStation } from '../lib/queries'
import type { FuelMeta, LatLng, Station, StationDetail } from '../lib/types'

export function StationSheet({
    station,
    origin,
    meta,
    onClose,
    onReport,
}: {
    station: Station | null
    origin: LatLng | null
    meta: FuelMeta | undefined
    onClose: () => void
    onReport: (station: Station) => void
}) {
    const detail = useStation(station?.id ?? null, origin)
    const data = (detail.data ?? station) as StationDetail | Station | null

    return (
        <BottomSheet
            open={station !== null}
            onClose={onClose}
            title={data?.name ?? ''}
            footer={
                station && (
                    <button
                        onClick={() => onReport(station)}
                        className="w-full rounded-xl bg-[var(--fl-accent)] py-3 text-[15px] font-semibold text-white active:opacity-80"
                    >
                        Сообщить о наличии
                    </button>
                )
            }
        >
            {data && (
                <div className="flex flex-col gap-4">
                    <p className="-mt-1 text-[13px] text-muted-foreground">
                        {[
                            data.brand,
                            data.address,
                            formatDistance(data.distance_km),
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>

                    {/* сводка по маркам */}
                    <div className="flex flex-col gap-2">
                        {(data.fuel_types.length
                            ? data.fuel_types
                            : (Object.keys(data.statuses) as (keyof typeof data.statuses)[])
                        ).map((g) => {
                            const st = data.statuses[g]
                            const color = st ? STATUS_COLOR[st.status] : undefined
                            return (
                                <div
                                    key={g}
                                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                                    style={{ opacity: st?.is_stale ? 0.65 : 1 }}
                                >
                                    <span className="text-[14px] font-semibold">
                                        {metaLabel(meta?.fuel_types, g)}
                                    </span>
                                    {st ? (
                                        <span className="flex items-center gap-2 text-right">
                                            {st.price != null && (
                                                <span className="text-[13px] font-medium tabular-nums text-muted-foreground">
                                                    {formatPrice(st.price)}
                                                </span>
                                            )}
                                            <span
                                                className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
                                                style={{
                                                    color,
                                                    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                                                }}
                                            >
                                                {metaLabel(meta?.statuses, st.status)}
                                                {st.status === 'queue' && st.queue
                                                    ? ` · ${metaLabel(meta?.queue_buckets, st.queue)}`
                                                    : ''}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-[12.5px] text-muted-foreground">
                                            нет отметок
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* контакты (из detail, приезжают фоном) */}
                    {'phone' in data && (data.phone || data.working_hours) && (
                        <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
                            {data.working_hours && <p>Режим: {data.working_hours}</p>}
                            {data.phone && (
                                <button
                                    className="w-fit font-medium text-[var(--fl-accent)] active:opacity-70"
                                    onClick={() =>
                                        bridgeAvailable()
                                            ? void callPhone(data.phone!)
                                            : (window.location.href = `tel:${data.phone}`)
                                    }
                                >
                                    {data.phone}
                                </button>
                            )}
                        </div>
                    )}

                    {/* лента репортов */}
                    <div>
                        <p className="mb-2 text-[13px] font-semibold text-muted-foreground">
                            Отметки водителей
                        </p>
                        {'reports' in data && data.reports.length > 0 ? (
                            <ul className="flex flex-col gap-2">
                                {data.reports.map((r) => {
                                    const color = STATUS_COLOR[r.status]
                                    return (
                                        <li
                                            key={r.id}
                                            className="rounded-xl bg-muted/50 px-3 py-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className="flex items-center gap-1.5 text-[13px] font-medium"
                                                    style={{ color }}
                                                >
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    {metaLabel(meta?.fuel_types, r.fuel_type)}
                                                    {' — '}
                                                    {metaLabel(meta?.statuses, r.status)}
                                                </span>
                                                <span className="shrink-0 text-[11.5px] text-muted-foreground">
                                                    {timeAgo(r.created_at)}
                                                    {r.is_mine ? ' · вы' : ''}
                                                </span>
                                            </div>
                                            {(r.queue || r.price != null || r.restriction || r.note) && (
                                                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                                    {[
                                                        r.queue &&
                                                            metaLabel(meta?.queue_buckets, r.queue),
                                                        r.price != null && formatPrice(r.price),
                                                        r.restriction &&
                                                            metaLabel(meta?.restrictions, r.restriction),
                                                        r.note,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-[13px] text-muted-foreground">
                                Пока никто не отмечался — ваша отметка поможет
                                другим водителям.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </BottomSheet>
    )
}
