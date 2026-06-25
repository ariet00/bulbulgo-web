'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdminAnalyticsAppVersions } from '@/hooks/queries/admin'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { RefreshCw } from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { useTheme } from 'next-themes'
import { CHART_COLORS } from '@/components/admin/analytics/charts'
import { ProductSelector } from '@/components/admin/ProductSelector'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const PLATFORMS: Array<{ value: string; label: string }> = [
    { value: '', label: 'Все' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'web', label: 'Web' },
    { value: 'popytka', label: 'popytka (tg)' },
    { value: 'booking', label: 'booking (tg)' },
    { value: 'akcha', label: 'akcha (tg)' },
    { value: 'staff', label: 'staff (tg)' },
]

type Row = {
    platform: string | null
    app_version: string | null
    events: number
    users: number
}

function useChartTheme() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const dark = mounted && resolvedTheme === 'dark'
    return {
        grid: dark ? '#27272a' : '#e5e7eb',
        axis: dark ? '#a1a1aa' : '#52525b',
        tooltipBg: dark ? '#18181b' : '#ffffff',
        tooltipBorder: dark ? '#3f3f46' : '#e5e7eb',
        tooltipText: dark ? '#fafafa' : '#18181b',
    }
}

export default function AnalyticsVersionsPage() {
    const [period, setPeriod] = useState('7d')
    const [product, setProduct] = useState('')
    const [platform, setPlatform] = useState('')
    const [metric, setMetric] = useState<'users' | 'events'>('users')

    const versions = useAdminAnalyticsAppVersions(period, product || undefined, platform || undefined)
    const rows = (versions.data ?? []) as Row[]
    const t = useChartTheme()

    const totalEvents = rows.reduce((s, r) => s + r.events, 0)
    const totalUsers = rows.reduce((s, r) => s + r.users, 0)

    const { chartRows, versionKeys, platformsOrder } = useMemo(
        () => buildStackedSeries(rows, metric),
        [rows, metric],
    )

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — версии приложения</h1>
                <div className="flex gap-2 items-center flex-wrap">
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => versions.refetch()}
                        disabled={versions.isFetching}
                    >
                        <RefreshCw className={`mr-1 h-4 w-4 ${versions.isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <ProductSelector value={product} onChange={setProduct} />

            <div className="flex gap-1 flex-wrap">
                {PLATFORMS.map(p => (
                    <Button
                        key={p.value || 'all'}
                        variant={platform === p.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPlatform(p.value)}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                    <CardTitle>Распределение по платформам ({period})</CardTitle>
                    <div className="flex gap-1">
                        <Button
                            variant={metric === 'users' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMetric('users')}
                        >
                            Пользователи
                        </Button>
                        <Button
                            variant={metric === 'events' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMetric('events')}
                        >
                            События
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {versions.isLoading ? (
                        <div>Загрузка…</div>
                    ) : chartRows.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={Math.max(220, platformsOrder.length * 60)}>
                            <BarChart
                                data={chartRows}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                                <XAxis
                                    type="number"
                                    allowDecimals={false}
                                    fontSize={12}
                                    stroke={t.axis}
                                    tick={{ fill: t.axis }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="platform"
                                    width={110}
                                    fontSize={12}
                                    stroke={t.axis}
                                    tick={{ fill: t.axis }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: t.tooltipBg,
                                        border: `1px solid ${t.tooltipBorder}`,
                                        borderRadius: 6,
                                        color: t.tooltipText,
                                    }}
                                    labelStyle={{ color: t.tooltipText }}
                                    itemStyle={{ color: t.tooltipText }}
                                />
                                <Legend wrapperStyle={{ color: t.axis }} />
                                {versionKeys.map((v, i) => (
                                    <Bar
                                        key={v}
                                        dataKey={v}
                                        stackId="v"
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Таблица: платформа × версия ({rows.length}) — всего {totalUsers.toLocaleString()} польз.,{' '}
                        {totalEvents.toLocaleString()} событий
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {versions.isLoading ? (
                        <div>Загрузка…</div>
                    ) : rows.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-32">Платформа</TableHead>
                                    <TableHead>Версия</TableHead>
                                    <TableHead className="w-28 text-right">Пользователи</TableHead>
                                    <TableHead className="w-28 text-right">События</TableHead>
                                    <TableHead className="w-24 text-right">% польз.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((r, i) => (
                                    <TableRow key={`${r.platform ?? 'null'}-${r.app_version ?? 'null'}-${i}`}>
                                        <TableCell className="font-mono text-sm">{r.platform ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-sm">{r.app_version ?? '—'}</TableCell>
                                        <TableCell className="text-right">{r.users.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{r.events.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {totalUsers ? ((r.users / totalUsers) * 100).toFixed(1) : '0'}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function buildStackedSeries(rows: Row[], metric: 'users' | 'events') {
    const byPlatform = new Map<string, Map<string, number>>()
    const platformTotals = new Map<string, number>()
    const versionTotals = new Map<string, number>()

    for (const r of rows) {
        const p = r.platform ?? 'неизв.'
        const v = r.app_version ?? 'неизв.'
        const value = r[metric]
        if (!byPlatform.has(p)) byPlatform.set(p, new Map())
        byPlatform.get(p)!.set(v, (byPlatform.get(p)!.get(v) ?? 0) + value)
        platformTotals.set(p, (platformTotals.get(p) ?? 0) + value)
        versionTotals.set(v, (versionTotals.get(v) ?? 0) + value)
    }

    const platformsOrder = [...platformTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([p]) => p)
    const versionKeys = [...versionTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([v]) => v)

    const chartRows = platformsOrder.map(p => {
        const versions = byPlatform.get(p)!
        const row: Record<string, number | string> = { platform: p }
        for (const v of versionKeys) row[v] = versions.get(v) ?? 0
        return row
    })

    return { chartRows, versionKeys, platformsOrder }
}
