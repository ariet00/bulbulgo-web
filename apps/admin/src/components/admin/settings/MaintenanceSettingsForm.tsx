'use client'

import { type AdminMaintenanceSettings } from '@/apis/admin'
import { useAdminMaintenanceSettings } from '@/hooks/queries/admin'
import { useUpdateAdminMaintenanceSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    Switch,
    Textarea,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminMaintenanceSettings = {
    enabled: false,
    message: '',
}

export function MaintenanceSettingsForm() {
    const { data, isLoading } = useAdminMaintenanceSettings()
    const update = useUpdateAdminMaintenanceSettings()
    const [form, setForm] = useState<AdminMaintenanceSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminMaintenanceSettings>(
        key: K,
        value: AdminMaintenanceSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Режим технических работ. Когда включён, middleware отвечает{' '}
                <code className="text-xs">503</code> с заголовком{' '}
                <code className="text-xs">X-Maintenance</code> на все клиентские
                запросы — приложение показывает полноэкранный экран техработ.
                Админ-панель, <code className="text-xs">/healthz</code> и вебхуки
                ботов не затрагиваются. Хранится в Redis под ключами{' '}
                <code className="text-xs">app:maintenance_mode</code> /{' '}
                <code className="text-xs">app:maintenance_message</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Технические работы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Включить режим техработ
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>app:maintenance_mode</code>. Все запросы
                                приложения получат 503 — пользователи увидят
                                экран «Ведутся технические работы».
                            </p>
                        </div>
                        <Switch
                            checked={form.enabled}
                            onCheckedChange={(v) => set('enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Label>Сообщение (необязательно)</Label>
                        <Textarea
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            placeholder="Ведутся технические работы. Приложение скоро снова заработает."
                            rows={3}
                            disabled={isLoading}
                        />
                        <code className="text-[10px] text-muted-foreground">
                            app:maintenance_message
                        </code>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Текст на экране техработ. Пусто — покажется дефолтное
                            сообщение.
                        </p>
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
