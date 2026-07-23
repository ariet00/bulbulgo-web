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

// Жёсткий продуктовый потолок срока публикации (часов) — совпадает с
// HARD_MAX_DURATION_HOURS на бэке; больше не сохранится и через API.
const HARD_MAX_HOURS = 23

const DEFAULT_ROLE: AdminTripCreateRoleRules = {
    max_duration_hours: HARD_MAX_HOURS,
    default_duration_hours: 4,
    price_required: false,
    time_required: false,
}

const DEFAULT_FORM: AdminTripCreateRulesSettings = {
    driver: { ...DEFAULT_ROLE, default_duration_hours: 23 },
    passenger: { ...DEFAULT_ROLE, time_required: true },
    parcel: { ...DEFAULT_ROLE },
}

const ROLES = [
    { key: 'driver', label: 'Водитель' },
    { key: 'passenger', label: 'Пассажир' },
    { key: 'parcel', label: 'Посылка' },
] as const

export function TripCreateRulesSettingsForm() {
    const { data, isLoading } = useAdminTripCreateRulesSettings()
    const update = useUpdateAdminTripCreateRulesSettings()
    const [form, setForm] = useState<AdminTripCreateRulesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminTripCreateRoleRules>(
        role: (typeof ROLES)[number]['key'],
        key: K,
        value: AdminTripCreateRoleRules[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            [role]: { ...prev[role], [key]: value },
        }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Правила формы создания поездки по ролям: максимальный и
                предзаполненный срок публикации (в часах, не больше{' '}
                {HARD_MAX_HOURS}) и обязательность цены/времени. Приложение
                получает их через{' '}
                <code className="text-xs">GET /trips/create</code>, сервер
                дополнительно зажимает срок при создании/редактировании.
                Хранится в Redis под ключом{' '}
                <code className="text-xs">app:trip_create_rules</code>.
            </p>

            {ROLES.map(({ key, label }) => {
                const rules = form[key]
                return (
                    <Card key={key}>
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
                                                key,
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
                                        max_duration_hours — потолок пикера срока
                                        в приложении, 1–{HARD_MAX_HOURS} ч.
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
                                                key,
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
                                        default_duration_hours — предзаполненное
                                        значение, 1–{HARD_MAX_HOURS} ч.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                                <div className="space-y-0.5">
                                    <Label className="cursor-pointer">
                                        Цена обязательна
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        price_required — без цены форма не
                                        отправится (иначе «договорная»).
                                    </p>
                                </div>
                                <Switch
                                    checked={rules.price_required}
                                    onCheckedChange={(v) =>
                                        set(key, 'price_required', v)
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                                <div className="space-y-0.5">
                                    <Label className="cursor-pointer">
                                        Время обязательно
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        time_required — без времени отправления
                                        форма не отправится.
                                    </p>
                                </div>
                                <Switch
                                    checked={rules.time_required}
                                    onCheckedChange={(v) =>
                                        set(key, 'time_required', v)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            <Separator />

            <div className="flex justify-end">
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
