'use client'

// «Профиль» сервиса: уровень + баллы + бейджи, топ недели и история своих
// меток. Auth-гейт — общий useWebviewAuth (тихая авторизация, самолечение
// через onAuthChanged, тост при сбое).

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginPrompt } from '../../components/LoginPrompt'
import { useWebviewAuth } from '../../useWebviewAuth'
import { fetchLeaderboard, fetchMyReports, fetchMyStats } from '../lib/api'
import { STATUS_COLOR, formatPrice, metaLabel, timeAgo } from '../lib/format'
import { useFuelMeta } from '../lib/queries'

export function MyReportsClient() {
    const qc = useQueryClient()
    const { authed, login } = useWebviewAuth({
        onAuthed: () => {
            for (const key of ['my-reports', 'my-stats', 'leaderboard']) {
                void qc.invalidateQueries({ queryKey: ['fuel', key] })
            }
        },
    })

    const meta = useFuelMeta()
    const reports = useQuery({
        queryKey: ['fuel', 'my-reports'],
        queryFn: fetchMyReports,
        enabled: authed === true,
    })
    const stats = useQuery({
        queryKey: ['fuel', 'my-stats'],
        queryFn: fetchMyStats,
        enabled: authed === true,
    })
    const leaders = useQuery({
        queryKey: ['fuel', 'leaderboard'],
        queryFn: fetchLeaderboard,
        enabled: authed === true,
        staleTime: 60_000,
    })

    return (
        <div className="mx-auto max-w-lg px-3 pb-[calc(env(safe-area-inset-bottom)+92px)] pt-3">
            {authed === false ? (
                <LoginPrompt
                    title="Войдите в профиль"
                    text="Баллы за метки, уровень, топ недели и история ваших отметок."
                    onLogin={login}
                />
            ) : authed === null || reports.isLoading ? (
                <div className="flex flex-col gap-2.5">
                    <div className="rounded-2xl border border-border p-4">
                        <div className="wv-skeleton mb-2 h-5 w-1/3 rounded" />
                        <div className="wv-skeleton h-3 w-2/3 rounded" />
                    </div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border p-3.5">
                            <div className="wv-skeleton mb-2 h-4 w-1/2 rounded" />
                            <div className="wv-skeleton h-3 w-1/3 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* уровень и баллы */}
                    {stats.data && (
                        <section className="wv-rise rounded-2xl border border-border p-4">
                            <div className="flex items-baseline justify-between gap-3">
                                <p className="text-[16px] font-bold">
                                    {stats.data.level.label}
                                </p>
                                <p className="text-[14px] font-semibold tabular-nums text-[var(--wv-accent)]">
                                    {stats.data.level.points} баллов
                                </p>
                            </div>
                            {stats.data.level.next_at != null && (
                                <>
                                    {/* прогресс до следующего уровня */}
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-[var(--wv-accent)]"
                                            style={{
                                                width: `${Math.min(100, Math.round((stats.data.level.points / stats.data.level.next_at) * 100))}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                                        До уровня «{stats.data.level.next_label}» —{' '}
                                        {stats.data.level.next_at - stats.data.level.points}{' '}
                                        баллов
                                    </p>
                                </>
                            )}
                            <p className="mt-2 text-[12.5px] text-muted-foreground">
                                Меток: {stats.data.reports_count} · подтверждений
                                ваших меток: {stats.data.confirms_received}
                            </p>
                            {stats.data.badges.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {stats.data.badges.map((b) => (
                                        <span
                                            key={b.key}
                                            className="rounded-full bg-[var(--wv-accent-soft)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--wv-accent)]"
                                        >
                                            {b.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* топ недели */}
                    {leaders.data && leaders.data.items.length > 0 && (
                        <section className="wv-rise rounded-2xl border border-border p-4">
                            <p className="mb-2 text-[13px] font-semibold text-muted-foreground">
                                Топ недели
                            </p>
                            <ol className="flex flex-col gap-1.5">
                                {leaders.data.items.map((item, i) => (
                                    <li
                                        key={item.user_id}
                                        className={
                                            'flex items-center gap-2.5 text-[13.5px] ' +
                                            (item.is_me ? 'font-bold text-[var(--wv-accent)]' : '')
                                        }
                                    >
                                        <span className="w-5 text-right tabular-nums text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.name}
                                            {item.is_me ? ' (вы)' : ''}
                                        </span>
                                        <span className="tabular-nums">{item.points}</span>
                                    </li>
                                ))}
                            </ol>
                            {leaders.data.me.rank != null &&
                                leaders.data.me.rank >
                                    leaders.data.items.length && (
                                    <p className="mt-2 border-t pt-2 text-[12.5px] text-muted-foreground">
                                        Ваше место: {leaders.data.me.rank} ·{' '}
                                        {leaders.data.me.points} баллов
                                    </p>
                                )}
                        </section>
                    )}

                    {/* история меток */}
                    <section>
                        <p className="mb-2 text-[13px] font-semibold text-muted-foreground">
                            Мои метки
                        </p>
                        {!reports.data?.length ? (
                            <p className="text-[13px] text-muted-foreground">
                                Пока нет меток — отмечайте наличие топлива на АЗС
                                в ленте, зарабатывайте баллы.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-2.5">
                                {reports.data.map((r, i) => {
                                    const color = STATUS_COLOR[r.status]
                                    return (
                                        <li
                                            key={r.id}
                                            className="wv-rise rounded-2xl border border-border p-3.5"
                                            style={{ '--wv-delay': `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
                                        >
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className="min-w-0 truncate text-[14.5px] font-semibold">
                                                    {r.station_name}
                                                </p>
                                                <span className="shrink-0 text-[11.5px] text-muted-foreground">
                                                    {timeAgo(r.created_at)}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                                                <span
                                                    className="inline-flex items-center gap-1.5 font-medium"
                                                    style={{ color }}
                                                >
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    {metaLabel(meta.data?.fuel_types, r.fuel_type)}
                                                    {' — '}
                                                    {metaLabel(meta.data?.statuses, r.status)}
                                                </span>
                                                {r.queue && (
                                                    <span className="text-muted-foreground">
                                                        {metaLabel(meta.data?.queue_buckets, r.queue)}
                                                    </span>
                                                )}
                                                {r.price != null && (
                                                    <span className="tabular-nums text-muted-foreground">
                                                        {formatPrice(r.price)}
                                                    </span>
                                                )}
                                            </p>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
