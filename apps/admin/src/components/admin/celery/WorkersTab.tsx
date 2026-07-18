'use client'

import {
    useAdminCeleryActive,
    useAdminCeleryWorkers,
} from '@/hooks/queries/admin'
import {
    Badge,
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
import { CircleDot, Server } from 'lucide-react'

import { formatUptime } from '@/components/admin/celery/shared'
import type { CeleryActiveTask } from '@/apis/admin'

function sumTotals(total?: Record<string, number>): number {
    if (!total) return 0
    return Object.values(total).reduce((a, b) => a + b, 0)
}

function formatStarted(epoch?: number | null): string {
    if (!epoch) return '—'
    return new Date(epoch * 1000).toLocaleTimeString('ru-RU')
}

export function WorkersTab() {
    const { data: workersData, isLoading: workersLoading } = useAdminCeleryWorkers()
    const { data: activeData } = useAdminCeleryActive()

    const workers = workersData?.workers ?? []

    // Flatten active tasks across workers into one running-now table.
    const running: (CeleryActiveTask & { _worker: string })[] = []
    for (const [host, tasks] of Object.entries(activeData?.active ?? {})) {
        for (const t of tasks) running.push({ ...t, _worker: host })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="size-4" /> Воркеры
                        <span className="text-sm font-normal text-muted-foreground">
                            (live, обновляется каждые 10с)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {workersLoading ? (
                        <div>Loading...</div>
                    ) : workers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Нет подключённых воркеров (или они не отвечают на inspect за 2с).
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {workers.map((w) => {
                                const s = w.stats ?? {}
                                const concurrency = s.pool?.['max-concurrency']
                                return (
                                    <div
                                        key={w.hostname}
                                        className="rounded-md border p-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs break-all">
                                                {w.hostname}
                                            </span>
                                            <Badge
                                                variant={w.online ? 'default' : 'outline'}
                                                className="shrink-0"
                                            >
                                                <CircleDot className="size-3 mr-1" />
                                                {w.online ? 'online' : 'offline'}
                                            </Badge>
                                        </div>
                                        <dl className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                            <dt>Concurrency</dt>
                                            <dd className="text-right text-foreground">
                                                {concurrency ?? '—'}
                                            </dd>
                                            <dt>Uptime</dt>
                                            <dd className="text-right text-foreground">
                                                {formatUptime(s.uptime as number)}
                                            </dd>
                                            <dt>Обработано</dt>
                                            <dd className="text-right text-foreground">
                                                {sumTotals(s.total)}
                                            </dd>
                                            <dt>Зарегистрировано</dt>
                                            <dd className="text-right text-foreground">
                                                {w.registered.length}
                                            </dd>
                                        </dl>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Выполняется сейчас
                        <Badge variant="secondary" className="ml-2">
                            {running.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {running.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Сейчас ни одна задача не выполняется.
                        </p>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Started</TableHead>
                                        <TableHead>Args</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {running.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-mono text-xs">
                                                {t.name}
                                                <div className="text-muted-foreground">{t.id}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs break-all">
                                                {t._worker}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {formatStarted(t.time_start)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs max-w-[280px] truncate">
                                                {JSON.stringify(t.args ?? [])}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
