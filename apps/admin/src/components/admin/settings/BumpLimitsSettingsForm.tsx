'use client'

import { type AdminBumpLimitsSettings } from '@/apis/admin'
import { useAdminBumpLimitsSettings } from '@/hooks/queries/admin'
import { useUpdateAdminBumpLimitsSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
    Switch,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminBumpLimitsSettings = {
    enabled: true,
    max_count: 3,
    window_seconds: 3600,
    dedup_window_seconds: 300,
}

export function BumpLimitsSettingsForm() {
    const { data, isLoading } = useAdminBumpLimitsSettings()
    const update = useUpdateAdminBumpLimitsSettings()
    const [form, setForm] = useState<AdminBumpLimitsSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminBumpLimitsSettings>(
        key: K,
        value: AdminBumpLimitsSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Ограничение на поднятие объявлений: не больше{' '}
                <b>{form.max_count}</b> поднятий за{' '}
                <b>{Math.round(form.window_seconds / 60)}</b> мин на пользователя.
                Сверх лимита поднятие отклоняется, приложение предлагает
                автоподнятие. Хранится в Redis под ключом{' '}
                <code className="text-xs">app:bump_limits</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">Лимит включён</Label>
                            <p className="text-xs text-muted-foreground">
                                <code>enabled</code>. Глобальный выключатель —
                                при выключении поднятия безлимитны.
                            </p>
                        </div>
                        <Switch
                            checked={form.enabled}
                            onCheckedChange={(v) => set('enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Кол-во поднятий за окно</Label>
                            <Input
                                type="number"
                                value={form.max_count}
                                onChange={(e) =>
                                    set('max_count', parseInt(e.target.value) || 0)
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                max_count — сколько раз пользователь может поднять
                                объявления за одно окно.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label>Окно, сек</Label>
                            <Input
                                type="number"
                                value={form.window_seconds}
                                onChange={(e) =>
                                    set(
                                        'window_seconds',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                window_seconds — длина окна в секундах. 3600 = 1 час.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label>Дедуп одного объявления, сек</Label>
                            <Input
                                type="number"
                                value={form.dedup_window_seconds}
                                onChange={(e) =>
                                    set(
                                        'dedup_window_seconds',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                dedup_window_seconds — повторные поднятия одного
                                объявления в этот интервал считаются одним
                                поднятием. 0 — каждое нажатие тратит лимит.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={submit}
                            disabled={isLoading || update.isPending}
                        >
                            {update.isPending ? 'Сохранение…' : 'Сохранить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
