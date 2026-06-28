'use client'

import { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { Plus, Trash2 } from 'lucide-react'
import type { LabelMap, McAttribute, McAttributeOption } from '@/apis/marketplace'
import { ATTRIBUTE_TYPES } from '@/apis/marketplace'
import { useMpCreateAttribute, useMpUpdateAttribute } from '@/hooks/mutations/marketplace'
import { LabelInputs } from './shared'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    attribute?: McAttribute | null
}

const ENUM_TYPES = ['enum', 'multi_enum']

export function AttributeDialog({ open, onOpenChange, attribute }: Props) {
    const isEdit = !!attribute
    const [key, setKey] = useState('')
    const [type, setType] = useState<string>('string')
    const [label, setLabel] = useState<LabelMap>({})
    const [unit, setUnit] = useState<LabelMap>({})
    const [options, setOptions] = useState<McAttributeOption[]>([])

    const create = useMpCreateAttribute()
    const update = useMpUpdateAttribute()
    const pending = create.isPending || update.isPending
    const isEnum = ENUM_TYPES.includes(type)

    useEffect(() => {
        if (!open) return
        setKey(attribute?.key ?? '')
        setType(attribute?.type ?? 'string')
        setLabel(attribute?.label ?? {})
        setUnit(attribute?.unit ?? {})
        setOptions(attribute?.options?.map((o) => ({ ...o })) ?? [])
    }, [open, attribute])

    const addOption = () =>
        setOptions((prev) => [...prev, { value: '', label: {}, sort_order: prev.length, is_active: true }])
    const updateOption = (i: number, patch: Partial<McAttributeOption>) =>
        setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
    const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i))

    const submit = () => {
        if (!key.trim()) return
        const cleanOptions = isEnum
            ? options.filter((o) => o.value.trim()).map((o, i) => ({ ...o, sort_order: i }))
            : []
        const unitVal = Object.keys(unit).length ? unit : null
        if (isEdit) {
            update.mutate(
                {
                    id: attribute!.id,
                    body: { key, type: type as any, label, unit: unitVal, options: cleanOptions },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            create.mutate(
                { key, type: type as any, label, unit: unitVal, options: cleanOptions },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Редактировать атрибут' : 'Новый атрибут'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Ключ</Label>
                            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="year" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Тип</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ATTRIBUTE_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <LabelInputs label="Название" value={label} onChange={setLabel} placeholder="Год выпуска" />
                    <LabelInputs label="Единица (опц.)" value={unit} onChange={setUnit} placeholder="км" />

                    {isEnum && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Значения</Label>
                                <Button size="sm" variant="outline" onClick={addOption}>
                                    <Plus className="mr-1 h-4 w-4" /> Значение
                                </Button>
                            </div>
                            {options.length === 0 && (
                                <div className="text-xs text-muted-foreground">
                                    Добавьте хотя бы одно значение для enum-атрибута.
                                </div>
                            )}
                            <div className="space-y-2">
                                {options.map((o, i) => (
                                    <div key={i} className="rounded-md border p-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={o.value}
                                                placeholder="value (sale)"
                                                onChange={(e) => updateOption(i, { value: e.target.value })}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 text-destructive"
                                                onClick={() => removeOption(i)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <LabelInputs
                                            label=""
                                            value={o.label}
                                            onChange={(next) => updateOption(i, { label: next })}
                                            placeholder="Продажа"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={submit} disabled={pending || !key.trim()}>
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
