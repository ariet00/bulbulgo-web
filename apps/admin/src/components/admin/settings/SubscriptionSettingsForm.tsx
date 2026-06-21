'use client'

import { type AdminSubscriptionSettings } from '@/apis/admin'
import { useAdminSubscriptionSettings } from '@/hooks/queries/admin'
import { useUpdateAdminSubscriptionSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminSubscriptionSettings = {
    max_count: 5,
    max_expire_days: 4,
}

const FIELDS: {
    key: keyof AdminSubscriptionSettings
    label: string
    hint: string
    min: number
    max: number
}[] = [
    {
        key: 'max_count',
        label: 'Максимум подписок на пользователя',
        hint: 'max_count — сколько неудалённых подписок (активных, выключенных или истёкших) может иметь один пользователь. Проверяется при создании новой.',
        min: 1,
        max: 100,
    },
    {
        key: 'max_expire_days',
        label: 'Максимальный срок действия, дней',
        hint: 'max_expire_days — на сколько дней вперёд можно задать срок действия подписки.',
        min: 1,
        max: 365,
    },
]

export function SubscriptionSettingsForm() {
    const { data, isLoading } = useAdminSubscriptionSettings()
    const update = useUpdateAdminSubscriptionSettings()
    const [form, setForm] = useState<AdminSubscriptionSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminSubscriptionSettings>(
        key: K,
        value: AdminSubscriptionSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Лимиты сохранённых поисков (подписок на поездки). Хранятся в
                Redis в общем словаре{' '}
                <code className="text-xs">app:settings</code> и отдаются
                клиентам через <code className="text-xs">/me</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FIELDS.map((f) => (
                            <div key={f.key} className="space-y-1">
                                <Label>{f.label}</Label>
                                <Input
                                    type="number"
                                    min={f.min}
                                    max={f.max}
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
