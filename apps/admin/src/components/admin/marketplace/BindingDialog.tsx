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
import type {
    McAttribute,
    McAttributeOption,
    McBinding,
    McEffectiveAttribute,
    McGroup,
} from '@/apis/marketplace'
import { APPLIES_TO } from '@/apis/marketplace'
import { useMpCreateBinding, useMpUpdateBinding } from '@/hooks/mutations/marketplace'
import { pickLabel } from './shared'

const NO_GROUP = '__none__'
const NO_PARENT = '__none__'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    categoryId: number
    /** present → edit; absent → create */
    binding?: McBinding | null
    attributes: McAttribute[]
    /** группы категории (свои + унаследованные) — выбор в пикере */
    groups?: McGroup[]
    /** пути категории от корня к ней самой — атрибут можно вешать только из них */
    ownerPaths?: string[]
    /** типы сделки этой ветки — ось «когда поле применимо» */
    dealTypes?: McAttributeOption[]
    /** эффективный набор категории — из него выбирается родитель зависимости */
    effective?: McEffectiveAttribute[]
}

export function BindingDialog({
    open,
    onOpenChange,
    categoryId,
    binding,
    attributes,
    groups = [],
    ownerPaths,
    dealTypes = [],
    effective = [],
}: Props) {
    const isEdit = !!binding
    const [attributeId, setAttributeId] = useState<number | null>(null)
    const [required, setRequired] = useState(false)
    const [filterable, setFilterable] = useState(false)
    const [appliesTo, setAppliesTo] = useState('both')
    const [sortOrder, setSortOrder] = useState(0)
    const [groupId, setGroupId] = useState<string>(NO_GROUP)
    // пусто = поле применимо к любой сделке (аналог applies_to = both)
    const [deals, setDeals] = useState<string[]>([])
    const [requiredDeals, setRequiredDeals] = useState<string[]>([])
    // зависимость от значения другого атрибута: родитель + его значения
    const [parentKey, setParentKey] = useState<string>(NO_PARENT)
    const [parentValues, setParentValues] = useState<string[]>([])

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
        setGroupId(binding?.group_id ? String(binding.group_id) : NO_GROUP)
        setDeals(binding?.deal_types ?? [])
        setRequiredDeals(binding?.required_deal_types ?? [])
        setParentKey(binding?.depends_on?.key ?? NO_PARENT)
        setParentValues(binding?.depends_on?.values ?? [])
    }, [open, binding])

    const toggle = (
        list: string[],
        set: (next: string[]) => void,
        value: string,
    ) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

    // родителем может быть только перечислимый атрибут этой категории —
    // бэкенд это же и проверяет при сохранении
    const parents = useMemo(
        () =>
            effective.filter(
                (a) =>
                    a.key !== attr?.key &&
                    (a.type === 'enum' || a.type === 'multi_enum') &&
                    a.options.length > 0,
            ),
        [effective, attr],
    )
    const parentOptions = parents.find((p) => p.key === parentKey)?.options ?? []

    // пустые значения снимают зависимость
    const dependsOn = () =>
        parentKey !== NO_PARENT && parentValues.length > 0
            ? { key: parentKey, values: parentValues }
            : { key: '', values: [] }

    const submit = () => {
        // 0 снимает группу — бэкенд отличает «не трогать» (undefined) от сброса
        const groupVal = groupId === NO_GROUP ? 0 : Number(groupId)
        if (isEdit) {
            update.mutate(
                {
                    id: binding!.id,
                    body: {
                        is_required: required,
                        is_filterable: filterable,
                        applies_to: appliesTo,
                        sort_order: sortOrder,
                        deal_types: deals,
                        required_deal_types: requiredDeals,
                        depends_on: dependsOn(),
                        group_id: groupVal,
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
                    deal_types: deals,
                    required_deal_types: requiredDeals,
                    depends_on: dependsOn(),
                    group_id: groupVal || undefined,
                },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85dvh] max-w-lg flex-col overflow-y-hidden">
                <DialogHeader className="shrink-0">
                    <DialogTitle>{isEdit ? 'Привязка атрибута' : 'Привязать атрибут'}</DialogTitle>
                </DialogHeader>

                {/* тело скроллится, шапка и кнопки закреплены */}
                <div className="-mx-6 flex-1 space-y-4 overflow-y-auto px-6 py-0.5">
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
                        <Select value={groupId} onValueChange={setGroupId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Без группы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_GROUP}>Без группы</SelectItem>
                                {groups.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
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

                    {parents.length > 0 && (
                        <div className="space-y-2">
                            <Label>Зависит от поля</Label>
                            <Select
                                value={parentKey}
                                onValueChange={(v) => {
                                    setParentKey(v)
                                    setParentValues([])
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Без зависимости" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_PARENT}>Без зависимости</SelectItem>
                                    {parents.map((p) => (
                                        <SelectItem key={p.key} value={p.key}>
                                            {pickLabel(p.label, p.key)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {parentKey !== NO_PARENT && (
                                <>
                                    <p className="text-xs text-muted-foreground">
                                        Поле показывается, только если у родителя выбрано
                                        одно из отмеченных значений. Ничего не отмечено —
                                        зависимости нет.
                                    </p>
                                    <div className="divide-y rounded-md border">
                                        {parentOptions.map((o) => (
                                            <label
                                                key={o.value}
                                                className="flex items-center gap-3 px-2 py-1.5 text-sm"
                                            >
                                                <Checkbox
                                                    checked={parentValues.includes(o.value)}
                                                    onCheckedChange={() =>
                                                        toggle(
                                                            parentValues,
                                                            setParentValues,
                                                            o.value,
                                                        )
                                                    }
                                                />
                                                {pickLabel(o.label, o.value)}
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {dealTypes.length > 0 && (
                        <div className="space-y-2">
                            <Label>Типы сделки</Label>
                            <p className="text-xs text-muted-foreground">
                                Ничего не отмечено — поле применимо к любой сделке.
                                Отметки в «обязательно» требуют его при этих сделках.
                            </p>
                            <div className="divide-y rounded-md border">
                                {dealTypes.map((o) => (
                                    <div
                                        key={o.value}
                                        className="flex items-center gap-3 px-2 py-1.5"
                                    >
                                        <Checkbox
                                            checked={deals.includes(o.value)}
                                            onCheckedChange={() =>
                                                toggle(deals, setDeals, o.value)
                                            }
                                        />
                                        <span className="flex-1 text-sm">
                                            {pickLabel(o.label, o.value)}
                                        </span>
                                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Checkbox
                                                checked={requiredDeals.includes(o.value)}
                                                onCheckedChange={() =>
                                                    toggle(
                                                        requiredDeals,
                                                        setRequiredDeals,
                                                        o.value,
                                                    )
                                                }
                                            />
                                            обязательно
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter className="shrink-0">
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
