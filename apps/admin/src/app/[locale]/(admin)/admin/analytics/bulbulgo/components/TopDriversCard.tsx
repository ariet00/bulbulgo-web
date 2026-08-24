'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminRideshareTopDrivers } from '@/hooks/queries/admin'
import {
    AsyncBlock,
    LIST_SIZE,
    PeriodPicker,
    UserInlineLink,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

type TopDriverRow = NonNullable<
    ReturnType<typeof useAdminRideshareTopDrivers>['data']
>['drivers'][number]
type TopVariant = 'trips' | 'phone' | 'ads'

const TOP_DRIVER_SORTS: Record<TopVariant, 'trips_created' | 'phone_views' | 'trip_views'> = {
    trips: 'trips_created',
    phone: 'phone_views',
    ads: 'trip_views',
}

export function TopDriversCard({
    title,
    variant,
    period,
    resetNonce,
}: TabSectionProps & {
    title: string
    variant: TopVariant
}) {
    const [cardP, setCardP, overridden] = useCardPeriod(period, resetNonce)
    const query = useAdminRideshareTopDrivers(cardP, LIST_SIZE, TOP_DRIVER_SORTS[variant])
    const drivers = query.data?.drivers ?? []

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>
                    {title} ({cardP})
                </CardTitle>
                <PeriodPicker value={cardP} onChange={setCardP} overridden={overridden} />
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={drivers.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Телефон</TableHead>
                                    {variant === 'trips' && (
                                        <>
                                            <TableHead className="w-24 text-right font-semibold">
                                                Поездки
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Водительские объявления"
                                            >
                                                Водит.
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Пассажирские объявления"
                                            >
                                                Пасс.
                                            </TableHead>
                                            <TableHead className="w-24 text-right">
                                                Завершено
                                            </TableHead>
                                            <TableHead className="w-16 text-right">%</TableHead>
                                        </>
                                    )}
                                    {variant === 'phone' && (
                                        <>
                                            <TableHead className="w-36 text-right font-semibold">
                                                Просмотров номера
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Просмотры номеров в водительских объявлениях"
                                            >
                                                Водит.
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Просмотры номеров в пассажирских объявлениях"
                                            >
                                                Пасс.
                                            </TableHead>
                                            <TableHead
                                                className="w-28 text-right"
                                                title="Просмотры в первые 10 минут после обновления"
                                            >
                                                из них fast
                                            </TableHead>
                                        </>
                                    )}
                                    {variant === 'ads' && (
                                        <>
                                            <TableHead className="w-36 text-right font-semibold">
                                                Просмотров объявлений
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Просмотры водительских объявлений"
                                            >
                                                Водит.
                                            </TableHead>
                                            <TableHead
                                                className="w-20 text-right"
                                                title="Просмотры пассажирских объявлений"
                                            >
                                                Пасс.
                                            </TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drivers.map((d: TopDriverRow, i: number) => {
                                    const completionPct =
                                        d.trips > 0 ? (d.completed / d.trips) * 100 : 0
                                    return (
                                        <TableRow key={d.user_id}>
                                            <TableCell className="text-muted-foreground tabular-nums">
                                                {i + 1}
                                            </TableCell>
                                            <TableCell>
                                                <UserInlineLink
                                                    userId={d.user_id}
                                                    name={d.name}
                                                    avatarUrl={d.avatar_url}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {d.phone ?? '—'}
                                            </TableCell>
                                            {variant === 'trips' && (
                                                <>
                                                    <TableCell className="text-right tabular-nums font-semibold">
                                                        {d.trips}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.trips_driver}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.trips_passenger}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.completed}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right tabular-nums ${
                                                            completionPct >= 70
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : completionPct >= 40
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {d.trips > 0
                                                            ? `${completionPct.toFixed(0)}%`
                                                            : '—'}
                                                    </TableCell>
                                                </>
                                            )}
                                            {variant === 'phone' && (
                                                <>
                                                    <TableCell className="text-right tabular-nums font-semibold">
                                                        {d.phone_views_made}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.phone_views_made_driver}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.phone_views_made_passenger}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.phone_views_fast_made}
                                                    </TableCell>
                                                </>
                                            )}
                                            {variant === 'ads' && (
                                                <>
                                                    <TableCell className="text-right tabular-nums font-semibold">
                                                        {d.trip_views_made}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.trip_views_made_driver}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {d.trip_views_made_passenger}
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {drivers.map((d: TopDriverRow, i: number) => {
                            const completionPct = d.trips > 0 ? (d.completed / d.trips) * 100 : 0
                            const main =
                                variant === 'trips'
                                    ? { value: d.trips, label: 'Поездки' }
                                    : variant === 'phone'
                                    ? { value: d.phone_views_made, label: 'Просмотров номера' }
                                    : { value: d.trip_views_made, label: 'Просмотров объявл.' }
                            return (
                                <div key={d.user_id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <UserInlineLink
                                                    userId={d.user_id}
                                                    name={d.name}
                                                    avatarUrl={d.avatar_url}
                                                />
                                                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                    {d.phone ?? '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-lg font-semibold tabular-nums">
                                                {main.value}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {main.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                                        {variant === 'trips' && (
                                            <>
                                                <span>
                                                    Водит.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.trips_driver}
                                                    </span>
                                                </span>
                                                <span>
                                                    Пасс.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.trips_passenger}
                                                    </span>
                                                </span>
                                                <span>
                                                    Заверш.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.completed}
                                                    </span>
                                                </span>
                                                <span
                                                    className={
                                                        completionPct >= 70
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : completionPct >= 40
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }
                                                >
                                                    {d.trips > 0
                                                        ? `${completionPct.toFixed(0)}%`
                                                        : '—'}
                                                </span>
                                            </>
                                        )}
                                        {variant === 'phone' && (
                                            <>
                                                <span>
                                                    Водит.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.phone_views_made_driver}
                                                    </span>
                                                </span>
                                                <span>
                                                    Пасс.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.phone_views_made_passenger}
                                                    </span>
                                                </span>
                                                <span>
                                                    fast{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.phone_views_fast_made}
                                                    </span>
                                                </span>
                                            </>
                                        )}
                                        {variant === 'ads' && (
                                            <>
                                                <span>
                                                    Водит.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.trip_views_made_driver}
                                                    </span>
                                                </span>
                                                <span>
                                                    Пасс.{' '}
                                                    <span className="tabular-nums text-foreground">
                                                        {d.trip_views_made_passenger}
                                                    </span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}

