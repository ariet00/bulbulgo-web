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
} from '@doska/ui'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import type { LabelMap, McCategoryNode, McGroupDef } from '@/apis/marketplace'
import { useMpCreateCategory, useMpUpdateCategory } from '@/hooks/mutations/marketplace'
import { LabelInputs } from './shared'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    /** present → edit; absent → create */
    category?: McCategoryNode | null
    /** for create: parent node (null = root) */
    parent?: McCategoryNode | null
}

export function CategoryDialog({ open, onOpenChange, category, parent }: Props) {
    const isEdit = !!category
    const [slug, setSlug] = useState('')
    const [label, setLabel] = useState<LabelMap>({})
    const [icon, setIcon] = useState('')
    const [sortOrder, setSortOrder] = useState(0)
    const [groups, setGroups] = useState<McGroupDef[]>([])

    const create = useMpCreateCategory()
    const update = useMpUpdateCategory()
    const pending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setSlug(category?.slug ?? '')
        setLabel(category?.label ?? {})
        setIcon(category?.icon ?? '')
        setSortOrder(category?.sort_order ?? 0)
        setGroups(category?.attribute_groups?.map((g) => ({ ...g })) ?? [])
    }, [open, category])

    const addGroup = () =>
        setGroups((p) => [...p, { key: '', label: {}, sort_order: p.length }])
    const updateGroup = (i: number, patch: Partial<McGroupDef>) =>
        setGroups((p) => p.map((g, idx) => (idx === i ? { ...g, ...patch } : g)))
    const removeGroup = (i: number) => setGroups((p) => p.filter((_, idx) => idx !== i))
    const moveGroup = (i: number, dir: -1 | 1) =>
        setGroups((p) => {
            const j = i + dir
            if (j < 0 || j >= p.length) return p
            const a = [...p]
            ;[a[i], a[j]] = [a[j], a[i]]
            return a
        })

    const submit = () => {
        if (!slug.trim()) return
        const attribute_groups = groups
            .filter((g) => g.key.trim())
            .map((g, i) => ({ ...g, key: g.key.trim(), sort_order: i }))
        if (isEdit) {
            update.mutate(
                {
                    id: category!.id,
                    body: { slug, label, icon: icon || null, sort_order: sortOrder, attribute_groups },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            create.mutate(
                {
                    slug,
                    label,
                    icon: icon || null,
                    sort_order: sortOrder,
                    parent_id: parent?.id ?? null,
                    attribute_groups,
                },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Редактировать категорию' : 'Новая категория'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {!isEdit && (
                        <div className="text-sm text-muted-foreground">
                            Родитель: <b>{parent ? parent.path : '— корень (таб)'}</b>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label>Slug</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="напр. flats"
                        />
                    </div>

                    <LabelInputs label="Название" value={label} onChange={setLabel} placeholder="Квартиры" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Иконка (lucide / emoji)</Label>
                            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="home" />
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Группы атрибутов</Label>
                            <Button variant="outline" size="sm" onClick={addGroup}>
                                <Plus className="mr-1 h-4 w-4" /> Группа
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ключ + название; порядок сверху вниз. Атрибут относят к группе в его привязке.
                        </p>
                        {groups.map((g, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    className="w-32"
                                    value={g.key}
                                    onChange={(e) => updateGroup(i, { key: e.target.value })}
                                    placeholder="main"
                                />
                                <Input
                                    className="flex-1"
                                    value={g.label?.ru ?? ''}
                                    onChange={(e) =>
                                        updateGroup(i, { label: { ...g.label, ru: e.target.value } })
                                    }
                                    placeholder="Основные"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={i === 0}
                                    onClick={() => moveGroup(i, -1)}
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={i === groups.length - 1}
                                    onClick={() => moveGroup(i, 1)}
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeGroup(i)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={submit} disabled={pending || !slug.trim()}>
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
