'use client'

// Баллы геймификации «Где Бензин»: веса начислений (Redis, дефолты в коде).

import { useEffect, useState } from 'react'
import { useAdminFuelPointsSettings } from '@/hooks/queries/admin'
import { useAdminUpdateFuelPointsSettings } from '@/hooks/mutations/admin'
import type { FuelPointsSettings } from '@/apis/admin'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@doska/ui'

const FIELDS: { key: keyof FuelPointsSettings; label: string; hint: string; step?: string }[] = [
    { key: 'base_on_site', label: 'База: метка «с места»', hint: 'пользователь в радиусе от АЗС' },
    { key: 'base_remote', label: 'База: удалённая метка', hint: 'без гео или далеко от АЗС' },
    { key: 'bonus_stale_station', label: 'Бонус: «серая» станция', hint: 'на станции не было свежих данных' },
    { key: 'bonus_first_of_day', label: 'Бонус: первая метка дня', hint: 'первая метка по станции за сутки' },
    { key: 'confirm_received', label: 'Подтверждение: автору', hint: 'когда чужой водитель подтвердил метку' },
    { key: 'confirm_given', label: 'Подтверждение: подтвердившему', hint: 'за сам факт подтверждения' },
    { key: 'on_site_radius_km', label: 'Радиус «с места», км', hint: 'дистанция до АЗС для полного балла', step: '0.1' },
]

export default function FuelPointsSettingsPage() {
    const { data, isLoading } = useAdminFuelPointsSettings()
    const update = useAdminUpdateFuelPointsSettings()
    const [form, setForm] = useState<FuelPointsSettings | null>(null)

    useEffect(() => {
        if (data && !form) setForm(data)
    }, [data, form])

    const set = (key: keyof FuelPointsSettings, raw: string) => {
        if (!form) return
        const value = parseFloat(raw)
        setForm({ ...form, [key]: Number.isFinite(value) ? value : 0 })
    }

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Баллы</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Веса начислений</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading || !form ? (
                        <p className="py-8 text-center text-muted-foreground">Загрузка…</p>
                    ) : (
                        <div className="space-y-4">
                            {FIELDS.map((f) => (
                                <div key={f.key} className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">{f.label}</p>
                                        <p className="text-xs text-muted-foreground">{f.hint}</p>
                                    </div>
                                    <Input
                                        className="w-28 text-right"
                                        type="number"
                                        min={0}
                                        step={f.step ?? '1'}
                                        value={form[f.key]}
                                        onChange={(e) => set(f.key, e.target.value)}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end border-t pt-4">
                                <Button
                                    onClick={() => update.mutate(form)}
                                    disabled={update.isPending}
                                >
                                    {update.isPending ? 'Сохраняем…' : 'Сохранить'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
