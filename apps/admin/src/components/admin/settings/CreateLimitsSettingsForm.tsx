'use client'

import { type AdminCreateLimitsSettings } from '@/apis/admin'
import { useAdminCreateLimitsSettings } from '@/hooks/queries/admin'
import { useUpdateAdminCreateLimitsSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminCreateLimitsSettings = {
    enabled: true,
    max_per_day: 10,
    max_per_direction_per_day: 5,
    daily_reset_hour: 0,
}

type NumKey = Exclude<keyof AdminCreateLimitsSettings, 'enabled'>

const NUM_FIELDS: { key: NumKey; label: string; hint: string }[] = [
    {
        key: 'max_per_day',
        label: 'Всего в день (на роль)',
        hint: 'max_per_day — сколько всего объявлений пользователь может создать за сутки. Счётчик раздельный для водителя и пассажира.',
    },
    {
        key: 'max_per_direction_per_day',
        label: 'В одном направлении в день',
        hint: 'max_per_direction_per_day — сколько объявлений в одном направлении (откуда→куда) за сутки на роль.',
    },
    {
        key: 'daily_reset_hour',
        label: 'Час сброса (0–23, KG)',
        hint: 'daily_reset_hour — час по бишкекскому времени, когда суточные счётчики обнуляются. 0 = полночь.',
    },
]

export function CreateLimitsSettingsForm() {
    const { data, isLoading } = useAdminCreateLimitsSettings()
    const update = useUpdateAdminCreateLimitsSettings()
    const [form, setForm] = useState<AdminCreateLimitsSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminCreateLimitsSettings>(
        key: K,
        value: AdminCreateLimitsSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Лимиты на создание объявлений (обычный rideshare). Два суточных
                счётчика на каждую роль: всего за день и в одном направлении.
                Сверх лимита создание отклоняется, приложение предлагает поднять
                уже существующие. Хранится в Redis под ключом{' '}
                <code className="text-xs">app:create_limits</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">Лимиты включены</Label>
                            <p className="text-xs text-muted-foreground">
                                <code>enabled</code>. Глобальный выключатель —
                                при выключении создание безлимитно.
                            </p>
                        </div>
                        <Switch
                            checked={form.enabled}
                            onCheckedChange={(v) => set('enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {NUM_FIELDS.map((f) => (
                            <div key={f.key} className="space-y-1">
                                <Label>{f.label}</Label>
                                <Input
                                    type="number"
                                    value={form[f.key]}
                                    onChange={(e) =>
                                        set(f.key, parseInt(e.target.value) || 0)
                                    }
                                    disabled={isLoading}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    {f.hint}
                                </p>
                            </div>
                        ))}
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
