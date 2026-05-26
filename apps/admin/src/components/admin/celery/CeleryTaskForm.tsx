'use client'

import {
    CeleryCrontab,
    CeleryInterval,
    CeleryPeriodicTask,
    useAdminCreateCeleryTask,
    useAdminUpdateCeleryTask,
} from '@doska/shared'
import {
    Button,
    Input,
    Label,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    Switch,
    Textarea,
} from '@doska/ui'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    task?: CeleryPeriodicTask | null
}

const QUEUES = ['celery', 'patchright_queue']

export function CeleryTaskForm({ open, onOpenChange, task }: Props) {
    const create = useAdminCreateCeleryTask()
    const update = useAdminUpdateCeleryTask()

    const [name, setName] = useState('')
    const [taskPath, setTaskPath] = useState('')
    const [args, setArgs] = useState('[]')
    const [kwargs, setKwargs] = useState('{}')
    const [queue, setQueue] = useState<string>('celery')
    const [enabled, setEnabled] = useState(true)
    const [oneOff, setOneOff] = useState(false)
    const [description, setDescription] = useState('')
    const [scheduleType, setScheduleType] = useState<'crontab' | 'interval'>('crontab')
    const [crontab, setCrontab] = useState<CeleryCrontab>({
        minute: '*',
        hour: '*',
        day_of_week: '*',
        day_of_month: '*',
        month_of_year: '*',
        timezone: 'UTC',
    })
    const [interval, setInterval] = useState<CeleryInterval>({ every: 60, period: 'seconds' })

    useEffect(() => {
        if (task) {
            setName(task.name)
            setTaskPath(task.task)
            setArgs(task.args || '[]')
            setKwargs(task.kwargs || '{}')
            setQueue(task.queue || 'celery')
            setEnabled(task.enabled)
            setOneOff(task.one_off)
            setDescription(task.description || '')
            if (task.crontab) {
                setScheduleType('crontab')
                setCrontab(task.crontab)
            } else if (task.interval) {
                setScheduleType('interval')
                setInterval(task.interval)
            }
        } else {
            setName('')
            setTaskPath('')
            setArgs('[]')
            setKwargs('{}')
            setQueue('celery')
            setEnabled(true)
            setOneOff(false)
            setDescription('')
            setScheduleType('crontab')
        }
    }, [task, open])

    const submit = async () => {
        if (!name.trim() || !taskPath.trim()) {
            toast.error('Name and task path are required')
            return
        }
        try {
            JSON.parse(args)
            JSON.parse(kwargs)
        } catch {
            toast.error('args / kwargs must be valid JSON')
            return
        }
        const body = {
            name: name.trim(),
            task: taskPath.trim(),
            args,
            kwargs,
            queue: queue || null,
            enabled,
            one_off: oneOff,
            description: description || null,
            crontab: scheduleType === 'crontab' ? crontab : null,
            interval: scheduleType === 'interval' ? interval : null,
        }
        try {
            if (task) {
                await update.mutateAsync({ id: task.id, body })
                toast.success('Task updated')
            } else {
                await create.mutateAsync(body)
            }
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Error')
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{task ? `Edit: ${task.name}` : 'New periodic task'}</SheetTitle>
                </SheetHeader>

                <div className="space-y-3 pt-4 px-1">
                    <div>
                        <Label>Name (unique slug)</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="archive-expired-trips" />
                    </div>

                    <div>
                        <Label>Task path (dotted)</Label>
                        <Input
                            value={taskPath}
                            onChange={(e) => setTaskPath(e.target.value)}
                            placeholder="apps.bulbulgo.rideshare.tasks.archiver.archive_expired_trips"
                            className="font-mono text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <Label>args (JSON)</Label>
                            <Input value={args} onChange={(e) => setArgs(e.target.value)} className="font-mono text-xs" />
                        </div>
                        <div>
                            <Label>kwargs (JSON)</Label>
                            <Input value={kwargs} onChange={(e) => setKwargs(e.target.value)} className="font-mono text-xs" />
                        </div>
                    </div>

                    <div>
                        <Label>Queue</Label>
                        <select
                            value={queue}
                            onChange={(e) => setQueue(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            {QUEUES.map((q) => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={enabled} onCheckedChange={setEnabled} /> Enabled
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={oneOff} onCheckedChange={setOneOff} /> One-off
                        </label>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex gap-2 mb-2">
                            <Button
                                size="sm"
                                variant={scheduleType === 'crontab' ? 'default' : 'outline'}
                                onClick={() => setScheduleType('crontab')}
                            >
                                Crontab
                            </Button>
                            <Button
                                size="sm"
                                variant={scheduleType === 'interval' ? 'default' : 'outline'}
                                onClick={() => setScheduleType('interval')}
                            >
                                Interval
                            </Button>
                        </div>

                        {scheduleType === 'crontab' ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {(['minute', 'hour', 'day_of_month', 'month_of_year', 'day_of_week'] as const).map((field) => (
                                        <div key={field}>
                                            <Label className="text-[10px]">{field}</Label>
                                            <Input
                                                value={crontab[field]}
                                                onChange={(e) => setCrontab({ ...crontab, [field]: e.target.value })}
                                                className="font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <Label>Timezone</Label>
                                    <Input
                                        value={crontab.timezone}
                                        onChange={(e) => setCrontab({ ...crontab, timezone: e.target.value })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label>Every</Label>
                                    <Input
                                        type="number"
                                        value={interval.every}
                                        onChange={(e) => setInterval({ ...interval, every: parseInt(e.target.value, 10) || 1 })}
                                    />
                                </div>
                                <div>
                                    <Label>Period</Label>
                                    <select
                                        value={interval.period}
                                        onChange={(e) => setInterval({ ...interval, period: e.target.value as CeleryInterval['period'] })}
                                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                                    >
                                        {(['seconds', 'minutes', 'hours', 'days'] as const).map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full mt-3"
                        onClick={submit}
                        disabled={create.isPending || update.isPending}
                    >
                        {task ? 'Save' : 'Create'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
