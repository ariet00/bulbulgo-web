'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import type { AdminComplaintReason } from '@/apis/admin'
import { useAdminComplaintReasons } from '@/hooks/queries/admin'
import {
    useAdminCreateComplaintReason,
    useAdminDeleteComplaintReason,
    useAdminReorderComplaintReasons,
    useAdminUpdateComplaintReason,
} from '@/hooks/mutations/admin'
import { COMPLAINT_CONTEXTS, contextLabel } from '../helpers'

interface ReasonFormState {
    text: string
    contexts: string[]
    is_active: boolean
}

const EMPTY_FORM: ReasonFormState = { text: '', contexts: [], is_active: true }

export default function ComplaintReasonsPage() {
    const { data: reasons, isLoading } = useAdminComplaintReasons()
    const createReason = useAdminCreateComplaintReason()
    const updateReason = useAdminUpdateComplaintReason()
    const deleteReason = useAdminDeleteComplaintReason()
    const reorder = useAdminReorderComplaintReasons()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<AdminComplaintReason | null>(null)
    const [form, setForm] = useState<ReasonFormState>(EMPTY_FORM)

    const sorted = useMemo(() => reasons ?? [], [reasons])

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setDialogOpen(true)
    }

    const openEdit = (r: AdminComplaintReason) => {
        setEditing(r)
        setForm({ text: r.text, contexts: r.contexts, is_active: r.is_active })
        setDialogOpen(true)
    }

    const toggleContext = (value: string) => {
        setForm((f) => ({
            ...f,
            contexts: f.contexts.includes(value)
                ? f.contexts.filter((c) => c !== value)
                : [...f.contexts, value],
        }))
    }

    const submit = () => {
        const text = form.text.trim()
        if (!text) return
        if (editing) {
            updateReason.mutate(
                { id: editing.id, text, contexts: form.contexts, is_active: form.is_active },
                { onSuccess: () => setDialogOpen(false) },
            )
        } else {
            createReason.mutate(
                {
                    text,
                    contexts: form.contexts,
                    is_active: form.is_active,
                    position: sorted.length,
                },
                { onSuccess: () => setDialogOpen(false) },
            )
        }
    }

    const move = (index: number, delta: -1 | 1) => {
        const ids = sorted.map((r) => r.id)
        const j = index + delta
        if (j < 0 || j >= ids.length) return
        ;[ids[index], ids[j]] = [ids[j], ids[index]]
        reorder.mutate(ids)
    }

    const handleDelete = (r: AdminComplaintReason) => {
        if (confirm(`Удалить тип жалобы «${r.text}»? Существующие жалобы не изменятся.`)) {
            deleteReason.mutate(r.id)
        }
    }

    const saving = createReason.isPending || updateReason.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/complaints">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Жалобы
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Типы жалоб</h1>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Справочник причин</CardTitle>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Список показывается в приложении при отправке жалобы. Причина без
                        контекстов видна на всех экранах; с контекстами — только на выбранных.
                        Существующие жалобы хранят текст причины и при редактировании не меняются.
                    </p>
                    {isLoading ? (
                        <div>Загрузка...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Порядок</TableHead>
                                        <TableHead>Причина</TableHead>
                                        <TableHead>Контексты</TableHead>
                                        <TableHead className="w-28">Активна</TableHead>
                                        <TableHead className="w-28">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sorted.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                                Справочник пуст
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {sorted.map((r, i) => (
                                        <TableRow key={r.id} className={r.is_active ? '' : 'opacity-50'}>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={i === 0 || reorder.isPending}
                                                        onClick={() => move(i, -1)}
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={i === sorted.length - 1 || reorder.isPending}
                                                        onClick={() => move(i, 1)}
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{r.text}</TableCell>
                                            <TableCell>
                                                {r.contexts.length === 0 ? (
                                                    <Badge variant="secondary">Все</Badge>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {r.contexts.map((c) => (
                                                            <Badge key={c} variant="outline">
                                                                {contextLabel(c)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={r.is_active}
                                                    disabled={updateReason.isPending}
                                                    onCheckedChange={(checked) =>
                                                        updateReason.mutate({ id: r.id, is_active: checked })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title="Редактировать"
                                                        onClick={() => openEdit(r)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        title="Удалить"
                                                        disabled={deleteReason.isPending}
                                                        onClick={() => handleDelete(r)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Редактировать тип жалобы' : 'Новый тип жалобы'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason-text">Текст причины</Label>
                            <Input
                                id="reason-text"
                                value={form.text}
                                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                                placeholder="Например: Спам"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Контексты</Label>
                            <p className="text-xs text-muted-foreground">
                                Ничего не выбрано — причина показывается на всех экранах.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {COMPLAINT_CONTEXTS.map((c) => (
                                    <label
                                        key={c.value}
                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={form.contexts.includes(c.value)}
                                            onCheckedChange={() => toggleContext(c.value)}
                                        />
                                        {c.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <Switch
                                checked={form.is_active}
                                onCheckedChange={(checked) =>
                                    setForm((f) => ({ ...f, is_active: checked }))
                                }
                            />
                            Активна
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={submit} disabled={!form.text.trim() || saving}>
                            {editing ? 'Сохранить' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
