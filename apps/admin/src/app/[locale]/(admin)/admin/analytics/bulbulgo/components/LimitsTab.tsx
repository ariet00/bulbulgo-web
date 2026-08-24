'use client'

import { useState } from 'react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw } from 'lucide-react'
import { useAdminRideshareLimitedDrivers } from '@/hooks/queries/admin'
import {
    useSetDriverCredits,
    useSetDriverFreeUsed,
    useSetDriverLimited,
} from '@/hooks/mutations/admin'
import { AdjustPopover, LimitStatusControl } from '@/components/admin/analytics/limit-controls'
import { AsyncBlock, LIST_SIZE, UserAvatar } from './shared'

type LimitedDriversQuery = ReturnType<typeof useAdminRideshareLimitedDrivers>
type LimitedDriverRow = NonNullable<LimitedDriversQuery['data']>['drivers'][number]

type LimitedTier = 'all' | 'strict' | 'general'

type LimitedSort =
    | 'window_views'
    | 'free_used'
    | 'credits_balance'
    | 'active_days'
    | 'limit_reached_today'
    | 'last_online_at'

const LIMITED_TIERS: Array<{ value: LimitedTier; label: string }> = [
    { value: 'all', label: 'Все тарифы' },
    { value: 'strict', label: 'Строгий' },
    { value: 'general', label: 'Общий' },
]

const LIMITED_SORTS: Array<{ value: LimitedSort; label: string }> = [
    { value: 'window_views', label: 'Просмотры' },
    { value: 'free_used', label: 'Free сегодня' },
    { value: 'credits_balance', label: 'Купленные' },
    { value: 'active_days', label: 'Активных дней' },
    { value: 'limit_reached_today', label: 'Лимит сегодня' },
    { value: 'last_online_at', label: 'Был онлайн' },
]

