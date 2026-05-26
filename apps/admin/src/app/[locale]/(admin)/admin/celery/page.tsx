'use client'

import {
    CeleryPeriodicTask,
    useAdminCeleryTasks,
    useAdminDeleteCeleryTask,
    useAdminRefreshCeleryBeat,
    useAdminUpdateCeleryTask,
} from '@doska/shared'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CeleryTaskForm } from '@/components/admin/celery/CeleryTaskForm'

function formatSchedule(t: CeleryPeriodicTask): string {
    if (t.crontab) {
        const c = t.crontab
        return `cron: ${c.minute} ${c.hour} ${c.day_of_month} ${c.month_of_year} ${c.day_of_week} (${c.timezone})`
    }
    if (t.interval) {
        return `every ${t.interval.every} ${t.interval.period}`
    }
    return '—'
}

function formatLastRun(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('ru-RU')
}

export default function CeleryAdminPage() {
    const { data, isLoading } = useAdminCeleryTasks()
    const refresh = useAdminRefreshCeleryBeat()
    const update = useAdminUpdateCeleryTask()
    const remove = useAdminDeleteCeleryTask()

    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<CeleryPeriodicTask | null>(null)

    const toggleEnabled = async (t: CeleryPeriodicTask, enabled: boolean) => {
        try {
            await update.mutateAsync({ id: t.id, body: { enabled } })
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to update')
        }
    }

    const onDelete = async (t: CeleryPeriodicTask) => {
        if (!confirm(`Delete task "${t.name}"?`)) return
        try {
            await remove.mutateAsync(t.id)
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to delete')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Celery — Periodic tasks</h1>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => refresh.mutate()}
                        disabled={refresh.isPending}
                    >
                        <RefreshCcw className="size-4 mr-1" /> Refresh beat
                    </Button>
                    <Button
                        onClick={() => {
                            setEditing(null)
                            setOpen(true)
                        }}
                    >
                        <Plus className="size-4 mr-1" /> New task
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule (from celery_periodictask)</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (data?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Нет периодических задач. Создайте новую или запустите Celery beat — он создаст таблицы и засеет дефолтные.
                        </p>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Task path</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Queue</TableHead>
                                    <TableHead>Enabled</TableHead>
                                    <TableHead>Last run</TableHead>
                                    <TableHead>Runs</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data ?? []).map((t) => {
                                    const isLegacy = t.task.startsWith('app.tasks.')
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {t.task}
                                                {isLegacy && (
                                                    <Badge variant="destructive" className="ml-2">legacy path</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs">{formatSchedule(t)}</TableCell>
                                            <TableCell className="text-xs">{t.queue || '—'}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={t.enabled}
                                                    onCheckedChange={(v) => toggleEnabled(t, v)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs">{formatLastRun(t.last_run_at)}</TableCell>
                                            <TableCell>{t.total_run_count}</TableCell>
                                            <TableCell className="flex gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditing(t)
                                                        setOpen(true)
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => onDelete(t)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CeleryTaskForm open={open} onOpenChange={setOpen} task={editing} />
        </div>
    )
}
