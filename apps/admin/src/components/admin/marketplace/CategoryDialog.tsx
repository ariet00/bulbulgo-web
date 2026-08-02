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
import type { LabelMap, McCategoryNode } from '@/apis/marketplace'
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

    const create = useMpCreateCategory()
    const update = useMpUpdateCategory()
    const pending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setSlug(category?.slug ?? '')
        setLabel(category?.label ?? {})
        setIcon(category?.icon ?? '')
        setSortOrder(category?.sort_order ?? 0)
    }, [open, category])

    const submit = () => {
        if (!slug.trim()) return
        if (isEdit) {
            update.mutate(
                {
                    id: category!.id,
                    body: { slug, label, icon: icon || null, sort_order: sortOrder },
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
