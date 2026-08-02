'use client'

import { useEffect, useMemo, useState } from 'react'
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
    Switch,
} from '@doska/ui'
import type { McAttribute, McBinding, McGroupDef } from '@/apis/marketplace'
import { APPLIES_TO } from '@/apis/marketplace'
import { useMpCreateBinding, useMpUpdateBinding } from '@/hooks/mutations/marketplace'
import { pickLabel } from './shared'

const NO_GROUP = '__none__'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    categoryId: number
    /** present → edit; absent → create */
    binding?: McBinding | null
    attributes: McAttribute[]
    /** groups available for this category (self + inherited), for the group picker */
    groups?: McGroupDef[]
    /** пути категории от корня к ней самой — атрибут можно вешать только из них */
    ownerPaths?: string[]
}

export function BindingDialog({
    open,
    onOpenChange,
    categoryId,
    binding,
    attributes,
    groups = [],
    ownerPaths,
}: Props) {
    const isEdit = !!binding
    const [attributeId, setAttributeId] = useState<number | null>(null)
    const [required, setRequired] = useState(false)
    const [filterable, setFilterable] = useState(false)
    const [appliesTo, setAppliesTo] = useState('both')
    const [sortOrder, setSortOrder] = useState(0)
    const [group, setGroup] = useState<string>(NO_GROUP)

    const create = useMpCreateBinding()
    const update = useMpUpdateBinding()
    const pending = create.isPending || update.isPending

    const attr = useMemo(
        () => attributes.find((a) => a.id === (attributeId ?? binding?.attribute_id)),
        [attributes, attributeId, binding],
    )
    // вешать можно только атрибуты своего поддерева (владелец — предок категории)
    const bindable = useMemo(
        () =>
            attributes.filter(
                (a) =>
                    a.is_active &&
                    (!ownerPaths || ownerPaths.includes(a.category_slug ?? '')),
            ),
        [attributes, ownerPaths],
    )

    useEffect(() => {
        if (!open) return
        setAttributeId(binding?.attribute_id ?? null)
        setRequired(binding?.is_required ?? false)
        setFilterable(binding?.is_filterable ?? false)
        setAppliesTo(binding?.applies_to ?? 'both')
        setSortOrder(binding?.sort_order ?? 0)
        setGroup(binding?.group ?? NO_GROUP)
    }, [open, binding])

    const submit = () => {
        const groupVal = group === NO_GROUP ? '' : group
        if (isEdit) {
            update.mutate(
                {
                    id: binding!.id,
                    body: {
                        is_required: required,
                        is_filterable: filterable,
                        applies_to: appliesTo,
                        sort_order: sortOrder,
                        group: groupVal,
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
                    group: groupVal || undefined,
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
                                    {bindable.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {pickLabel(a.label, a.key)} · {a.key} ({a.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Набор и порядок значений задаются у самого атрибута. Нужен
                            другой набор в подкатегории — заведите там свой атрибут с тем
                            же ключом: он перекроет родительский.
                        </p>
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

                    <div className="space-y-1.5">
                        <Label>Группа</Label>
                        <Select value={group} onValueChange={setGroup}>
                            <SelectTrigger>
                                <SelectValue placeholder="Без группы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_GROUP}>Без группы</SelectItem>
                                {groups.map((g) => (
                                    <SelectItem key={g.key} value={g.key}>
                                        {pickLabel(g.label, g.key)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {groups.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Групп нет — задайте их в редакторе категории.
                            </p>
                        )}
                    </div>

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
