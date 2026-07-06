'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Link } from '@doska/i18n'
import {
    useAdminAnalyticsAppVersions,
    useAdminAnalyticsAppVersionsTimeseries,
    useAdminAppVersionSettings,
} from '@/hooks/queries/admin'
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
import { RefreshCw, ArrowUpRight } from 'lucide-react'
import { VersionsTimeseriesChart } from '@/components/admin/analytics/charts-lazy'
import { ProductSelector } from '@/components/admin/ProductSelector'

const PERIODS = [
    { value: '24h', label: '24 часа' },
    { value: '7d', label: '7 дней' },
    { value: '30d', label: '30 дней' },
    { value: '90d', label: '90 дней' },
]

const GRANULARITIES = [
    { value: 'day', label: 'По дням' },
    { value: 'week', label: 'По неделям' },
    { value: 'month', label: 'По месяцам' },
]

const PLATFORMS = [
    { value: '', label: 'Все' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'web', label: 'Web' },
    { value: 'popytka', label: 'popytka (tg)' },
    { value: 'booking', label: 'booking (tg)' },
    { value: 'akcha', label: 'akcha (tg)' },
    { value: 'staff', label: 'staff (tg)' },
]

const TOP_VERSIONS = 8

type Row = {
    platform: string | null
    app_version: string | null
    events: number
    users: number
}
type TsRow = { bucket: string; app_version: string | null; users: number }
type Status = 'latest' | 'outdated' | 'below_recommended' | 'below_min' | 'unknown'

type VersionSettings = {
    android_min_version: string
    ios_min_version: string
    android_recommended_version: string
    ios_recommended_version: string
}

