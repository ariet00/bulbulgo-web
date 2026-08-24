'use client'

import {
    type AdminAttractiveRoute,
    type AdminAttractivePricesSettings,
} from '@/apis/admin'
import { useAdminAttractivePricesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminAttractivePricesSettings } from '@/hooks/mutations/admin'
import { RegionCombobox } from '@/components/admin/selectors/RegionCombobox'
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

const DEFAULT_FORM: AdminAttractivePricesSettings = {
    enabled: false,
    service_enabled: false,
    service_duration_hours: 24,
    service_interval_hours: 1,
    routes: [],
}

const newRoute = (): AdminAttractiveRoute => ({
    from_location_id: 0,
    to_location_id: 0,
    min_price: 0,
    max_price: 0,
})

export function AttractivePricesSettingsForm() {
    const { data, isLoading } = useAdminAttractivePricesSettings()
    const update = useUpdateAdminAttractivePricesSettings()
    const [form, setForm] = useState<AdminAttractivePricesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const setRoute = <K extends keyof AdminAttractiveRoute>(
        idx: number,
        key: K,
        value: AdminAttractiveRoute[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            routes: prev.routes.map((r, i) =>
                i === idx ? { ...r, [key]: value } : r,
            ),
        }))

    const addRoute = () =>
        setForm((prev) => ({ ...prev, routes: [...prev.routes, newRoute()] }))

    const removeRoute = (idx: number) =>
        setForm((prev) => ({
            ...prev,
            routes: prev.routes.filter((_, i) => i !== idx),
        }))

    // Только полностью заполненные маршруты — пустой выбор региона = 0.
    const isValid =
        form.routes.every(
            (r) =>
                r.from_location_id > 0 &&
                r.to_location_id > 0 &&
                r.max_price > 0 &&
                r.min_price <= r.max_price,
        ) &&
        form.service_duration_hours > 0 &&
        form.service_interval_hours > 0

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Привлекательные цены по маршрутам. Когда водитель создаёт поездку
                на одном из маршрутов и его цена не выше порога — всем
                пользователям (и гостевым устройствам) уходит пуш с этой
                поездкой. Хранятся в Redis под ключом{' '}
                <code className="text-xs">app:attractive_prices</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Рассылка о выгодных поездках</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">Включено</Label>
                            <p className="text-xs text-muted-foreground">
                                Выкл — рассылка не отправляется даже при
                                совпадении маршрута и цены.
                            </p>
                        </div>
                        <Switch
                            checked={form.enabled}
                            onCheckedChange={(v) =>
                                setForm((prev) => ({ ...prev, enabled: v }))
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-3 rounded border px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5">
                                <Label className="cursor-pointer">
                                    Услуга «Выгодная поездка»
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Поездке, попавшей в маршрут, бесплатно
                                    включается услуга: она периодически
                                    поднимается в ленте и переспубликуется в
                                    Telegram-группе. Независимо от рассылки:
                                    можно включить только услугу или только
                                    рассылку. Выдаётся один раз на поездку и
                                    снимается, если цену подняли.
                                </p>
                            </div>
                            <Switch
                                checked={form.service_enabled}
                                onCheckedChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        service_enabled: v,
                                    }))
                                }
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Длительность, часов</Label>
                                <Input
                                    type="number"
                                    step={1}
                                    min={1}
                                    value={form.service_duration_hours || ''}
                                    placeholder="24"
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            service_duration_hours:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Поднимать раз в, часов</Label>
                                <Input
                                    type="number"
                                    step={1}
                                    min={1}
                                    value={form.service_interval_hours || ''}
                                    placeholder="1"
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            service_interval_hours:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Длительность — верхняя граница: поднятия всегда
                            заканчиваются за час до конца публикации объявления
                            и срок публикации не продлевают. Если до конца
                            осталось меньше интервала, услуга не выдаётся.
                        </p>
                    </div>

                    <Separator />

                    <p className="text-sm font-medium">Маршруты</p>
                    {form.routes.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            Маршруты не заданы. Добавьте первый.
                        </p>
                    )}
                    {form.routes.map((r, idx) => (
                        <div
                            key={idx}
                            className="space-y-3 rounded border px-3 py-3"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Откуда</Label>
                                    <RegionCombobox
                                        value={r.from_location_id || null}
                                        onChange={(id) =>
                                            setRoute(
                                                idx,
                                                'from_location_id',
                                                id ?? 0,
                                            )
                                        }
                                        placeholder="Город отправления"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Куда</Label>
                                    <RegionCombobox
                                        value={r.to_location_id || null}
                                        onChange={(id) =>
                                            setRoute(
                                                idx,
                                                'to_location_id',
                                                id ?? 0,
                                            )
                                        }
                                        placeholder="Город назначения"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Мин. цена, сом</Label>
                                    <Input
                                        type="number"
                                        step={1}
                                        value={r.min_price || ''}
                                        placeholder="0"
                                        onChange={(e) =>
                                            setRoute(
                                                idx,
                                                'min_price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Защита от опечаток-демпинга. 0 — без
                                        нижнего порога.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Макс. цена, сом</Label>
                                    <Input
                                        type="number"
                                        step={1}
                                        value={r.max_price || ''}
                                        placeholder="500"
                                        onChange={(e) =>
                                            setRoute(
                                                idx,
                                                'max_price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Цена ≤ этого — поездка выгодная.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRoute(idx)}
                                    disabled={isLoading}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={addRoute}
                        disabled={isLoading}
                    >
                        + Добавить маршрут
                    </Button>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={submit}
                            disabled={isLoading || update.isPending || !isValid}
                        >
                            {update.isPending ? 'Сохранение…' : 'Сохранить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
