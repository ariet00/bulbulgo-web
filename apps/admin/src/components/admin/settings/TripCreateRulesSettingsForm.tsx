'use client'

import {
    type AdminTripCreateRoleRules,
    type AdminTripCreateRulesSettings,
} from '@/apis/admin'
import { useAdminTripCreateRulesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminTripCreateRulesSettings } from '@/hooks/mutations/admin'
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

// Потолок срока публикации (часов) — совпадает с HARD_MAX_DURATION_HOURS на
// бэке; больше не сохранится и через API. Не продуктовое ограничение в сутки —
// просто защита от опечатки. Если для роли выставить больше 24ч, в приложении
// пикер срока покажет дни+часы вместо одного колеса часов.
const HARD_MAX_HOURS = 24 * 30

const DEFAULT_ROLE: AdminTripCreateRoleRules = {
    max_duration_hours: HARD_MAX_HOURS,
    default_duration_hours: 4,
    price_required: false,
    time_required: false,
    schedule_enabled: true,
    waypoints_enabled: true,
}

const DEFAULT_FORM: AdminTripCreateRulesSettings = {
    require_verified_phone: false,
    contact_method_enabled: false,
    driver: { ...DEFAULT_ROLE, default_duration_hours: 23 },
    passenger: { ...DEFAULT_ROLE, time_required: true },
    parcel: { ...DEFAULT_ROLE },
    freight: {
        driver: { ...DEFAULT_ROLE, default_duration_hours: 23 },
        cargo_owner: { ...DEFAULT_ROLE },
    },
}

// Попутки — роли верхнего уровня; грузоперевозки — вложенный блок freight.
const TRIP_ROLES = [
    { key: 'driver', label: 'Водитель' },
    { key: 'passenger', label: 'Пассажир' },
    { key: 'parcel', label: 'Посылка' },
] as const

const FREIGHT_ROLES = [
    { key: 'driver', label: 'Грузоперевозки · Водитель' },
    { key: 'cargo_owner', label: 'Грузоперевозки · Отправитель груза' },
] as const

