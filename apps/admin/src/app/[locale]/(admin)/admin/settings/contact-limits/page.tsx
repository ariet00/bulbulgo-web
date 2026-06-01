'use client'

import { type AdminContactLimitsSettings } from '@/apis/admin'
import { useAdminContactLimitsSettings } from '@/hooks/queries/admin'
import { useUpdateAdminContactLimitsSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminContactLimitsSettings = {
    enabled: true,
    free_daily_limit: 15,
    fast_freshness_minutes: 10,
    fast_cost: 2,
    activity_window_days: 7,
    activity_min_views: 30,
    activity_min_active_days: 4,
    package_views: 20,
    package_price: 49,
    package_currency: 'KGS',
}

type NumKey = Exclude<keyof AdminContactLimitsSettings, 'enabled' | 'package_currency'>

const NUM_FIELDS: { key: NumKey; label: string; hint: string; step?: number }[] = [
    {
        key: 'free_daily_limit',
        label: 'Дневной лимит (очки)',
        hint: 'free_daily_limit — бесплатных очков просмотра в сутки. Обычный просмотр стоит 1 очко.',
    },
    {
        key: 'fast_cost',
        label: 'Стоимость быстрого (очки)',
        hint: 'fast_cost — сколько очков стоит быстрый просмотр (свежее объявление). Обычный = 1.',
    },
    {
        key: 'fast_freshness_minutes',
        label: 'Окно «свежести», мин',
        hint: 'fast_freshness_minutes — объявление считается быстрым, если обновлено в пределах этого окна.',
    },
    {
        key: 'activity_window_days',
        label: 'Окно активности, дней',
        hint: 'activity_window_days — период анализа активности водителя.',
    },
    {
        key: 'activity_min_views',
        label: 'Порог просмотров',
        hint: 'activity_min_views — от скольких просмотров за окно пользователь считается таксистом (включаются лимиты).',
    },
    {
        key: 'activity_min_active_days',
        label: 'Порог активных дней',
        hint: 'activity_min_active_days — на скольких разных днях за окно были просмотры.',
    },
    {
        key: 'package_views',
        label: 'Пакет (очки), шт',
        hint: 'package_views — сколько очков даёт одна покупка в общий пул.',
    },
    {
        key: 'package_price',
        label: 'Цена пакета',
        hint: 'package_price — стоимость пакета очков.',
        step: 0.01,
    },
]

export default function AdminContactLimitsPage() {
    const { data, isLoading } = useAdminContactLimitsSettings()
    const update = useUpdateAdminContactLimitsSettings()
    const [form, setForm] = useState<AdminContactLimitsSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminContactLimitsSettings>(
        key: K,
        value: AdminContactLimitsSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold">Лимиты просмотра номеров</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Ограничения на просмотр контактов для активных водителей
                    (таксистов). Применяются только к просмотру пассажирских
                    объявлений. Хранятся в Redis под ключом{' '}
                    <code className="text-xs">app:contact_limits</code>.
                </p>
            </div>

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
                                при выключении все просмотры безлимитны.
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
                                    step={f.step}
                                    value={form[f.key]}
                                    onChange={(e) =>
                                        set(
                                            f.key,
                                            f.step
                                                ? parseFloat(e.target.value) || 0
                                                : parseInt(e.target.value) || 0,
                                        )
                                    }
                                    disabled={isLoading}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    {f.hint}
                                </p>
                            </div>
                        ))}

                        <div className="space-y-1">
                            <Label>Валюта</Label>
                            <Input
                                value={form.package_currency}
                                onChange={(e) =>
                                    set('package_currency', e.target.value)
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                package_currency — валюта пакетов.
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
