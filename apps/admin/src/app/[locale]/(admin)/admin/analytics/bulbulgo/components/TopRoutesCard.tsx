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
import { useAdminRideshareTopRoutes } from '@/hooks/queries/admin'
import {
    AsyncBlock,
    LIST_SIZE,
    PeriodPicker,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

export function TopRoutesCard({ period, resetNonce }: TabSectionProps) {
    const [cardP, setCardP, overridden] = useCardPeriod(period, resetNonce)
    const query = useAdminRideshareTopRoutes(cardP, LIST_SIZE)
    const routes = query.data?.routes ?? []

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>Топ маршрутов ({cardP})</CardTitle>
                <PeriodPicker value={cardP} onChange={setCardP} overridden={overridden} />
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={routes.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Откуда</TableHead>
                                    <TableHead>Куда</TableHead>
                                    <TableHead className="w-24 text-right">Поездки</TableHead>
                                    <TableHead className="w-28 text-right">Завершено</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map((r, i) => (
                                    <TableRow key={`${r.from_id}-${r.to_id}`}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>{r.from_name ?? `#${r.from_id}`}</TableCell>
                                        <TableCell>{r.to_name ?? `#${r.to_id}`}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {r.trips}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {r.completed}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {routes.map((r, i) => (
                            <div
                                key={`${r.from_id}-${r.to_id}`}
                                className="flex items-start justify-between gap-3 rounded-lg border p-3"
                            >
                                <div className="flex min-w-0 items-start gap-2">
                                    <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 text-sm font-medium">
                                        {r.from_name ?? `#${r.from_id}`} →{' '}
                                        {r.to_name ?? `#${r.to_id}`}
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="text-base font-semibold tabular-nums">
                                        {r.trips}
                                    </div>
                                    <div className="text-[11px] tabular-nums text-muted-foreground">
                                        поездок · заверш. {r.completed}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}

