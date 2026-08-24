'use client'

import { type AdminActiveLimitsSettings } from '@/apis/admin'
import { useAdminActiveLimitsSettings } from '@/hooks/queries/admin'
import { useUpdateAdminActiveLimitsSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminActiveLimitsSettings = {
    enabled: true,
    max_active_total: 5,
    max_active_per_direction: 1,
}

type NumKey = Exclude<keyof AdminActiveLimitsSettings, 'enabled'>

const NUM_FIELDS: { key: NumKey; label: string; hint: string }[] = [
    {
        key: 'max_active_total',
        label: 'Всего активных (на роль)',
        hint: 'max_active_total — сколько одновременно активных объявлений может быть у пользователя. Считается раздельно для водителя, пассажира и посылок.',
    },
    {
        key: 'max_active_per_direction',
        label: 'Активных в одном направлении',
        hint: 'max_active_per_direction — сколько активных объявлений в одном направлении (откуда→куда) на роль. Обычно 1.',
    },
]

export function ActiveLimitsSettingsForm() {
    const { data, isLoading } = useAdminActiveLimitsSettings()
    const update = useUpdateAdminActiveLimitsSettings()
    const [form, setForm] = useState<AdminActiveLimitsSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminActiveLimitsSettings>(
        key: K,
        value: AdminActiveLimitsSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Лимиты на количество одновременно активных объявлений (обычный
                rideshare). Два порога на каждую роль: всего активных и активных
                в одном направлении. Считается по живым данным в БД. Проверяется
                при создании и при поднятии архивного объявления; сверх лимита
                действие отклоняется, приложение показывает боттом-шит. Хранится
                в Redis под ключом{' '}
                <code className="text-xs">app:active_limits</code>.
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
                                при выключении количество активных безлимитно.
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
