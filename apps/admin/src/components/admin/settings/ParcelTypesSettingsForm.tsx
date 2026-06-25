'use client'

import { type AdminParcelType, type AdminParcelTypesSettings } from '@/apis/admin'
import { useAdminParcelTypesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminParcelTypesSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminParcelTypesSettings = {
    enabled: false,
    types: [
        { code: 'small', name: 'Небольшой', weight_hint: 'до 5 кг', price: null, negotiable: true },
        { code: 'oversized', name: 'Габаритный', weight_hint: 'от 5 кг', price: null, negotiable: true },
    ],
}

const newType = (): AdminParcelType => ({
    code: '',
    name: '',
    weight_hint: '',
    price: null,
    negotiable: true,
})

export function ParcelTypesSettingsForm() {
    const { data, isLoading } = useAdminParcelTypesSettings()
    const update = useUpdateAdminParcelTypesSettings()
    const [form, setForm] = useState<AdminParcelTypesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const setType = <K extends keyof AdminParcelType>(
        idx: number,
        key: K,
        value: AdminParcelType[K],
    ) =>
        setForm((prev) => ({
            ...prev,
            types: prev.types.map((t, i) =>
                i === idx ? { ...t, [key]: value } : t,
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
                Типы посылок для курьерской доставки. У каждого типа своя цена;
                «Договорная» — компания созванивается с пользователем и
                согласовывает стоимость. Хранятся в Redis под ключом{' '}
                <code className="text-xs">app:parcel_types</code> и отдаются в
                приложение через <code className="text-xs">GET /trips/users/me</code>{' '}
                (<code className="text-xs">settings.parcel_types</code>).
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Курьерская доставка посылок</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">Включено</Label>
                            <p className="text-xs text-muted-foreground">
                                Показывать выбор «Курьерской компанией» в флоу
                                создания посылки. Выкл — доступна только отправка
                                попутной машиной.
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

                    <Separator />

                    <p className="text-sm font-medium">Типы посылок</p>
                    {form.types.map((t, idx) => (
                        <div
                            key={idx}
                            className="space-y-3 rounded border px-3 py-3"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Код</Label>
                                    <Input
                                        value={t.code}
                                        placeholder="small"
                                        onChange={(e) =>
                                            setType(idx, 'code', e.target.value)
                                        }
                                        disabled={isLoading}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Латиницей, уникальный — хранится в
                                        data.parcel_type.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Название</Label>
                                    <Input
                                        value={t.name}
                                        placeholder="Небольшой"
                                        onChange={(e) =>
                                            setType(idx, 'name', e.target.value)
                                        }
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Подсказка по весу</Label>
                                <Input
                                    value={t.weight_hint}
                                    placeholder="до 5 кг"
                                    onChange={(e) =>
                                        setType(idx, 'weight_hint', e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded border px-3 py-2">
                                <div className="space-y-0.5">
                                    <Label className="cursor-pointer">
                                        Договорная цена
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Без фиксированной цены — компания
                                        созванивается с пользователем.
                                    </p>
                                </div>
                                <Switch
                                    checked={t.negotiable}
                                    onCheckedChange={(v) =>
                                        setType(idx, 'negotiable', v)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            {!t.negotiable && (
                                <div className="space-y-1">
                                    <Label>Цена, сом</Label>
                                    <Input
                                        type="number"
                                        step={0.01}
                                        value={t.price ?? 0}
                                        onChange={(e) =>
                                            setType(
                                                idx,
                                                'price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeType(idx)}
                                    disabled={isLoading}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={addType}
                        disabled={isLoading}
                    >
                        + Добавить тип
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
