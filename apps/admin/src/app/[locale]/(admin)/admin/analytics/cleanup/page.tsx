'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Label,
    Switch,
} from '@doska/ui'
import { RefreshCw, Trash2 } from 'lucide-react'
import {
    useAdminAnalyticsCleanupConfig,
    useAdminAnalyticsCleanupPreview,
} from '@/hooks/queries/admin'
import {
    useRunAnalyticsCleanup,
    useSetAnalyticsCleanupConfig,
} from '@/hooks/mutations/admin'

export default function AnalyticsCleanupPage() {
    const config = useAdminAnalyticsCleanupConfig()
    const preview = useAdminAnalyticsCleanupPreview()
    const save = useSetAnalyticsCleanupConfig()
    const run = useRunAnalyticsCleanup()

    const [enabled, setEnabled] = useState(false)
    const [retentionDays, setRetentionDays] = useState('90')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')

    // Hydrate local state once the saved config arrives.
    useEffect(() => {
        if (!config.data) return
        setEnabled(config.data.enabled)
        setRetentionDays(String(config.data.retention_days))
        setSelected(new Set(config.data.event_types))
    }, [config.data])

    const available = config.data?.available_event_types ?? []
    const filtered = useMemo(
        () => available.filter(t => t.toLowerCase().includes(search.trim().toLowerCase())),
        [available, search],
    )

    const toggleType = (t: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(t)) next.delete(t)
            else next.add(t)
            return next
        })
    }

    const onSave = () => {
        const days = Number(retentionDays)
        if (!Number.isFinite(days) || days < 1) return
        save.mutate({
            enabled,
            retention_days: Math.trunc(days),
            event_types: [...selected],
        })
    }

    const matching = preview.data?.matching ?? 0

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Аналитика — очистка</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Автоматическое удаление старых «ненужных» событий из таблицы аналитики.
                        Задача запускается раз в сутки и удаляет события выбранных типов старше
                        указанного периода.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label className="text-sm font-medium">Автоматическая очистка</Label>
                            <p className="text-xs text-muted-foreground">
                                Когда выключено — фоновая задача ничего не удаляет.
                            </p>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>

                    <div className="max-w-xs">
                        <Label className="text-sm font-medium">Удалять события старше (дней)</Label>
                        <Input
                            type="number"
                            min={1}
                            max={3650}
                            value={retentionDays}
                            onChange={e => setRetentionDays(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                            <Label className="text-sm font-medium">
                                Ненужные события ({selected.size} выбрано)
                            </Label>
                            <Input
                                placeholder="Поиск типа события…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-8 w-56"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Отмеченные типы будут удаляться. Остальные события сохраняются без
                            ограничения срока.
                        </p>
                        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto rounded-md border p-3">
                            {filtered.map(t => (
                                <label
                                    key={t}
                                    className="flex items-center gap-2 cursor-pointer text-sm font-mono"
                                >
                                    <Checkbox
                                        checked={selected.has(t)}
                                        onCheckedChange={() => toggleType(t)}
                                    />
                                    {t}
                                </label>
                            ))}
                            {filtered.length === 0 && (
                                <div className="text-sm text-muted-foreground col-span-full">
                                    Ничего не найдено
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={onSave} disabled={save.isPending}>
                            Сохранить
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Предпросмотр и запуск</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                            Под сохранённые настройки сейчас попадает:
                        </span>
                        <Badge variant="secondary" className="tabular-nums">
                            {preview.isFetching ? '…' : matching.toLocaleString()} записей
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => preview.refetch()}
                            disabled={preview.isFetching}
                        >
                            <RefreshCw
                                className={`mr-1 h-4 w-4 ${preview.isFetching ? 'animate-spin' : ''}`}
                            />
                            Пересчитать
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Предпросмотр считается по последним сохранённым настройкам, а не по
                        несохранённым изменениям выше.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => run.mutate()}
                        disabled={run.isPending}
                    >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Запустить очистку сейчас
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
