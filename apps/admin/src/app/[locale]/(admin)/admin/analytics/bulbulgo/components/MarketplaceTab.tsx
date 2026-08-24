'use client'

import { useState } from 'react'
import {
    Button,
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
import { useAdminRideshareDemandSupply } from '@/hooks/queries/admin'
import {
    AsyncBlock,
    PeriodPicker,
    StatCard,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

// Спрос (поиски) против предложения (объявления) по маршрутам.
export function MarketplaceTab({ period, resetNonce }: TabSectionProps) {
    const [p, setP, over] = useCardPeriod(period, resetNonce)
    const [sortBy, setSortBy] = useState<'searches' | 'empty'>('searches')

    const ds = useAdminRideshareDemandSupply(p, 30, sortBy)
    const d = ds.data

    const emptyRate =
        d && d.total_searches > 0
            ? `${((d.empty_searches / d.total_searches) * 100).toFixed(1)}%`
            : undefined

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Спрос и предложение ({p})
                    </h2>
                    <PeriodPicker value={p} onChange={setP} overridden={over} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Поисков"
                        value={d?.total_searches}
                        loading={ds.isLoading}
                    />
                    <StatCard
                        title="Искавших пользователей"
                        value={d?.unique_searchers}
                        loading={ds.isLoading}
                    />
                    <StatCard
                        title="Пустых поисков"
                        value={d?.empty_searches}
                        loading={ds.isLoading}
                        hint="выдача была пустой — упущенный спрос"
                    />
                    <StatCard
                        title="Доля пустых"
                        value={emptyRate}
                        loading={ds.isLoading}
                        hint="пустые / все поиски"
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Маршруты: где ищут и что им предлагается</CardTitle>
                    <div className="flex gap-1">
                        <Button
                            variant={sortBy === 'searches' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setSortBy('searches')}
                        >
                            По поискам
                        </Button>
                        <Button
                            variant={sortBy === 'empty' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setSortBy('empty')}
                        >
                            По пустым
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <AsyncBlock loading={ds.isLoading} empty={!d || d.routes.length === 0}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Маршрут</TableHead>
                                        <TableHead className="text-right">Поиски</TableHead>
                                        <TableHead className="text-right">Искавших</TableHead>
                                        <TableHead className="text-right">Пустых</TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Активных объявлений сейчас"
                                        >
                                            Активных
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Создано объявлений за период"
                                        >
                                            Создано
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Поисков на одно активное объявление — чем выше, тем сильнее дефицит предложения"
                                        >
                                            Спрос/предл.
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {d?.routes.map(r => {
                                        const ratio =
                                            r.active_trips > 0
                                                ? (r.searches / r.active_trips).toFixed(1)
                                                : r.searches > 0
                                                ? '∞'
                                                : '—'
                                        const deficit =
                                            r.active_trips === 0 ||
                                            r.searches / Math.max(r.active_trips, 1) >= 10
                                        return (
                                            <TableRow key={`${r.from_id}-${r.to_id}`}>
                                                <TableCell className="whitespace-nowrap">
                                                    {r.from_name ?? `#${r.from_id}`} →{' '}
                                                    {r.to_name ?? `#${r.to_id}`}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.searches.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.searchers.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.empty_searches > 0 ? (
                                                        <span className="text-amber-600 dark:text-amber-400">
                                                            {r.empty_searches.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        0
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.active_trips.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.created_trips.toLocaleString()}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right tabular-nums ${
                                                        deficit
                                                            ? 'text-red-600 dark:text-red-400 font-medium'
                                                            : ''
                                                    }`}
                                                >
                                                    {ratio}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Красный «спрос/предложение» — дефицит: на маршруте ищут, а активных
                            объявлений нет или почти нет. Пустые поиски считаются по выдаче в
                            момент поиска.
                        </p>
                    </AsyncBlock>
                </CardContent>
            </Card>
        </>
    )
}
