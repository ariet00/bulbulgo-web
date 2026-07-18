'use client'

import {
    useAdminCeleryRun,
    useAdminCeleryRuns,
    useAdminCeleryRunsSummary,
} from '@/hooks/queries/admin'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useState } from 'react'

import {
    StatusBadge,
    formatDateTime,
    formatRuntime,
} from '@/components/admin/celery/shared'

const STATUSES = ['SUCCESS', 'FAILURE', 'STARTED', 'RETRY'] as const
const ALL = '__all__'
const PAGE_SIZE = 50

export function HistoryTab() {
    const [q, setQ] = useState('')
    const [qInput, setQInput] = useState('')
    const [status, setStatus] = useState<string>(ALL)
    const [page, setPage] = useState(1)
    const [detailId, setDetailId] = useState<number | null>(null)

    const filters = {
        q: q || undefined,
        status: status === ALL ? undefined : status,
        page,
        size: PAGE_SIZE,
    }
    const { data, isLoading, isFetching } = useAdminCeleryRuns(filters)
    const { data: summary } = useAdminCeleryRunsSummary(24)
    const { data: detail } = useAdminCeleryRun(detailId)

    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const applySearch = () => {
        setPage(1)
        setQ(qInput.trim())
    }

    const statusCount = (s: string) =>
        summary?.by_status.find((x) => x.status === s)?.count ?? 0

    return (
        <div className="space-y-4">
            {/* 24h summary */}
            <Card>
                <CardHeader>
                    <CardTitle>За последние 24 часа</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    setStatus(s)
                                    setPage(1)
                                }}
                                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                            >
                                <StatusBadge status={s} />
                                <span className="ml-2 font-semibold">{statusCount(s)}</span>
                            </button>
                        ))}
                    </div>
                    {(summary?.top_failed?.length ?? 0) > 0 && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Чаще всего падают: </span>
                            {summary!.top_failed.map((f) => (
                                <Badge key={f.name} variant="outline" className="ml-1 font-mono">
                                    {f.name} · {f.count}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Поиск по имени задачи или task_id…"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className="max-w-xs"
                />
                <Button variant="outline" onClick={applySearch}>
                    Найти
                </Button>
                <Select
                    value={status}
                    onValueChange={(v) => {
                        setStatus(v)
                        setPage(1)
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Все статусы</SelectItem>
                        {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="ml-auto text-sm text-muted-foreground">
                    {total} записей{isFetching ? ' · …' : ''}
                </span>
            </div>

            {/* Runs table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Worker</TableHead>
                            <TableHead>Длит.</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Retries</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6}>Loading...</TableCell>
                            </TableRow>
                        ) : (data?.items?.length ?? 0) === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-muted-foreground">
                                    Ничего не найдено.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data!.items.map((r) => (
                                <TableRow
                                    key={r.id}
                                    className="cursor-pointer"
                                    onClick={() => setDetailId(r.id)}
                                >
                                    <TableCell className="font-mono text-xs">
                                        {r.name}
                                        <div className="text-muted-foreground">{r.task_id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={r.status} />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs break-all max-w-[160px] truncate">
                                        {r.worker ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-xs">{formatRuntime(r.runtime_ms)}</TableCell>
                                    <TableCell className="text-xs">{formatDateTime(r.started_at)}</TableCell>
                                    <TableCell className="text-xs">{r.retries}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Назад
                </Button>
                <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Вперёд
                </Button>
            </div>

            {/* Detail dialog */}
            <Dialog open={detailId != null} onOpenChange={(o) => !o && setDetailId(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-sm break-all">
                            {detail?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {detail && (
                        <div className="space-y-3 text-sm">
                            <div className="flex flex-wrap gap-2 items-center">
                                <StatusBadge status={detail.status} />
                                <span className="text-muted-foreground font-mono text-xs">
                                    {detail.task_id}
                                </span>
                            </div>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                                <dt className="text-muted-foreground">Worker</dt>
                                <dd className="font-mono break-all">{detail.worker ?? '—'}</dd>
                                <dt className="text-muted-foreground">Queue</dt>
                                <dd>{detail.queue ?? '—'}</dd>
                                <dt className="text-muted-foreground">Retries</dt>
                                <dd>{detail.retries}</dd>
                                <dt className="text-muted-foreground">Started</dt>
                                <dd>{formatDateTime(detail.started_at)}</dd>
                                <dt className="text-muted-foreground">Finished</dt>
                                <dd>{formatDateTime(detail.finished_at)}</dd>
                                <dt className="text-muted-foreground">Runtime</dt>
                                <dd>{formatRuntime(detail.runtime_ms)}</dd>
                            </dl>

                            <DetailBlock title="Args" value={detail.args} />
                            <DetailBlock title="Kwargs" value={detail.kwargs} />
                            {detail.result && (
                                <DetailBlock title="Result" value={detail.result} raw />
                            )}
                            {detail.traceback && (
                                <div>
                                    <div className="mb-1 font-medium text-destructive">Traceback</div>
                                    <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                                        {detail.traceback}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function DetailBlock({
    title,
    value,
    raw,
}: {
    title: string
    value: unknown
    raw?: boolean
}) {
    if (value == null) return null
    const text = raw ? String(value) : JSON.stringify(value, null, 2)
    return (
        <div>
            <div className="mb-1 font-medium">{title}</div>
            <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                {text}
            </pre>
        </div>
    )
}
