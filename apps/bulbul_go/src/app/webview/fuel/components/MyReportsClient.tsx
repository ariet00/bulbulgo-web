'use client'

// «Мои метки»: свои репорты новыми сверху. Тихая авторизация при открытии
// (сессия страницы или код приложения без UI); если её нет — кнопка входа
// через ensureAuth (нативный экран логина поверх вебвью).

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ensureAuth, trySilentAuth } from '../../auth'
import { fetchMyReports } from '../lib/api'
import { STATUS_COLOR, formatPrice, metaLabel, timeAgo } from '../lib/format'
import { useFuelMeta } from '../lib/queries'

export function MyReportsClient() {
    const qc = useQueryClient()
    const [authed, setAuthed] = useState<boolean | null>(null)

    useEffect(() => {
        void trySilentAuth().then(setAuthed)
    }, [])

    const meta = useFuelMeta()
    const reports = useQuery({
        queryKey: ['fuel', 'my-reports'],
        queryFn: fetchMyReports,
        enabled: authed === true,
    })

    const login = async () => {
        if (await ensureAuth()) {
            setAuthed(true)
            void qc.invalidateQueries({ queryKey: ['fuel', 'my-reports'] })
        }
    }

    return (
        <div className="mx-auto max-w-lg px-3 pb-[calc(env(safe-area-inset-bottom)+92px)] pt-3">
            {authed === false ? (
                <div className="fl-rise flex flex-col items-center px-6 py-16 text-center">
                    <p className="text-[16px] font-semibold">
                        Войдите, чтобы видеть свои метки
                    </p>
                    <p className="mt-1 text-[13.5px] text-muted-foreground">
                        Здесь появится история ваших отметок о наличии топлива.
                    </p>
                    <button
                        onClick={() => void login()}
                        className="mt-4 rounded-full bg-[var(--fl-accent)] px-6 py-2.5 text-[14px] font-semibold text-white active:opacity-80"
                    >
                        Войти
                    </button>
                </div>
            ) : authed === null || reports.isLoading ? (
                <div className="flex flex-col gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border p-3.5">
                            <div className="fl-skeleton mb-2 h-4 w-1/2 rounded" />
                            <div className="fl-skeleton h-3 w-1/3 rounded" />
                        </div>
                    ))}
                </div>
            ) : !reports.data?.length ? (
                <div className="fl-rise flex flex-col items-center px-6 py-16 text-center">
                    <p className="text-[16px] font-semibold">Пока нет меток</p>
                    <p className="mt-1 text-[13.5px] text-muted-foreground">
                        Отмечайте наличие топлива на АЗС в ленте — ваши метки
                        будут храниться здесь.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {reports.data.map((r, i) => {
                        const color = STATUS_COLOR[r.status]
                        return (
                            <li
                                key={r.id}
                                className="fl-rise rounded-2xl border border-border p-3.5"
                                style={{ '--fl-delay': `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
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
        </div>
    )
}
