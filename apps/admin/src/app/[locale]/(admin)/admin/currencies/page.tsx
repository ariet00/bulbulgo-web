'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
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
    adminKeys,
    useAdminCurrencies,
    useAdminCurrencyRates,
} from '@/hooks/queries/admin'

export default function CurrenciesPage() {
    const currencies = useAdminCurrencies()
    const rates = useAdminCurrencyRates()

    const queryClient = useQueryClient()
    const isFetching = currencies.isFetching || rates.isFetching
    const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.currencies() })

    const rateFor = (code: string): number | undefined =>
        code === 'KGS' ? 1 : rates.data?.[code]

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Валюты</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Справочник только для чтения (наполняется сидером). Курсы — НБКР,
                        обновляются Celery-таской.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={refresh} disabled={isFetching}>
                    <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Обновить
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Справочник</CardTitle>
                </CardHeader>
                <CardContent>
                    {currencies.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !currencies.data || currencies.data.length === 0 ? (
                        <div className="text-muted-foreground">
                            Справочник пуст — сидер currencies не запускался
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">ID</TableHead>
                                    <TableHead className="w-24">Код</TableHead>
                                    <TableHead className="w-24">Символ</TableHead>
                                    <TableHead>Название</TableHead>
                                    <TableHead className="w-40 text-right">Курс, KGS за 1</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies.data.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="text-muted-foreground">{c.id}</TableCell>
                                        <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                                        <TableCell>{c.symbol}</TableCell>
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {rateFor(c.code) ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {rates.data && Object.keys(rates.data).length === 0 && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Курсы ещё не загружены — таска refresh_exchange_rates не отработала.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
