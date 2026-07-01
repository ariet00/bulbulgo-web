'use client'

import { useAdminUserFeatures } from '@/hooks/queries/admin'
import { useUpdateAdminUserFeatures } from '@/hooks/mutations/admin'
import {
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { useEffect, useMemo, useState } from 'react'

type TriState = 'inherit' | 'on' | 'off'

// Human labels for known flags; unknown flags fall back to the raw key so the
// form stays universal as new flags are added server-side.
const FLAG_LABELS: Record<string, string> = {
    require_verified_phone: 'Требовать подтверждённый номер',
    is_wallet_enabled: 'Кошелёк',
    is_wallet_top_up_enabled: 'Пополнение кошелька',
    is_passenger_search_enabled: 'Поиск пассажиров',
    map_route_preview: 'Превью маршрута на карте',
}

export function UserFeatureOverridesForm({ userId }: { userId: number }) {
    const { data, isLoading } = useAdminUserFeatures(userId)
    const update = useUpdateAdminUserFeatures()
    const [form, setForm] = useState<Record<string, TriState>>({})

    const keys = useMemo(() => {
        const set = new Set<string>([
            ...Object.keys(data?.global_features ?? {}),
            ...Object.keys(data?.overrides ?? {}),
        ])
        return Array.from(set).sort()
    }, [data])

    useEffect(() => {
        if (!data) return
        const next: Record<string, TriState> = {}
        const allKeys = new Set([
            ...Object.keys(data.global_features ?? {}),
            ...Object.keys(data.overrides ?? {}),
        ])
        for (const k of allKeys) {
            next[k] =
                k in data.overrides ? (data.overrides[k] ? 'on' : 'off') : 'inherit'
        }
        setForm(next)
    }, [data])

    const set = (key: string, value: TriState) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => {
        const overrides: Record<string, boolean | null> = {}
        for (const k of keys) {
            const v = form[k] ?? 'inherit'
            overrides[k] = v === 'inherit' ? null : v === 'on'
        }
        update.mutate({ id: userId, overrides })
    }

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                «Наследовать» — используется глобальное значение. Персональное
                переопределение важнее глобального флага.
            </p>

            <div className="space-y-3">
                {keys.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Нет доступных фич-флагов.
                    </p>
                )}
                {keys.map((key) => {
                    const globalOn = !!data?.global_features?.[key]
                    return (
                        <div
                            key={key}
                            className="flex items-start justify-between gap-3 rounded border px-3 py-2"
                        >
                            <div className="space-y-0.5">
                                <Label>{FLAG_LABELS[key] ?? key}</Label>
                                <p className="text-xs text-muted-foreground">
                                    <code>{key}</code> · глобально:{' '}
                                    {globalOn ? 'вкл' : 'выкл'}
                                </p>
                            </div>
                            <Select
                                value={form[key] ?? 'inherit'}
                                onValueChange={(v) => set(key, v as TriState)}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inherit">Наследовать</SelectItem>
                                    <SelectItem value="on">Включено</SelectItem>
                                    <SelectItem value="off">Выключено</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end">
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
