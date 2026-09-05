'use client'

// Карточка АЗС в боттом-шите: сводка статусов по маркам, контакты и лента
// свежих репортов с подтверждениями («N водителей подтвердили»). Кнопка
// «Сообщить» открывает форму репорта (гейт auth — внутри ReportSheet).

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ensureAuth } from '../../auth'
import { BottomSheet } from '../../components/BottomSheet'
import { bridgeAvailable, callPhone, haptic, toast } from '../../bridge'
import { confirmReport, unconfirmReport } from '../lib/api'
import {
    STATUS_COLOR,
    formatDistance,
    formatPrice,
    metaLabel,
    timeAgo,
} from '../lib/format'
import { qk, useStation } from '../lib/queries'
import type { FuelMeta, LatLng, Station, StationDetail } from '../lib/types'
import { IssueSheet } from './IssueSheet'
import { StationAvatar } from './StationCard'

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
    const qc = useQueryClient()
    const detail = useStation(station?.id ?? null, origin)
    const data = (detail.data ?? station) as StationDetail | Station | null
    const [confirming, setConfirming] = useState<number | null>(null)
    const [issueFor, setIssueFor] = useState<Station | null>(null)

    const toggleConfirm = async (reportId: number, undo: boolean) => {
        if (!station || confirming) return
        setConfirming(reportId)
        try {
            if (!(await ensureAuth())) return
            await (undo ? unconfirmReport(reportId) : confirmReport(reportId))
            void haptic(undo ? 'light' : 'success').catch(() => {})
            void qc.invalidateQueries({ queryKey: qk.station(station.id) })
            void qc.invalidateQueries({ queryKey: ['fuel', 'my-stats'] })
            void qc.invalidateQueries({ queryKey: ['fuel', 'leaderboard'] })
        } catch {
            if (bridgeAvailable()) {
                void toast('Не получилось, попробуйте ещё раз', 'warning').catch(() => {})
            }
        } finally {
            setConfirming(null)
        }
    }

    return (
        <BottomSheet
            open={station !== null}
            onClose={onClose}
            title={data?.name ?? ''}
            footer={
                station && (
                    <button
                        onClick={() => onReport(station)}
                        className="w-full rounded-xl bg-[var(--wv-primary)] py-3 text-[15px] font-semibold text-white active:opacity-80"
                    >
                        Сообщить о наличии
                    </button>
                )
            }
        >
            {data && (
                <div className="flex flex-col gap-4">
                    <div className="-mt-1 flex items-center gap-3">
                        <StationAvatar station={data} size={44} />
                        <p className="text-[13px] leading-snug text-muted-foreground">
                            {[
                                data.brand,
                                data.address,
                                formatDistance(data.distance_km),
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </div>

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
                                    className="w-fit font-medium text-[var(--wv-accent)] active:opacity-70"
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
                                    // подтверждать можно только свежую метку
                                    // (бэк отвергнет устаревшую — не показываем
                                    // кнопку зря)
                                    const fresh =
                                        Date.now() - new Date(r.created_at).getTime() <
                                        (meta?.fresh_minutes ?? 90) * 60_000
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
                                            {/* подтверждения: чужую метку можно
                                                подтвердить (＋балл автору) */}
                                            {(r.confirmed_count > 0 ||
                                                (!r.is_mine && fresh)) && (
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    {!r.is_mine && !r.i_confirmed && fresh && (
                                                        <button
                                                            disabled={confirming === r.id}
                                                            onClick={() => void toggleConfirm(r.id, false)}
                                                            className="rounded-full border border-[var(--wv-accent-border)] bg-[var(--wv-accent-soft)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--wv-accent)] active:opacity-70 disabled:opacity-50"
                                                        >
                                                            {confirming === r.id
                                                                ? 'Подтверждаем…'
                                                                : '✓ Подтвердить'}
                                                        </button>
                                                    )}
                                                    {r.i_confirmed && (
                                                        // повторный тап — отмена своего подтверждения
                                                        <button
                                                            disabled={confirming === r.id}
                                                            onClick={() => void toggleConfirm(r.id, true)}
                                                            className="rounded-full border border-border px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground active:bg-muted disabled:opacity-50"
                                                        >
                                                            {confirming === r.id
                                                                ? 'Отменяем…'
                                                                : '✓ Вы подтвердили · отменить'}
                                                        </button>
                                                    )}
                                                    {r.confirmed_count > 0 && (
                                                        <span className="text-[11.5px] text-muted-foreground">
                                                            ✓ {r.confirmed_count}
                                                        </span>
                                                    )}
                                                </div>
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

                    {/* жалоба на данные самой АЗС (не на топливо) */}
                    <button
                        onClick={() => station && setIssueFor(station)}
                        className="w-fit text-[12.5px] text-muted-foreground underline decoration-dotted underline-offset-4 active:opacity-70"
                    >
                        Сообщить об ошибке в данных АЗС
                    </button>
                </div>
            )}

            <IssueSheet
                station={issueFor}
                origin={origin}
                onClose={() => setIssueFor(null)}
            />
        </BottomSheet>
    )
}