export function LimitsTab() {
    const [page, setPage] = useState(1)
    const [tier, setTier] = useState<LimitedTier>('all')
    const [hasCredits, setHasCredits] = useState(false)
    const [onlyLimitReached, setOnlyLimitReached] = useState(false)
    const [sort, setSort] = useState<LimitedSort>('window_views')

    const query = useAdminRideshareLimitedDrivers(page, LIST_SIZE, {
        tier: tier === 'all' ? undefined : tier,
        hasCredits,
        onlyLimitReached,
        sortBy: sort,
    })

    const cfg = query.data?.config
    const drivers = query.data?.drivers ?? []
    const total = query.data?.total ?? 0

    const creditsM = useSetDriverCredits()
    const freeM = useSetDriverFreeUsed()
    const limitedM = useSetDriverLimited()

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Под лимитами просмотра номеров ({total})</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                    >
                        <RefreshCw
                            className={`mr-1 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
                        />
                        Обновить
                    </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {LIMITED_TIERS.map(t => (
                        <Button
                            key={t.value}
                            variant={tier === t.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                                setTier(t.value)
                                setPage(1)
                            }}
                        >
                            {t.label}
                        </Button>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <Button
                        variant={hasCredits ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                            setHasCredits(!hasCredits)
                            setPage(1)
                        }}
                        title="Только с купленными (carry-over) лимитами"
                    >
                        С купленными
                    </Button>
                    <Button
                        variant={onlyLimitReached ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                            setOnlyLimitReached(!onlyLimitReached)
                            setPage(1)
                        }}
                        title="Только те, кто сегодня упирался в дневной лимит"
                    >
                        Упёрлись сегодня
                    </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Сортировка:</span>
                    {LIMITED_SORTS.map(s => (
                        <Button
                            key={s.value}
                            variant={sort === s.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                                setSort(s.value)
                                setPage(1)
                            }}
                        >
                            {s.label}
                        </Button>
                    ))}
                </div>
                {cfg && (
                    <p className="text-xs text-muted-foreground">
                        {cfg.enabled ? 'Лимиты включены' : 'Лимиты выключены'} · окно{' '}
                        {cfg.activity_window_days}д · порог: ≥{cfg.activity_min_views} просмотров
                        на ≥{cfg.activity_min_active_days} днях · free/день: строгий{' '}
                        {cfg.free_daily_limit} / общий {cfg.global_free_daily_limit} · fast ×
                        {cfg.fast_cost}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={drivers.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead
                                        className="w-28 text-right"
                                        title="Просмотры пассажирских объявлений в окне активности"
                                    >
                                        Просмотров
                                    </TableHead>
                                    <TableHead className="w-28 text-right">Активных дней</TableHead>
                                    <TableHead
                                        className="w-32"
                                        title="Тариф free-лимита: строгий (таксисты) / общий (остальные)"
                                    >
                                        Тариф
                                    </TableHead>
                                    <TableHead
                                        className="w-32 text-right"
                                        title="Использовано free-лимита сегодня (по тарифу)"
                                    >
                                        Free сегодня
                                    </TableHead>
                                    <TableHead
                                        className="w-28 text-right"
                                        title="Купленные лимиты (carry-over)"
                                    >
                                        Куплено
                                    </TableHead>
                                    <TableHead
                                        className="w-28 text-center"
                                        title="Сколько раз пользователь упёрся в дневной лимит просмотра номеров сегодня"
                                    >
                                        Лимит сегодня
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drivers.map((d: LimitedDriverRow, i: number) => {
                                    const effectiveLimited = d.limit_override ?? d.is_limited
                                    return (
                                        <TableRow
                                            key={d.user_id}
                                            className={
                                                effectiveLimited
                                                    ? 'bg-red-50 dark:bg-red-950/30'
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="text-muted-foreground tabular-nums">
                                                {(page - 1) * LIST_SIZE + i + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/users/${d.user_id}`}
                                                    className="flex items-center gap-2 hover:underline"
                                                >
                                                    <UserAvatar url={d.avatar_url} name={d.name} />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span>
                                                                {d.name ?? `user #${d.user_id}`}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                                #{d.user_id}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-normal text-muted-foreground">
                                                            был онлайн:{' '}
                                                            {d.last_online_at
                                                                ? new Date(
                                                                      d.last_online_at,
                                                                  ).toLocaleString()
                                                                : '—'}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums font-semibold">
                                                {d.window_views}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                {d.active_days}
                                            </TableCell>
                                            <TableCell>
                                                <LimitStatusControl
                                                    d={d}
                                                    pending={limitedM.isPending}
                                                    onSet={value =>
                                                        limitedM.mutate({
                                                            userId: d.user_id,
                                                            value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AdjustPopover
                                                    title="Free сегодня"
                                                    current={d.free_used}
                                                    pending={freeM.isPending}
                                                    quickResetTo={0}
                                                    quickResetLabel="Сброс (0)"
                                                    onSubmit={value =>
                                                        freeM.mutate({ userId: d.user_id, value })
                                                    }
                                                    display={
                                                        <>
                                                            <span
                                                                className={
                                                                    d.free_remaining === 0
                                                                        ? 'text-red-600 dark:text-red-400 font-semibold'
                                                                        : undefined
                                                                }
                                                            >
                                                                {d.free_used}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {' '}
                                                                / {d.free_limit}
                                                            </span>
                                                        </>
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AdjustPopover
                                                    title="Купленные лимиты"
                                                    current={d.credits_balance}
                                                    pending={creditsM.isPending}
                                                    onSubmit={value =>
                                                        creditsM.mutate({
                                                            userId: d.user_id,
                                                            value,
                                                        })
                                                    }
                                                    display={
                                                        <span
                                                            className={
                                                                d.credits_balance > 0
                                                                    ? 'text-green-600 dark:text-green-400 font-semibold'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {d.credits_balance}
                                                        </span>
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <LimitReachedBadge
                                                    count={d.limit_reached_today}
                                                    lastAt={d.limit_reached_last_at}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {drivers.map((d: LimitedDriverRow, i: number) => {
                            const effectiveLimited = d.limit_override ?? d.is_limited
                            return (
                                <div
                                    key={d.user_id}
                                    className={`rounded-lg border p-3 space-y-3 ${
                                        effectiveLimited
                                            ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * LIST_SIZE + i + 1}
                                        </span>
                                        <Link
                                            href={`/admin/users/${d.user_id}`}
                                            className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                                        >
                                            <UserAvatar
                                                url={d.avatar_url}
                                                name={d.name}
                                                className="h-8 w-8"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {d.name ?? `user #${d.user_id}`}
                                                </div>
                                                <div className="truncate text-xs tabular-nums text-muted-foreground">
                                                    #{d.user_id}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    был онлайн:{' '}
                                                    {d.last_online_at
                                                        ? new Date(
                                                              d.last_online_at,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div>
                                            <span className="text-xs text-muted-foreground">
                                                Просмотров{' '}
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {d.window_views}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground">
                                                Активных дней{' '}
                                            </span>
                                            <span className="tabular-nums">{d.active_days}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-t pt-3">
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                Тариф / статус
                                            </div>
                                            <LimitStatusControl
                                                d={d}
                                                pending={limitedM.isPending}
                                                onSet={value =>
                                                    limitedM.mutate({ userId: d.user_id, value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                Free сегодня
                                            </div>
                                            <AdjustPopover
                                                title="Free сегодня"
                                                current={d.free_used}
                                                pending={freeM.isPending}
                                                quickResetTo={0}
                                                quickResetLabel="Сброс (0)"
                                                onSubmit={value =>
                                                    freeM.mutate({ userId: d.user_id, value })
                                                }
                                                display={
                                                    <>
                                                        <span
                                                            className={
                                                                d.free_remaining === 0
                                                                    ? 'text-red-600 dark:text-red-400 font-semibold'
                                                                    : undefined
                                                            }
                                                        >
                                                            {d.free_used}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {' '}
                                                            / {d.free_limit}
                                                        </span>
                                                    </>
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                Куплено
                                            </div>
                                            <AdjustPopover
                                                title="Купленные лимиты"
                                                current={d.credits_balance}
                                                pending={creditsM.isPending}
                                                onSubmit={value =>
                                                    creditsM.mutate({ userId: d.user_id, value })
                                                }
                                                display={
                                                    <span
                                                        className={
                                                            d.credits_balance > 0
                                                                ? 'text-green-600 dark:text-green-400 font-semibold'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        {d.credits_balance}
                                                    </span>
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                Лимит сегодня
                                            </div>
                                            <LimitReachedBadge
                                                count={d.limit_reached_today}
                                                lastAt={d.limit_reached_last_at}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </AsyncBlock>

                {(total > LIST_SIZE || page > 1) && (
                    <div className="mt-4">
                        <Pagination
                            page={page}
                            total={total}
                            size={LIST_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Times the user hit the daily phone-view limit today (KG-day). 0 → dash.
function LimitReachedBadge({ count, lastAt }: { count: number; lastAt?: string | null }) {
    if (count <= 0) return <span className="text-muted-foreground">—</span>
    const last = lastAt ? new Date(lastAt) : null
    return (
        <div className="inline-flex flex-col items-center gap-0.5">
            <span
                className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/50 dark:text-red-300"
                title={`Сегодня упёрся в лимит ${count} раз`}
            >
                {count}
            </span>
            {last && (
                <span
                    className="text-[10px] leading-none text-muted-foreground tabular-nums"
                    title={`Последний раз: ${last.toLocaleString()}`}
                >
                    {last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
        </div>
    )
}