// ── version helpers ────────────────────────────────────────────────────────
function parseVersion(v: string | null | undefined): number[] {
    if (!v) return []
    return v
        .split(/[.+\-_]/)
        .map((x) => parseInt(x, 10))
        .filter((n) => !Number.isNaN(n))
}
function cmpVersion(a: string | null | undefined, b: string | null | undefined): number {
    const pa = parseVersion(a)
    const pb = parseVersion(b)
    const n = Math.max(pa.length, pb.length)
    for (let i = 0; i < n; i++) {
        const d = (pa[i] ?? 0) - (pb[i] ?? 0)
        if (d) return d
    }
    return 0
}
function minVersionFor(platform: string | null, s?: VersionSettings): string | null {
    if (!s) return null
    if (platform === 'android') return s.android_min_version || null
    if (platform === 'ios') return s.ios_min_version || null
    return null
}
function recommendedVersionFor(platform: string | null, s?: VersionSettings): string | null {
    if (!s) return null
    if (platform === 'android') return s.android_recommended_version || null
    if (platform === 'ios') return s.ios_recommended_version || null
    return null
}
const STATUS_META: Record<Status, { label: string; cls: string }> = {
    latest: { label: 'Актуальная', cls: 'bg-green-500/15 text-green-600 dark:text-green-400' },
    outdated: { label: 'Устарела', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400' },
    below_recommended: {
        label: 'Ниже рекомендуемой',
        cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    below_min: { label: 'Ниже минимума', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
    unknown: { label: '—', cls: 'bg-muted text-muted-foreground' },
}

function StatusPill({ status }: { status: Status }) {
    const m = STATUS_META[status]
    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${m.cls}`}>
            {m.label}
        </span>
    )
}

export default function AnalyticsVersionsPage() {
    const [period, setPeriod] = useState('7d')
    const [granularity, setGranularity] = useState('day')
    const [product, setProduct] = useState('')
    const [platform, setPlatform] = useState('')

    const versions = useAdminAnalyticsAppVersions(period, product || undefined, platform || undefined)
    const series = useAdminAnalyticsAppVersionsTimeseries(
        period,
        granularity,
        product || undefined,
        platform || undefined,
    )
    const versionSettings = useAdminAppVersionSettings()

    const rows = (versions.data ?? []) as Row[]
    const tsRows = (series.data ?? []) as TsRow[]
    const settings = versionSettings.data

    // ── classify aggregated rows ──
    const { classified, kpi, byPlatform } = useMemo(
        () => classify(rows, settings),
        [rows, settings],
    )

    // ── pivot timeseries into lines ──
    const { lineData, lineKeys } = useMemo(
        () => buildTimeseries(tsRows, TOP_VERSIONS),
        [tsRows],
    )

    const refetchAll = () => {
        versions.refetch()
        series.refetch()
    }
    const loading = versions.isLoading || series.isLoading

    return (
        <div className="space-y-6 p-6">
            {/* Header + filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Версии приложения</h1>
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchAll}
                        disabled={versions.isFetching || series.isFetching}
                    >
                        <RefreshCw
                            className={`mr-1 h-4 w-4 ${
                                versions.isFetching || series.isFetching ? 'animate-spin' : ''
                            }`}
                        />
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <ProductSelector value={product} onChange={setProduct} />
            </div>

            <div className="flex flex-wrap gap-1">
                {PLATFORMS.map((p) => (
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

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard label="Пользователей" value={kpi.totalUsers.toLocaleString()} />
                <KpiCard
                    label="На актуальной версии"
                    value={pct(kpi.latestUsers, kpi.totalUsers)}
                    hint={kpi.latestUsers.toLocaleString() + ' польз.'}
                    tone="good"
                />
                <KpiCard
                    label="Устаревшие"
                    value={pct(kpi.outdatedUsers, kpi.totalUsers)}
                    hint={kpi.outdatedUsers.toLocaleString() + ' польз.'}
                    tone={kpi.outdatedUsers ? 'warn' : undefined}
                />
                <KpiCard
                    label="Ниже минимума"
                    value={pct(kpi.belowMinUsers, kpi.totalUsers)}
                    hint={
                        settings
                            ? `min: Android ${settings.android_min_version} · iOS ${settings.ios_min_version}`
                            : undefined
                    }
                    tone={kpi.belowMinUsers ? 'bad' : undefined}
                    action={
                        <Link
                            href="/admin/settings/app"
                            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Настроить <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    }
                />
            </div>

            {/* Firebase-style line chart: versions over time */}
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <CardTitle>Пользователи по версиям во времени</CardTitle>
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
                    ) : lineData.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <VersionsTimeseriesChart lineData={lineData} lineKeys={lineKeys} />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        Линия = число активных пользователей на версии за интервал.
                        Показаны топ-{TOP_VERSIONS} версий, остальные — «Прочие».
                    </p>
                </CardContent>
            </Card>

            {/* Table grouped by platform */}
            <Card>
                <CardHeader>
                    <CardTitle>Разбивка по платформам и версиям</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : byPlatform.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        byPlatform.map((group) => (
                            <div key={group.platform ?? 'null'}>
                                <div className="mb-2 flex items-baseline gap-2">
                                    <span className="font-mono text-sm font-semibold">
                                        {group.platform ?? '—'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {group.users.toLocaleString()} польз. ·{' '}
                                        {group.rows.length} верс.
                                    </span>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Версия</TableHead>
                                            <TableHead className="w-28 text-right">
                                                Пользователи
                                            </TableHead>
                                            <TableHead className="w-24 text-right">
                                                Доля
                                            </TableHead>
                                            <TableHead className="w-28 text-right">
                                                Накопит.
                                            </TableHead>
                                            <TableHead className="w-36">Статус</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.rows.map((r) => (
                                            <TableRow key={r.app_version ?? 'null'}>
                                                <TableCell className="font-mono text-sm">
                                                    {r.app_version ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {r.users.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {pct(r.users, group.users)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {pct(r.cumulative, group.users)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusPill status={r.status} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))
                    )}
                    {classified.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            «Накопит.» — доля пользователей на этой версии или новее.
                            Пользователь, активный на нескольких версиях, учитывается в
                            каждой.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function pct(part: number, total: number): string {
    if (!total) return '0%'
    return ((part / total) * 100).toFixed(1) + '%'
}

function KpiCard({
    label,
    value,
    hint,
    tone,
    action,
}: {
    label: string
    value: string
    hint?: string
    tone?: 'good' | 'warn' | 'bad'
    action?: ReactNode
}) {
    const toneCls =
        tone === 'good'
            ? 'text-green-600 dark:text-green-400'
            : tone === 'warn'
              ? 'text-amber-600 dark:text-amber-400'
              : tone === 'bad'
                ? 'text-red-600 dark:text-red-400'
                : ''
    return (
        <Card>
            <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    {action}
                </div>
                <div className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</div>
                {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
            </CardContent>
        </Card>
    )
}

// ── data shaping ───────────────────────────────────────────────────────────
type ClassifiedRow = Row & { status: Status; cumulative: number }
type PlatformGroup = {
    platform: string | null
    users: number
    rows: ClassifiedRow[]
}

function classify(rows: Row[], settings?: VersionSettings) {
    // Latest observed version per platform.
    const latestByPlatform = new Map<string, string>()
    for (const r of rows) {
        if (!r.app_version) continue
        const p = r.platform ?? 'null'
        const cur = latestByPlatform.get(p)
        if (!cur || cmpVersion(r.app_version, cur) > 0) {
            latestByPlatform.set(p, r.app_version)
        }
    }

    const statusOf = (r: Row): Status => {
        if (!r.app_version) return 'unknown'
        const min = minVersionFor(r.platform, settings)
        if (min && cmpVersion(r.app_version, min) < 0) return 'below_min'
        const latest = latestByPlatform.get(r.platform ?? 'null')
        if (latest && r.app_version === latest) return 'latest'
        const rec = recommendedVersionFor(r.platform, settings)
        if (rec && cmpVersion(r.app_version, rec) < 0) return 'below_recommended'
        return 'outdated'
    }

    const classified: ClassifiedRow[] = rows.map((r) => ({
        ...r,
        status: statusOf(r),
        cumulative: 0,
    }))

    // Group by platform, sort versions newest→oldest, compute cumulative users.
    const groupsMap = new Map<string, ClassifiedRow[]>()
    for (const r of classified) {
        const key = r.platform ?? 'null'
        if (!groupsMap.has(key)) groupsMap.set(key, [])
        groupsMap.get(key)!.push(r)
    }
    const byPlatform: PlatformGroup[] = []
    for (const [, list] of groupsMap) {
        list.sort((a, b) => cmpVersion(b.app_version, a.app_version))
        let running = 0
        for (const r of list) {
            running += r.users
            r.cumulative = running
        }
        byPlatform.push({
            platform: list[0].platform,
            users: list.reduce((s, r) => s + r.users, 0),
            rows: list,
        })
    }
    byPlatform.sort((a, b) => b.users - a.users)

    // KPIs (respect current filter — rows are already filtered server-side).
    const totalUsers = classified.reduce((s, r) => s + r.users, 0)
    const sumBy = (st: Status) =>
        classified.filter((r) => r.status === st).reduce((s, r) => s + r.users, 0)
    const kpi = {
        totalUsers,
        latestUsers: sumBy('latest'),
        outdatedUsers: sumBy('outdated') + sumBy('below_recommended'),
        belowMinUsers: sumBy('below_min'),
    }

    return { classified, kpi, byPlatform }
}

function buildTimeseries(rows: TsRow[], topN: number) {
    if (rows.length === 0) return { lineData: [] as Record<string, number | string>[], lineKeys: [] as string[] }

    const totals = new Map<string, number>()
    for (const r of rows) {
        const v = r.app_version ?? 'неизв.'
        totals.set(v, (totals.get(v) ?? 0) + r.users)
    }
    const rankedByTotal = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
    const top = new Set(rankedByTotal.slice(0, topN))
    const hasOther = rankedByTotal.length > topN

    const buckets = new Map<string, Record<string, number | string>>()
    for (const r of rows) {
        if (!buckets.has(r.bucket)) buckets.set(r.bucket, { bucket: r.bucket })
        const row = buckets.get(r.bucket)!
        const v = r.app_version ?? 'неизв.'
        const key = top.has(v) ? v : 'Прочие'
        row[key] = ((row[key] as number) ?? 0) + r.users
    }

    const lineData = [...buckets.values()].sort((a, b) =>
        String(a.bucket) < String(b.bucket) ? -1 : 1,
    )

    const lineKeys = [...top].sort((a, b) => cmpVersion(b, a))
    if (hasOther) lineKeys.push('Прочие')

    for (const row of lineData) {
        for (const k of lineKeys) if (row[k] == null) row[k] = 0
    }

    return { lineData, lineKeys }
}
