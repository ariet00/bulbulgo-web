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
import type { LabelMap, McGroup } from '@/apis/marketplace'
import { useMpCreateGroup, useMpUpdateGroup } from '@/hooks/mutations/marketplace'
import { LabelInputs } from './shared'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    /** категория-владелец при создании */
    categoryId: number
    /** present → edit; absent → create */
    group?: McGroup | null
}

export function GroupDialog({ open, onOpenChange, categoryId, group }: Props) {
    const isEdit = !!group
    const [key, setKey] = useState('')
    const [label, setLabel] = useState<LabelMap>({})
    const [sortOrder, setSortOrder] = useState(0)

    const create = useMpCreateGroup()
    const update = useMpUpdateGroup()
    const pending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setKey(group?.key ?? '')
        setLabel(group?.label ?? {})
        setSortOrder(group?.sort_order ?? 0)
    }, [open, group])

    const submit = () => {
        if (!key.trim()) return
        const done = { onSuccess: () => onOpenChange(false) }
        if (isEdit) {
            update.mutate(
                { id: group!.id, body: { key, label, sort_order: sortOrder } },
                done,
            )
        } else {
            create.mutate({ category_id: categoryId, key, label, sort_order: sortOrder }, done)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Группа полей' : 'Новая группа'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Ключ</Label>
                            <Input
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="comfort"
                            />
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

                    <LabelInputs label="Название" value={label} onChange={setLabel} placeholder="Комфорт" />

                    <p className="text-xs text-muted-foreground">
                        Группа доступна во всём поддереве категории-владельца: заведённую
                        на корне вертикали можно указать в привязке любой её ветки.
                    </p>
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
