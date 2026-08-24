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
import {
    useAdminRideshareTopBumpers,
    useAdminRideshareTopServiceBuyers,
} from '@/hooks/queries/admin'
import { format } from 'date-fns'
import {
    AsyncBlock,
    PeriodPicker,
    UserInlineLink,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

// Кто больше всех поднимает объявления.
export function TopBumpersCard({ period, resetNonce }: TabSectionProps) {
    const [p, setP, over] = useCardPeriod(period, resetNonce)
    const q = useAdminRideshareTopBumpers(p)

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>Топ по подъёмам объявлений ({p})</CardTitle>
                <PeriodPicker value={p} onChange={setP} overridden={over} />
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={q.isLoading} empty={!q.data || q.data.users.length === 0}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead className="text-right">Подъёмов</TableHead>
                                    <TableHead
                                        className="text-right"
                                        title="Скольких разных объявлений касались подъёмы"
                                    >
                                        Объявлений
                                    </TableHead>
                                    <TableHead className="text-right">Дней активности</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {q.data?.users.map(u => (
                                    <TableRow key={u.user_id}>
                                        <TableCell>
                                            <UserInlineLink
                                                userId={u.user_id}
                                                name={u.name}
                                                avatarUrl={u.avatar_url}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-medium">
                                            {u.bumps.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {u.trips_bumped.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {u.active_days.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}

// Кто и на сколько покупает платные услуги.
export function TopServiceBuyersCard({ period, resetNonce }: TabSectionProps) {
    const [p, setP, over] = useCardPeriod(period, resetNonce)
    const [sortBy, setSortBy] = useState<'spend' | 'activations'>('spend')
    const q = useAdminRideshareTopServiceBuyers(p, 20, sortBy)

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>Топ покупателей услуг ({p})</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1">
                        <Button
                            variant={sortBy === 'spend' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setSortBy('spend')}
                        >
                            По тратам
                        </Button>
                        <Button
                            variant={sortBy === 'activations' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setSortBy('activations')}
                        >
                            По активациям
                        </Button>
                    </div>
                    <PeriodPicker value={p} onChange={setP} overridden={over} />
                </div>
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={q.isLoading} empty={!q.data || q.data.users.length === 0}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead className="text-right">Активаций</TableHead>
                                    <TableHead className="text-right">Потратил</TableHead>
                                    <TableHead className="text-right">Авто-подъём</TableHead>
                                    <TableHead className="text-right">Срочно</TableHead>
                                    <TableHead className="text-right">Последняя</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {q.data?.users.map(u => (
                                    <TableRow key={u.user_id}>
                                        <TableCell>
                                            <UserInlineLink
                                                userId={u.user_id}
                                                name={u.name}
                                                avatarUrl={u.avatar_url}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {u.activations.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-medium">
                                            {u.spend.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {u.auto_bump.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {u.urgent.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums whitespace-nowrap text-muted-foreground">
                                            {u.last_activated_at
                                                ? format(
                                                      new Date(u.last_activated_at),
                                                      'dd.MM.yyyy HH:mm',
                                                  )
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}
