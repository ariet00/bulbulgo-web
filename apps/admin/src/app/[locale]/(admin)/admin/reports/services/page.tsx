'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink, RefreshCw } from 'lucide-react'
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
import { Link } from '@doska/i18n'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    adminKeys,
    useAdminServicesReportScreens,
    useAdminServicesReportUsage,
    useAdminServicesReportWebviewQuality,
} from '@/hooks/queries/admin'
import { DeltaBadge, REPORT_PERIODS as PERIODS, SummaryCard } from '@/components/admin/reports/shared'

const TYPE_LABELS: Record<string, string> = {
    native: 'нативный',
    webview: 'webview',
}

const FILTER_DEFAULTS = { period: '7d' }

export default function ServicesReportPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const period = values.period

    const usage = useAdminServicesReportUsage({ period })
    const webview = useAdminServicesReportWebviewQuality({ period })
    const screens = useAdminServicesReportScreens({ period, limit: 30 })

    const queryClient = useQueryClient()
    const isFetching = usage.isFetching || webview.isFetching || screens.isFetching
    const refreshAll = () => queryClient.invalidateQueries({ queryKey: adminKeys.reports() })

    const u = usage.data ?? []
    const totalOpens = u.reduce((acc, r) => acc + r.opens, 0)
    const prevTotalOpens = u.reduce((acc, r) => acc + r.prev_opens, 0)
    const activeServices = u.filter(r => r.opens > 0).length
    const s = screens.data ?? []
    const totalViews = s.reduce((acc, r) => acc + r.views, 0)
    const prevTotalViews = s.reduce((acc, r) => acc + r.prev_views, 0)
    const totalWebviewErrors = (webview.data ?? []).reduce((acc, r) => acc + r.errors, 0)

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Отчёт — сервисы и экраны</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Какие сервисы «Главной» открывают и как часто, качество webview,
                        топ экранов приложения. Настройки карточек — в{' '}
                        <Link href="/admin/services" className="underline underline-offset-2">
                            Сервисах
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setValues({ period: p.value })}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={refreshAll} disabled={isFetching}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Открытий сервисов"
                    value={usage.data ? totalOpens : undefined}
                    prev={prevTotalOpens}
                    goodWhenUp
                />
                <SummaryCard
                    title="Активных сервисов"
                    value={usage.data ? activeServices : undefined}
                    hint={usage.data ? `из ${u.length} в реестре` : undefined}
                />
                <SummaryCard
                    title="Просмотров экранов"
                    value={screens.data ? totalViews : undefined}
                    prev={prevTotalViews}
                    goodWhenUp
                />
                <SummaryCard
                    title="Ошибок webview"
                    value={webview.data ? totalWebviewErrors : undefined}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Сервисы «Главной» ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {usage.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : u.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Сервис</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead className="text-right">Открытий</TableHead>
                                        <TableHead className="text-right">Уников</TableHead>
                                        <TableHead className="text-right">Δ к пред. периоду</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {u.map(r => (
                                        <TableRow key={r.slug}>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="font-medium">{r.label || r.slug}</div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {r.slug}
                                                    {r.enabled === false && ' · выключен'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {r.type ? TYPE_LABELS[r.type] ?? r.type : '—'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums font-medium">
                                                {r.opens.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.users.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeltaBadge value={r.opens} prev={r.prev_opens} goodWhenUp />
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/analytics/events/main_tab_switched?subtype=${encodeURIComponent(r.slug)}`}
                                                    className="text-muted-foreground hover:text-foreground"
                                                    title="Подробнее в аналитике событий"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        Событие «открытие» — переключение верхней ленты продуктов или тап по
                        карточке на «Главной» (main_tab_switched). Сервисы с 0 открытий тоже
                        показаны — карточка есть в реестре, но её не используют.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Качество webview ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {webview.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : (webview.data ?? []).length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Сервис</TableHead>
                                        <TableHead className="text-right">Загрузок</TableHead>
                                        <TableHead className="text-right">Медиана, мс</TableHead>
                                        <TableHead className="text-right">Среднее, мс</TableHead>
                                        <TableHead className="text-right">Ошибок JS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(webview.data ?? []).map(r => (
                                        <TableRow key={r.slug}>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="font-medium">{r.label || r.slug}</div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {r.slug}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.loads.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.median_load_ms ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.avg_load_ms ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.errors > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                                        {r.errors.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    0
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        Время загрузки — до первой отрисовки страницы. Строка появляется, только
                        если за период было хоть одно событие загрузки или ошибки.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Топ экранов ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {screens.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : s.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Экран</TableHead>
                                        <TableHead className="text-right">Просмотров</TableHead>
                                        <TableHead className="text-right">Уников</TableHead>
                                        <TableHead className="text-right">Δ к пред. периоду</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {s.map(r => (
                                        <TableRow key={r.screen}>
                                            <TableCell className="font-mono text-sm">{r.screen}</TableCell>
                                            <TableCell className="text-right tabular-nums font-medium">
                                                {r.views.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {r.users.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeltaBadge value={r.views} prev={r.prev_views} goodWhenUp />
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/analytics/events/screen_viewed?subtype=${encodeURIComponent(r.screen)}`}
                                                    className="text-muted-foreground hover:text-foreground"
                                                    title="Подробнее в аналитике событий"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        Числовые сегменты пути (id объявления, чата и т.п.) клиент нормализует в
                        «:id», иначе каждый переход считался бы отдельным экраном.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
