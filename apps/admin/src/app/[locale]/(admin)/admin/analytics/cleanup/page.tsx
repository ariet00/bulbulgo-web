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
import { ArrowLeft, RefreshCw, Trash2, Zap } from 'lucide-react'
import { Link } from '@doska/i18n'
import {
    useAdminAnalyticsCleanupConfig,
    useAdminAnalyticsCleanupPreview,
} from '@/hooks/queries/admin'
import {
    useAnalyticsPurgePreview,
    useRunAnalyticsCleanup,
    useRunAnalyticsPurge,
    useSetAnalyticsCleanupConfig,
} from '@/hooks/mutations/admin'
import { useConfirm } from '@/components/admin/ConfirmProvider'

function EventTypePicker({
    available,
    selected,
    onToggle,
}: {
    available: string[]
    selected: Set<string>
    onToggle: (t: string) => void
}) {
    const [search, setSearch] = useState('')
    const filtered = useMemo(
        () => available.filter(t => t.toLowerCase().includes(search.trim().toLowerCase())),
        [available, search],
    )
    return (
        <div>
            <Input
                placeholder="Поиск типа события…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-2 h-8 w-56"
            />
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto rounded-md border p-3">
                {filtered.map(t => (
                    <label
                        key={t}
                        className="flex items-center gap-2 cursor-pointer text-sm font-mono"
                    >
                        <Checkbox checked={selected.has(t)} onCheckedChange={() => onToggle(t)} />
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
    )
}

export default function AnalyticsCleanupPage() {
    const config = useAdminAnalyticsCleanupConfig()
    const preview = useAdminAnalyticsCleanupPreview()
    const save = useSetAnalyticsCleanupConfig()
    const run = useRunAnalyticsCleanup()
    const purgePreview = useAnalyticsPurgePreview()
    const purge = useRunAnalyticsPurge()
    const confirm = useConfirm()

    const [enabled, setEnabled] = useState(false)
    const [retentionDays, setRetentionDays] = useState('90')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [fastRetentionDays, setFastRetentionDays] = useState('7')
    const [fastSelected, setFastSelected] = useState<Set<string>>(new Set())

    const [purgeSelected, setPurgeSelected] = useState<Set<string>>(new Set())
    const [purgeBefore, setPurgeBefore] = useState('')

    // Hydrate local state once the saved config arrives.
    useEffect(() => {
        if (!config.data) return
        setEnabled(config.data.enabled)
        setRetentionDays(String(config.data.retention_days))
        setSelected(new Set(config.data.event_types))
        setFastRetentionDays(String(config.data.fast_retention_days))
        setFastSelected(new Set(config.data.fast_event_types))
    }, [config.data])

    const available = config.data?.available_event_types ?? []

    // Тип живёт только в одном уровне: отметка в одном снимает его в другом.
    const toggleStandard = (t: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(t)) next.delete(t)
            else next.add(t)
            return next
        })
        setFastSelected(prev => {
            if (!prev.has(t)) return prev
            const next = new Set(prev)
            next.delete(t)
            return next
        })
    }
    const toggleFast = (t: string) => {
        setFastSelected(prev => {
            const next = new Set(prev)
            if (next.has(t)) next.delete(t)
            else next.add(t)
            return next
        })
        setSelected(prev => {
            if (!prev.has(t)) return prev
            const next = new Set(prev)
            next.delete(t)
            return next
        })
    }
    const togglePurge = (t: string) => {
        setPurgeSelected(prev => {
            const next = new Set(prev)
            if (next.has(t)) next.delete(t)
            else next.add(t)
            return next
        })
        purgePreview.reset()
    }

    const onSave = () => {
        const days = Number(retentionDays)
        const fastDays = Number(fastRetentionDays)
        if (!Number.isFinite(days) || days < 1) return
        if (!Number.isFinite(fastDays) || fastDays < 1) return
        save.mutate({
            enabled,
            retention_days: Math.trunc(days),
            event_types: [...selected],
            fast_retention_days: Math.trunc(fastDays),
            fast_event_types: [...fastSelected],
        })
    }

    const matching = preview.data?.matching ?? 0
    const fastMatching = preview.data?.fast_matching ?? 0

    const purgeReady = purgeSelected.size > 0 && !!purgeBefore
    const onPurgePreview = () => {
        if (!purgeReady) return
        purgePreview.mutate({ event_types: [...purgeSelected], before: purgeBefore })
    }
    const onPurge = async () => {
        if (!purgeReady) return
        const ok = await confirm(
            `Удалить события ${purgeSelected.size} типов старше ${purgeBefore}? Это действие необратимо.`,
        )
        if (!ok) return
        purge.mutate(
            { event_types: [...purgeSelected], before: purgeBefore },
            { onSuccess: () => purgePreview.reset() },
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <Link
                        href="/admin/analytics/events"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> События
                    </Link>
                    <h1 className="mt-1 text-2xl font-semibold">Аналитика — очистка</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Автоматическое удаление старых «ненужных» событий из таблицы аналитики.
                        Задача запускается раз в сутки. Два уровня: обычный и быстрый — у каждого
                        свой срок хранения и свой набор типов.
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

                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <Label className="text-sm font-medium">
                                Обычный уровень ({selected.size} выбрано)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">старше (дней)</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={3650}
                                    value={retentionDays}
                                    onChange={e => setRetentionDays(e.target.value)}
                                    className="h-8 w-24"
                                />
                            </div>
                        </div>
                        <EventTypePicker
                            available={available}
                            selected={selected}
                            onToggle={toggleStandard}
                        />
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <Label className="text-sm font-medium inline-flex items-center gap-1">
                                <Zap className="h-4 w-4 text-amber-500" />
                                Быстрый уровень ({fastSelected.size} выбрано)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">старше (дней)</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={3650}
                                    value={fastRetentionDays}
                                    onChange={e => setFastRetentionDays(e.target.value)}
                                    className="h-8 w-24"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Для шумных событий, которые нужно чистить чаще. Тип может быть только в
                            одном уровне — отметка здесь снимает его в обычном, и наоборот.
                            Неотмеченные типы хранятся без ограничения срока.
                        </p>
                        <EventTypePicker
                            available={available}
                            selected={fastSelected}
                            onToggle={toggleFast}
                        />
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
                            обычный: {preview.isFetching ? '…' : matching.toLocaleString()}
                        </Badge>
                        <Badge variant="secondary" className="tabular-nums">
                            быстрый: {preview.isFetching ? '…' : fastMatching.toLocaleString()}
                        </Badge>
                        <Badge className="tabular-nums">
                            всего:{' '}
                            {preview.isFetching ? '…' : (matching + fastMatching).toLocaleString()}
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

            <Card>
                <CardHeader>
                    <CardTitle>Ручное удаление</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Разовое удаление выбранных типов событий старше указанной даты. Не зависит
                        от настроек автоочистки.
                    </p>
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Типы событий ({purgeSelected.size} выбрано)
                        </Label>
                        <EventTypePicker
                            available={available}
                            selected={purgeSelected}
                            onToggle={togglePurge}
                        />
                    </div>
                    <div className="max-w-xs">
                        <Label className="text-sm font-medium">Удалить события до даты</Label>
                        <Input
                            type="date"
                            value={purgeBefore}
                            onChange={e => {
                                setPurgeBefore(e.target.value)
                                purgePreview.reset()
                            }}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            variant="outline"
                            onClick={onPurgePreview}
                            disabled={!purgeReady || purgePreview.isPending}
                        >
                            <RefreshCw
                                className={`mr-1 h-4 w-4 ${purgePreview.isPending ? 'animate-spin' : ''}`}
                            />
                            Посчитать
                        </Button>
                        {purgePreview.data && (
                            <Badge variant="secondary" className="tabular-nums">
                                {purgePreview.data.matching.toLocaleString()} записей
                            </Badge>
                        )}
                        <Button
                            variant="destructive"
                            onClick={onPurge}
                            disabled={!purgeReady || purge.isPending}
                        >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Удалить
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
