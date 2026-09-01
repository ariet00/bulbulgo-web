'use client'

import { type AdminCargoType, type AdminCargoTypesSettings } from '@/apis/admin'
import { useAdminFreightCargoTypesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminFreightCargoTypesSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminCargoTypesSettings = {
    types: [
        { label: 'Овощи и фрукты' },
        { label: 'Продукты питания' },
        { label: 'Напитки и вода' },
        { label: 'Стройматериалы' },
        { label: 'Металлопрокат' },
        { label: 'Пиломатериалы и лес' },
        { label: 'Сыпучие грузы (цемент, песок, зерно)' },
        { label: 'Сельхозпродукция' },
        { label: 'Живность (скот, птица)' },
        { label: 'Мебель' },
        { label: 'Бытовая техника' },
        { label: 'Электроника' },
        { label: 'Одежда и текстиль' },
        { label: 'Автозапчасти' },
        { label: 'Стройтехника и оборудование' },
        { label: 'Химия и удобрения' },
        { label: 'Медикаменты и медоборудование' },
        { label: 'Личные вещи (переезд)' },
        { label: 'Хрупкий груз' },
        { label: 'Другое' },
    ],
}

const newType = (): AdminCargoType => ({ label: '' })

export function FreightCargoTypesSettingsForm() {
    const { data, isLoading } = useAdminFreightCargoTypesSettings()
    const update = useUpdateAdminFreightCargoTypesSettings()
    const [form, setForm] = useState<AdminCargoTypesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const setLabel = (idx: number, value: string) =>
        setForm((prev) => ({
            ...prev,
            types: prev.types.map((t, i) =>
                i === idx ? { ...t, label: value } : t,
            ),
        }))

    const addType = () =>
        setForm((prev) => ({ ...prev, types: [...prev.types, newType()] }))

    const removeType = (idx: number) =>
        setForm((prev) => ({
            ...prev,
            types: prev.types.filter((_, i) => i !== idx),
        }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Типы груза для пикера в создании грузоперевозки (роль «Груз»).
                Поле необязательное — это только подсказки, не enum. Хранятся
                в Redis под ключом{' '}
                <code className="text-xs">app:freight_cargo_types</code> и
                отдаются в приложение через{' '}
                <code className="text-xs">GET /freight/create</code> (
                <code className="text-xs">cargo_types</code>). Временное
                хранилище — пока без отдельной таблицы в БД.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Типы груза (грузоперевозки)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {form.types.map((t, idx) => (
                        <div key={idx} className="flex items-end gap-3">
                            <div className="flex-1 space-y-1">
                                {idx === 0 && <Label>Название</Label>}
                                <Input
                                    value={t.label}
                                    placeholder="Например: Мебель"
                                    onChange={(e) => setLabel(idx, e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeType(idx)}
                                disabled={isLoading}
                            >
                                Удалить
                            </Button>
                        </div>
                    ))}

                    <Button variant="outline" onClick={addType} disabled={isLoading}>
                        + Добавить тип
                    </Button>

                    <Separator />

                    <div className="flex justify-end">
                        <Button onClick={submit} disabled={isLoading || update.isPending}>
                            {update.isPending ? 'Сохранение…' : 'Сохранить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