export function TripCreateRulesSettingsForm() {
    const { data, isLoading } = useAdminTripCreateRulesSettings()
    const update = useUpdateAdminTripCreateRulesSettings()
    const [form, setForm] = useState<AdminTripCreateRulesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm({ ...DEFAULT_FORM, ...data })
    }, [data])

    const setTripRole = <K extends keyof AdminTripCreateRoleRules>(
        role: (typeof TRIP_ROLES)[number]['key'],
        key: K,
        value: AdminTripCreateRoleRules[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            [role]: { ...prev[role], [key]: value },
        }))

    const setFreightRole = <K extends keyof AdminTripCreateRoleRules>(
        role: (typeof FREIGHT_ROLES)[number]['key'],
        key: K,
        value: AdminTripCreateRoleRules[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            freight: {
                ...prev.freight,
                [role]: { ...prev.freight[role], [key]: value },
            },
        }))

    const submit = () => update.mutate(form)

    const roleCard = (
        label: string,
        rules: AdminTripCreateRoleRules,
        set: <K extends keyof AdminTripCreateRoleRules>(
            key: K,
            value: AdminTripCreateRoleRules[K],
        ) => void,
    ) => (
        <Card key={label}>
            <CardHeader>
                <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Макс. срок публикации, ч</Label>
                        <Input
                            type="number"
                            min={1}
                            max={HARD_MAX_HOURS}
                            value={rules.max_duration_hours}
                            onChange={(e) =>
                                set(
                                    'max_duration_hours',
                                    Math.min(
                                        parseInt(e.target.value) || 0,
                                        HARD_MAX_HOURS,
                                    ),
                                )
                            }
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            max_duration_hours — потолок пикера срока в
                            приложении, 1–{HARD_MAX_HOURS} ч. Больше 24 —
                            пикер покажет дни и часы, не только часы.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label>Срок по умолчанию, ч</Label>
                        <Input
                            type="number"
                            min={1}
                            max={HARD_MAX_HOURS}
                            value={rules.default_duration_hours}
                            onChange={(e) =>
                                set(
                                    'default_duration_hours',
                                    Math.min(
                                        parseInt(e.target.value) || 0,
                                        HARD_MAX_HOURS,
                                    ),
                                )
                            }
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            default_duration_hours — предзаполненное значение,
                            1–{HARD_MAX_HOURS} ч.
                        </p>
                    </div>
                </div>

                <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                    <div className="space-y-0.5">
                        <Label className="cursor-pointer">
                            Цена обязательна
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            price_required — без цены форма не отправится
                            (иначе «договорная»).
                        </p>
                    </div>
                    <Switch
                        checked={rules.price_required}
                        onCheckedChange={(v) => set('price_required', v)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                    <div className="space-y-0.5">
                        <Label className="cursor-pointer">
                            Время обязательно
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            time_required — без времени отправления форма не
                            отправится.
                        </p>
                    </div>
                    <Switch
                        checked={rules.time_required}
                        onCheckedChange={(v) => set('time_required', v)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                    <div className="space-y-0.5">
                        <Label className="cursor-pointer">
                            Кнопка «Составить расписание»
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            schedule_enabled — публикация одним объявлением на
                            несколько дат. Выключено — кнопка скрыта в пикере
                            даты, роль публикует объявление одной датой.
                        </p>
                    </div>
                    <Switch
                        checked={rules.schedule_enabled}
                        onCheckedChange={(v) => set('schedule_enabled', v)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                    <div className="space-y-0.5">
                        <Label className="cursor-pointer">
                            Промежуточные точки
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            waypoints_enabled — до 5 точек между «Откуда» и
                            «Куда». Выключено — блок скрыт, маршрут только
                            откуда → куда.
                        </p>
                    </div>
                    <Switch
                        checked={rules.waypoints_enabled}
                        onCheckedChange={(v) => set('waypoints_enabled', v)}
                        disabled={isLoading}
                    />
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Правила форм создания по ролям: максимальный и предзаполненный
                срок публикации (в часах, не больше {HARD_MAX_HOURS}) и
                обязательность цены/времени. Приложение получает их через{' '}
                <code className="text-xs">GET /trips/create</code> и{' '}
                <code className="text-xs">GET /freight/create</code>, сервер
                дополнительно зажимает срок при создании. Хранится в Redis под
                ключом <code className="text-xs">app:trip_create_rules</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Общие</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Требовать подтверждённый номер
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                require_verified_phone — публиковать и смотреть
                                контакты можно только с подтверждённым по SMS
                                номером. Переопределяется для отдельного
                                пользователя на его странице.
                            </p>
                        </div>
                        <Switch
                            checked={form.require_verified_phone}
                            onCheckedChange={(v) =>
                                setForm((prev) => ({
                                    ...prev,
                                    require_verified_phone: v,
                                }))
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Блок «Как могут с вами связаться»
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                contact_method_enabled — выбор «чат и звонок /
                                только чат / только звонок» в формах попуток и
                                грузоперевозок. Выключено — блок скрыт, и
                                объявления создаются как раньше (только звонок).
                            </p>
                        </div>
                        <Switch
                            checked={form.contact_method_enabled}
                            onCheckedChange={(v) =>
                                setForm((prev) => ({
                                    ...prev,
                                    contact_method_enabled: v,
                                }))
                            }
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            {TRIP_ROLES.map(({ key, label }) =>
                roleCard(label, form[key], (field, value) =>
                    setTripRole(key, field, value),
                ),
            )}

            {FREIGHT_ROLES.map(({ key, label }) =>
                roleCard(label, form.freight[key], (field, value) =>
                    setFreightRole(key, field, value),
                ),
            )}

            <Separator />

            <div className="flex justify-end">
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
