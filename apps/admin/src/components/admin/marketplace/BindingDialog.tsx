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
import { ChevronDown, ChevronUp } from 'lucide-react'
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
}

export function BindingDialog({
    open,
    onOpenChange,
    categoryId,
    binding,
    attributes,
    groups = [],
}: Props) {
    const isEdit = !!binding
    const [attributeId, setAttributeId] = useState<number | null>(null)
    const [required, setRequired] = useState(false)
    const [filterable, setFilterable] = useState(false)
    const [appliesTo, setAppliesTo] = useState('both')
    const [sortOrder, setSortOrder] = useState(0)
    const [group, setGroup] = useState<string>(NO_GROUP)
    // allowed_options as an ORDERED list (defines the strip order per category) +
    // which values are included.
    const [order, setOrder] = useState<string[]>([])
    const [included, setIncluded] = useState<Set<string>>(new Set())

    const create = useMpCreateBinding()
    const update = useMpUpdateBinding()
    const pending = create.isPending || update.isPending

    const attr = useMemo(
        () => attributes.find((a) => a.id === (attributeId ?? binding?.attribute_id)),
        [attributes, attributeId, binding],
    )
    const isEnum = attr?.type === 'enum' || attr?.type === 'multi_enum'
    const allOptionValues = useMemo(() => (attr?.options ?? []).map((o) => o.value), [attr])
    const optByValue = useMemo(
        () => Object.fromEntries((attr?.options ?? []).map((o) => [o.value, o])),
        [attr],
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

    // Seed the ordered allowed list from the binding (or all options) once the
    // selected attribute is known.
    useEffect(() => {
        if (!open || !attr) return
        const all = (attr.options ?? []).map((o) => o.value)
        const ao = binding?.allowed_options ?? null
        if (ao && ao.length) {
            setOrder([...ao.filter((v) => all.includes(v)), ...all.filter((v) => !ao.includes(v))])
            setIncluded(new Set(ao))
        } else {
            setOrder(all)
            setIncluded(new Set(all))
        }
    }, [open, attr, binding])

    const toggleIncluded = (v: string) =>
        setIncluded((prev) => {
            const next = new Set(prev)
            next.has(v) ? next.delete(v) : next.add(v)
            return next
        })

    const move = (i: number, dir: -1 | 1) =>
        setOrder((prev) => {
            const j = i + dir
            if (j < 0 || j >= prev.length) return prev
            const a = [...prev]
            ;[a[i], a[j]] = [a[j], a[i]]
            return a
        })

    // Selected values in display order. Returns null (no restriction, default
    // order, future options auto-included) when all options are kept in their
    // original order; otherwise the explicit ordered subset.
    const resolveAllowed = (): string[] | null => {
        if (!isEnum) return null
        const sel = order.filter((v) => included.has(v))
        if (sel.length === 0) return null
        if (
            sel.length === allOptionValues.length &&
            sel.every((v, i) => v === allOptionValues[i])
        ) {
            return null
        }
        return sel
    }

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
                        allowed_options: resolveAllowed(),
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
                    allowed_options: resolveAllowed(),
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

                    {isEnum && allOptionValues.length > 0 && (
                        <div className="space-y-2">
                            <Label>Значения и порядок в этой категории</Label>
                            <div className="text-xs text-muted-foreground">
                                Отметьте нужные и расставьте порядок — в этом порядке они
                                показываются в приложении. Все в исходном порядке = без ограничения.
                            </div>
                            <div className="divide-y rounded-md border">
                                {order.map((v, i) => (
                                    <div key={v} className="flex items-center gap-2 px-2 py-1.5">
                                        <Checkbox
                                            checked={included.has(v)}
                                            onCheckedChange={() => toggleIncluded(v)}
                                        />
                                        <span className="flex-1 text-sm">
                                            {pickLabel(optByValue[v]?.label, v)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            disabled={i === 0}
                                            onClick={() => move(i, -1)}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            disabled={i === order.length - 1}
                                            onClick={() => move(i, 1)}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
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
                    <Button onClick={submit} disabled={pending || (!isEdit && attributeId == null)}>
                        {isEdit ? 'Сохранить' : 'Привязать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
