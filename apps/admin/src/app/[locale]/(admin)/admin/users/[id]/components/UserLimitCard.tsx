'use client'

import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { useAdminUserLimit } from '@/hooks/queries/admin'
import {
    useSetDriverCredits,
    useSetDriverFreeUsed,
    useSetDriverLimited,
} from '@/hooks/mutations/admin'
import { AdjustPopover, LimitStatusControl } from '@/components/admin/analytics/limit-controls'
import { Metric } from './shared'

export function UserLimitCard({ uid }: { uid: number }) {
    const limit = useAdminUserLimit(uid)
    const creditsM = useSetDriverCredits()
    const freeM = useSetDriverFreeUsed()
    const limitedM = useSetDriverLimited()
    const d = limit.data

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    Лимиты на просмотр номеров
                    {d && !d.enabled && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            лимитер выключен
                        </span>
                    )}
                </CardTitle>
                {d && (
                    <p className="text-sm font-normal text-muted-foreground">
                        Окно {d.activity_window_days} дн · порог: ≥{d.activity_min_views} просм. на ≥
                        {d.activity_min_active_days} днях · free/день: строгий {d.free_daily_limit},
                        общий {d.global_free_daily_limit} · fast = {d.fast_cost} очк.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {limit.isLoading ? (
                    <div>Загрузка…</div>
                ) : !d ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-muted-foreground">Действующий тариф:</span>
                            <LimitStatusControl
                                d={d}
                                pending={limitedM.isPending}
                                onSet={value => limitedM.mutate({ userId: uid, value })}
                                align="start"
                            />
                            <span className="text-xs text-muted-foreground">
                                расчёт: {d.is_limited ? 'строгий' : 'общий'} ({d.window_views} просм.
                                / {d.active_days} дн.)
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            <EditableMetric
                                label="Free сегодня"
                                value={
                                    <>
                                        <span
                                            className={
                                                d.free_remaining === 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : undefined
                                            }
                                        >
                                            {d.free_used}
                                        </span>
                                        <span className="text-muted-foreground"> / {d.free_limit}</span>
                                    </>
                                }
                                current={d.free_used}
                                pending={freeM.isPending}
                                quickResetTo={0}
                                quickResetLabel="Сброс (0)"
                                title="Free сегодня"
                                onSubmit={(value) => freeM.mutate({ userId: uid, value })}
                            />
                            <Metric label="Осталось free" value={d.free_remaining} />
                            <EditableMetric
                                label="Купленные лимиты"
                                value={
                                    <span
                                        className={
                                            d.credits_balance > 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-muted-foreground'
                                        }
                                    >
                                        {d.credits_balance}
                                    </span>
                                }
                                current={d.credits_balance}
                                pending={creditsM.isPending}
                                title="Купленные лимиты"
                                onSubmit={(value) => creditsM.mutate({ userId: uid, value })}
                            />
                            <Metric label="Просмотров за окно" value={d.window_views} />
                            <Metric label="Активных дней" value={d.active_days} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function EditableMetric({
    label,
    value,
    current,
    pending,
    title,
    onSubmit,
    quickResetTo,
    quickResetLabel,
}: {
    label: string
    value: ReactNode
    current: number
    pending: boolean
    title: string
    onSubmit: (value: number) => void
    quickResetTo?: number
    quickResetLabel?: string
}) {
    return (
        <div className="rounded border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold tabular-nums">
                <AdjustPopover
                    title={title}
                    current={current}
                    pending={pending}
                    onSubmit={onSubmit}
                    quickResetTo={quickResetTo}
                    quickResetLabel={quickResetLabel}
                    display={value}
                    align="start"
                />
            </div>
        </div>
    )
}
