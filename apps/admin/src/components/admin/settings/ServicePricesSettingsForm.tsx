'use client'

import {
    type AdminAutoBumpTariff,
    type AdminServicePrices,
} from '@/apis/admin'
import { useAdminServicePricesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminServicePricesSettings } from '@/hooks/mutations/admin'
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
    Textarea,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminServicePrices = {
    auto_bump_enabled: false,
    auto_bump_title: 'Автоподнятие',
    auto_bump_description: '',
    auto_bump_tariffs: [
        {
            id: 'h1_d1',
            label: 'Каждый час · 1 день',
            interval_hours: 1,
            duration_days: 1,
            price: 100,
        },
        {
            id: 'h2_d7',
            label: 'Каждые 2 часа · 7 дней',
            interval_hours: 2,
            duration_days: 7,
            price: 300,
        },
    ],
    urgent_enabled: false,
    urgent_title: 'Срочно',
    urgent_description: '',
    urgent_price: 50,
    urgent_duration_days: 1,
}

const newTariff = (): AdminAutoBumpTariff => ({
    id: crypto.randomUUID(),
    label: '',
    interval_hours: 1,
    duration_days: 1,
    price: 100,
})

export function ServicePricesSettingsForm() {
    const { data, isLoading } = useAdminServicePricesSettings()
    const update = useUpdateAdminServicePricesSettings()
    const [form, setForm] = useState<AdminServicePrices>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const setUrgent = <K extends 'urgent_price' | 'urgent_duration_days'>(
        key: K,
        value: number,
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const setText = (
        key:
            | 'auto_bump_title'
            | 'auto_bump_description'
            | 'urgent_title'
            | 'urgent_description',
        value: string,
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const setEnabled = (
        key: 'auto_bump_enabled' | 'urgent_enabled',
        value: boolean,
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const setTariff = <K extends keyof AdminAutoBumpTariff>(
        idx: number,
        key: K,
        value: AdminAutoBumpTariff[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            auto_bump_tariffs: prev.auto_bump_tariffs.map((t, i) =>
                i === idx ? { ...t, [key]: value } : t,
            ),
        }))

    const addTariff = () =>
        setForm((prev) => ({
            ...prev,
            auto_bump_tariffs: [...prev.auto_bump_tariffs, newTariff()],
        }))

    const removeTariff = (idx: number) =>
        setForm((prev) => ({
            ...prev,
            auto_bump_tariffs: prev.auto_bump_tariffs.filter((_, i) => i !== idx),
        }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Платные услуги для объявлений: заголовок, описание «как это
                работает» и цены/тарифы. Авто-поднятие — тарифное (частота,
                срок, цена), «Срочно» — одна цена. Хранятся в Redis под ключом{' '}
                <code className="text-xs">app:service_prices</code> и отдаются в
                приложение через <code className="text-xs">GET /trips/services</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Срочно</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Услуга включена
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Показывать «Срочно» в приложении. Выкл —
                                плитка неактивна («Будет доступно позже»).
                            </p>
                        </div>
                        <Switch
                            checked={form.urgent_enabled}
                            onCheckedChange={(v) => setEnabled('urgent_enabled', v)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Заголовок</Label>
                        <Input
                            value={form.urgent_title}
                            onChange={(e) =>
                                setText('urgent_title', e.target.value)
                            }
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Описание (как работает)</Label>
                        <Textarea
                            rows={4}
                            value={form.urgent_description}
                            onChange={(e) =>
                                setText('urgent_description', e.target.value)
                            }
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Показывается в листе подключения услуги. Переносы
                            строк сохраняются.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Цена</Label>
                            <Input
                                type="number"
                                step={0.01}
                                value={form.urgent_price}
                                onChange={(e) =>
                                    setUrgent(
                                        'urgent_price',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                urgent_price — стоимость статуса «Срочно».
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Срок, дней</Label>
                            <Input
                                type="number"
                                value={form.urgent_duration_days}
                                onChange={(e) =>
                                    setUrgent(
                                        'urgent_duration_days',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                urgent_duration_days — сколько дней действует.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Авто-поднятие</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Услуга включена
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Показывать «Авто-поднятие» в приложении. Выкл —
                                плитка неактивна («Будет доступно позже»).
                            </p>
                        </div>
                        <Switch
                            checked={form.auto_bump_enabled}
                            onCheckedChange={(v) =>
                                setEnabled('auto_bump_enabled', v)
                            }
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Заголовок</Label>
                        <Input
                            value={form.auto_bump_title}
                            onChange={(e) =>
                                setText('auto_bump_title', e.target.value)
                            }
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Описание (как работает)</Label>
                        <Textarea
                            rows={4}
                            value={form.auto_bump_description}
                            onChange={(e) =>
                                setText('auto_bump_description', e.target.value)
                            }
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Показывается в листе подключения услуги. Переносы
                            строк сохраняются.
                        </p>
                    </div>

                    <Separator />

                    <p className="text-sm font-medium">Тарифы</p>
                    {form.auto_bump_tariffs.map((t, idx) => (
                        <div
                            key={idx}
                            className="space-y-3 rounded border px-3 py-3"
                        >
                            <div className="space-y-1">
                                <Label>Название</Label>
                                <Input
                                    value={t.label}
                                    placeholder="Каждый час · 1 день"
                                    onChange={(e) =>
                                        setTariff(idx, 'label', e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label>Интервал, ч</Label>
                                    <Input
                                        type="number"
                                        step={0.5}
                                        value={t.interval_hours}
                                        onChange={(e) =>
                                            setTariff(
                                                idx,
                                                'interval_hours',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Срок, дней</Label>
                                    <Input
                                        type="number"
                                        value={t.duration_days}
                                        onChange={(e) =>
                                            setTariff(
                                                idx,
                                                'duration_days',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Цена</Label>
                                    <Input
                                        type="number"
                                        step={0.01}
                                        value={t.price}
                                        onChange={(e) =>
                                            setTariff(
                                                idx,
                                                'price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTariff(idx)}
                                    disabled={isLoading}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={addTariff}
                        disabled={isLoading}
                    >
                        + Добавить тариф
                    </Button>

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
