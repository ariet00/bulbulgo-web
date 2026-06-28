'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Checkbox,
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
    Switch,
} from '@doska/ui'
import type { McAttribute, McBinding } from '@/apis/marketplace'
import { APPLIES_TO } from '@/apis/marketplace'
import { useMpCreateBinding, useMpUpdateBinding } from '@/hooks/mutations/marketplace'
import { pickLabel } from './shared'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    categoryId: number
    /** present → edit; absent → create */
    binding?: McBinding | null
    attributes: McAttribute[]
}

export function BindingDialog({ open, onOpenChange, categoryId, binding, attributes }: Props) {
    const isEdit = !!binding
    const [attributeId, setAttributeId] = useState<number | null>(null)
    const [required, setRequired] = useState(false)
    const [filterable, setFilterable] = useState(false)
    const [appliesTo, setAppliesTo] = useState('both')
    const [sortOrder, setSortOrder] = useState(0)
    const [allowed, setAllowed] = useState<Set<string>>(new Set())

    const create = useMpCreateBinding()
    const update = useMpUpdateBinding()
    const pending = create.isPending || update.isPending

    const attr = useMemo(
        () => attributes.find((a) => a.id === (attributeId ?? binding?.attribute_id)),
        [attributes, attributeId, binding],
    )
    const isEnum = attr?.type === 'enum' || attr?.type === 'multi_enum'
    const allOptionValues = useMemo(() => (attr?.options ?? []).map((o) => o.value), [attr])

    useEffect(() => {
        if (!open) return
        setAttributeId(binding?.attribute_id ?? null)
        setRequired(binding?.is_required ?? false)
        setFilterable(binding?.is_filterable ?? false)
        setAppliesTo(binding?.applies_to ?? 'both')
        setSortOrder(binding?.sort_order ?? 0)
        setAllowed(new Set(binding?.allowed_options ?? []))
    }, [open, binding])

    const toggleAllowed = (v: string) =>
        setAllowed((prev) => {
            const next = new Set(prev)
            next.has(v) ? next.delete(v) : next.add(v)
            return next
        })

    // partial subset → restrict; empty or full → no restriction (null)
    const resolveAllowed = (): string[] | null => {
        if (!isEnum) return null
        const arr = allOptionValues.filter((v) => allowed.has(v))
        if (arr.length === 0 || arr.length === allOptionValues.length) return null
        return arr
    }

    const submit = () => {
        if (isEdit) {
            update.mutate(
                {
                    id: binding!.id,
                    body: {
                        is_required: required,
                        is_filterable: filterable,
                        applies_to: appliesTo,
                        sort_order: sortOrder,
                        allowed_options: resolveAllowed(),
                    },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            if (attributeId == null) return
            create.mutate(
                {
                    category_id: categoryId,
                    attribute_id: attributeId,
                    is_required: required,
                    is_filterable: filterable,
                    applies_to: appliesTo,
                    sort_order: sortOrder,
                    allowed_options: resolveAllowed(),
                },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Привязка атрибута' : 'Привязать атрибут'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Атрибут</Label>
                        {isEdit ? (
                            <div className="text-sm font-medium">
                                {pickLabel(attr?.label, attr?.key ?? '')}{' '}
                                <span className="text-muted-foreground">({attr?.type})</span>
                            </div>
                        ) : (
                            <Select
                                value={attributeId != null ? String(attributeId) : ''}
                                onValueChange={(v) => setAttributeId(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите атрибут" />
                                </SelectTrigger>
                                <SelectContent>
                                    {attributes
                                        .filter((a) => a.is_active)
                                        .map((a) => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {pickLabel(a.label, a.key)} · {a.key} ({a.type})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Обязательный (для offer)</Label>
                        <Switch checked={required} onCheckedChange={setRequired} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>В фильтрах</Label>
                        <Switch checked={filterable} onCheckedChange={setFilterable} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Сторона</Label>
                            <Select value={appliesTo} onValueChange={setAppliesTo}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPLIES_TO.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Порядок</Label>
                            <Input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {isEnum && allOptionValues.length > 0 && (
                        <div className="space-y-2">
                            <Label>Допустимые значения в этой категории</Label>
                            <div className="text-xs text-muted-foreground">
                                Отметьте подмножество; пусто или все = без ограничения.
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {(attr?.options ?? []).map((o) => (
                                    <label key={o.value} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={allowed.has(o.value)}
                                            onCheckedChange={() => toggleAllowed(o.value)}
                                        />
                                        {pickLabel(o.label, o.value)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={submit} disabled={pending || (!isEdit && attributeId == null)}>
                        {isEdit ? 'Сохранить' : 'Привязать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
