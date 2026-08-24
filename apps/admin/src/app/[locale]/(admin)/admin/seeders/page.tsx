'use client'

import { useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Database, Play } from 'lucide-react'

import { useAdminSeeders } from '@/hooks/queries/admin'
import { useAdminRunSeeders } from '@/hooks/mutations/admin'
import type { SeederRunResult } from '@/apis/admin'

const STATUS_BADGE: Record<
    SeederRunResult['status'],
    { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
    done: { label: 'выполнен', variant: 'default' },
    skipped: { label: 'пропущен (уже засеян)', variant: 'secondary' },
    failed: { label: 'ошибка', variant: 'destructive' },
}

export default function SeedersAdminPage() {
    const { data: seeders, isLoading } = useAdminSeeders()
    const runSeeders = useAdminRunSeeders()

    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [force, setForce] = useState(false)
    // name -> result of the most recent run in this session
    const [lastResults, setLastResults] = useState<Record<string, SeederRunResult>>({})

    const toggle = (name: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    const run = (names: string[]) => {
        runSeeders.mutate(
            { names, force },
            {
                onSuccess: (results) => {
                    setLastResults((prev) => {
                        const next = { ...prev }
                        for (const r of results) next[r.name] = r
                        return next
                    })
                    setSelected(new Set())
                },
            },
        )
    }

    const allSelected =
        !!seeders && seeders.length > 0 && selected.size === seeders.length

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Сидеры</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="size-4" /> Справочные данные
                        <span className="text-sm font-normal text-muted-foreground">
                            (code-owned синхронизируются, operator-owned — только вставка
                            недостающих)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <Button
                            size="sm"
                            disabled={selected.size === 0 || runSeeders.isPending}
                            onClick={() => run([...selected])}
                        >
                            <Play className="size-4 mr-1" />
                            {runSeeders.isPending
                                ? 'Выполняется…'
                                : `Запустить выбранные (${selected.size})`}
                        </Button>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={force} onCheckedChange={setForce} />
                            force — игнорировать «уже засеяно» у guarded-сидеров
                        </label>
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={allSelected}
                                                onCheckedChange={() =>
                                                    setSelected(
                                                        allSelected
                                                            ? new Set()
                                                            : new Set(seeders?.map((s) => s.name)),
                                                    )
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>Сидер</TableHead>
                                        <TableHead>Ownership</TableHead>
                                        <TableHead>Зависимости</TableHead>
                                        <TableHead>Флаги</TableHead>
                                        <TableHead>Последний запуск</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(seeders ?? []).map((s) => {
                                        const result = lastResults[s.name]
                                        return (
                                            <TableRow key={s.name}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selected.has(s.name)}
                                                        onCheckedChange={() => toggle(s.name)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {s.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            s.ownership === 'code'
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {s.ownership}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {s.requires.length > 0
                                                        ? s.requires.join(', ')
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="space-x-1">
                                                    {s.guarded && (
                                                        <Badge variant="secondary">guarded</Badge>
                                                    )}
                                                    {s.in_startup && (
                                                        <Badge variant="secondary">startup</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {result ? (
                                                        <div className="space-y-1">
                                                            <Badge
                                                                variant={
                                                                    STATUS_BADGE[result.status]
                                                                        .variant
                                                                }
                                                            >
                                                                {STATUS_BADGE[result.status].label}
                                                            </Badge>
                                                            {result.error && (
                                                                <div className="text-xs text-destructive max-w-[320px] break-words">
                                                                    {result.error}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={runSeeders.isPending}
                                                        onClick={() => run([s.name])}
                                                    >
                                                        <Play className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Запуск идёт тем же путём, что и CLI/старт приложения: порядок по
                        зависимостям, advisory-lock, отдельная транзакция на сидер. Ошибка
                        одного сидера не прерывает остальные. Детали — в логах бэкенда.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
