'use client'

import { use, useState } from 'react'
import { Link } from '@doska/i18n'
import {
    useAdminAd,
    useAdminAdStatsBreakdown,
    useAdminAdStatsDetailed,
    useAdminAdStatsTimeseries,
    useAdminAdStatsUsers,
} from '@/hooks/queries/admin'
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
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { ImpressionsClicksChart } from '@/components/admin/analytics/charts-lazy'

const PERIODS = [
    { value: '24h', label: '24 часа' },
    { value: '7d', label: '7 дней' },
    { value: '30d', label: '30 дней' },
    { value: '90d', label: '90 дней' },
    { value: 'all', label: 'Всё время' },
]

const GRANULARITIES = [
    { value: 'hour', label: 'По часам' },
    { value: 'day', label: 'По дням' },
    { value: 'week', label: 'По неделям' },
]

function pctStr(v: number): string {
    return (v * 100).toFixed(1) + '%'
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <Card>
            <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-2xl font-semibold">{value}</div>
                {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
            </CardContent>
        </Card>
    )
}

function BreakdownTable({
    rows,
    dimLabel,
}: {
    rows: Array<{ value: string | null; impressions: number; clicks: number; ctr: number }>
    dimLabel: string
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{dimLabel}</TableHead>
                    <TableHead className="w-28 text-right">Показы</TableHead>
                    <TableHead className="w-24 text-right">Клики</TableHead>
                    <TableHead className="w-20 text-right">CTR</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((r) => (
                    <TableRow key={r.value ?? 'null'}>
                        <TableCell className="font-mono text-sm">{r.value ?? '—'}</TableCell>
                        <TableCell className="text-right">
                            {r.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {pctStr(r.ctr)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminAdStatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const adId = Number(id)

    const [period, setPeriod] = useState('30d')
    const [granularity, setGranularity] = useState('day')
    const [usersType, setUsersType] = useState<'click' | 'impression'>('click')

    const { data: ad } = useAdminAd(adId)
    const detailed = useAdminAdStatsDetailed(adId, period)
    const series = useAdminAdStatsTimeseries(adId, period, granularity)
    const byPlatform = useAdminAdStatsBreakdown(adId, 'platform', period)
    const byPlacement = useAdminAdStatsBreakdown(adId, 'placement', period)
    const users = useAdminAdStatsUsers(adId, usersType, period)

    const s = detailed.data
    const isFetching =
        detailed.isFetching || series.isFetching || byPlatform.isFetching || users.isFetching
    const refetchAll = () => {
        detailed.refetch()
        series.refetch()
        byPlatform.refetch()
        byPlacement.refetch()
        users.refetch()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/ads/${adId}`}>
                            <ArrowLeft className="size-4 mr-1" /> Назад
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Статистика — {ad?.title ? `«${ad.title}»` : `реклама #${adId}`}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {PERIODS.map((p) => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={refetchAll} disabled={isFetching}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                    label="Показы"
                    value={(s?.impressions ?? 0).toLocaleString()}
                    hint={`${(s?.impression_users ?? 0).toLocaleString()} польз. · ${(s?.impression_devices ?? 0).toLocaleString()} устр.`}
                />
                <KpiCard
                    label="Клики"
                    value={(s?.clicks ?? 0).toLocaleString()}
                    hint={`${(s?.click_users ?? 0).toLocaleString()} польз. · ${(s?.click_devices ?? 0).toLocaleString()} устр.`}
                />
                <KpiCard label="CTR" value={pctStr(s?.ctr ?? 0)} />
                <KpiCard
                    label="Анонимных кликов"
                    value={(s?.anonymous_clicks ?? 0).toLocaleString()}
                    hint="клики без user_id"
                />
            </div>

            {/* Timeseries */}
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <CardTitle>Показы и клики во времени</CardTitle>
                    <div className="flex gap-1">
                        {GRANULARITIES.map((g) => (
                            <Button
                                key={g.value}
                                variant={granularity === g.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setGranularity(g.value)}
                            >
                                {g.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {series.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : (series.data ?? []).length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <ImpressionsClicksChart
                            data={series.data!}
                            granularity={granularity as 'hour' | 'day' | 'week'}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Breakdowns */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>По платформам</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {byPlatform.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (byPlatform.data ?? []).length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <BreakdownTable rows={byPlatform.data!} dimLabel="Платформа" />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>По размещениям</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {byPlacement.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (byPlacement.data ?? []).length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <BreakdownTable rows={byPlacement.data!} dimLabel="Размещение" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Who clicked / saw */}
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <CardTitle>
                        {usersType === 'click' ? 'Кто кликал' : 'Кто видел'}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button
                            variant={usersType === 'click' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUsersType('click')}
                        >
                            Клики
                        </Button>
                        <Button
                            variant={usersType === 'impression' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUsersType('impression')}
                        >
                            Показы
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {users.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : (users.data ?? []).length === 0 ? (
                        <div className="text-muted-foreground">
                            Нет идентифицированных пользователей за период
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead className="w-24 text-right">Раз</TableHead>
                                        <TableHead className="w-44">Первый раз</TableHead>
                                        <TableHead className="w-44">Последний раз</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(users.data ?? []).map((u) => (
                                        <TableRow key={u.user_id}>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/users/${u.user_id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {u.name || `#${u.user_id}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {u.count.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(u.first_seen).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(u.last_seen).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Только авторизованные пользователи — анонимные показы/клики в
                                таблицу не попадают.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
