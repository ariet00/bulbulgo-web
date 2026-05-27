'use client'

import {
    type AdminAppFeaturesSettings,
    useAdminAppFeaturesSettings,
    useUpdateAdminAppFeaturesSettings,
} from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    Switch,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminAppFeaturesSettings = {
    is_wallet_top_up_enabled: false,
    is_wallet_enabled: false,
    is_passenger_search_enabled: false,
    map_route_preview: false,
}

export default function AdminAppFeaturesPage() {
    const { data, isLoading } = useAdminAppFeaturesSettings()
    const update = useUpdateAdminAppFeaturesSettings()
    const [form, setForm] = useState<AdminAppFeaturesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminAppFeaturesSettings>(
        key: K,
        value: AdminAppFeaturesSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold">Feature flags</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Глобальные feature-флаги для клиентов. Хранятся в Redis под
                    ключом <code className="text-xs">app:features</code> и
                    отдаются через <code className="text-xs">settings.features</code>{' '}
                    в <code className="text-xs">GET /me</code>. Per-user
                    override (<code className="text-xs">users.data.settings.features</code>)
                    побеждает.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Флаги</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Кошелёк (раздел в профиле)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>is_wallet_enabled</code>. Показывает
                                пункт «Кошелёк» в профиле и блок баланса на
                                экране поездки владельца.
                            </p>
                        </div>
                        <Switch
                            checked={form.is_wallet_enabled}
                            onCheckedChange={(v) => set('is_wallet_enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Пополнение баланса (кошелёк)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>is_wallet_top_up_enabled</code>. Показывает
                                форму пополнения и быстрые суммы на экране
                                кошелька в BulBul Go.
                            </p>
                        </div>
                        <Switch
                            checked={form.is_wallet_top_up_enabled}
                            onCheckedChange={(v) =>
                                set('is_wallet_top_up_enabled', v)
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Поиск пассажиров
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>is_passenger_search_enabled</code>.
                                Включает режим поиска пассажиров (для
                                водителей) на экране поиска.
                            </p>
                        </div>
                        <Switch
                            checked={form.is_passenger_search_enabled}
                            onCheckedChange={(v) =>
                                set('is_passenger_search_enabled', v)
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Предпросмотр маршрута на карте
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>map_route_preview</code>. Показывает
                                предпросмотр маршрута на карте при создании
                                поездки.
                            </p>
                        </div>
                        <Switch
                            checked={form.map_route_preview}
                            onCheckedChange={(v) =>
                                set('map_route_preview', v)
                            }
                            disabled={isLoading}
                        />
                    </div>

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
