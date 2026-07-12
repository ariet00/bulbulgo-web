'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import {
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsTopErrors,
} from '@/hooks/queries/admin'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { ErrorSignaturesTable } from '@/components/admin/analytics/errors-ui'
import { Metric, PERIODS, type PeriodProductProps } from './shared'

export function ErrorsTab({ uid, period, setPeriod, product, setProduct }: PeriodProductProps) {
    const userErrorsSummary = useAdminAnalyticsErrorsSummary(period, product || undefined, uid)
    const userErrors = useAdminAnalyticsTopErrors(period, product || undefined, undefined, uid)

    return (
        <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">Период</div>
                        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                            {PERIODS.map(p => (
                                <Button
                                    key={p.value}
                                    variant={period === p.value ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-2.5"
                                    onClick={() => setPeriod(p.value)}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <ProductSelector value={product} onChange={setProduct} />

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Ошибки <span className="text-sm font-normal text-muted-foreground">({period})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userErrorsSummary.data && (
                                <div className="grid gap-3 md:grid-cols-4">
                                    <Metric label="Всего" value={userErrorsSummary.data.total} />
                                    <Metric label="5xx" value={userErrorsSummary.data.server} accent="red" />
                                    <Metric label="4xx" value={userErrorsSummary.data.client} />
                                    <Metric label="422" value={userErrorsSummary.data.validation} />
                                </div>
                            )}
                            {userErrors.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !userErrors.data || userErrors.data.length === 0 ? (
                                <div className="text-muted-foreground">Нет ошибок за период</div>
                            ) : (
                                <ErrorSignaturesTable data={userErrors.data} />
                            )}
                        </CardContent>
                    </Card>
        </div>
    )
}
