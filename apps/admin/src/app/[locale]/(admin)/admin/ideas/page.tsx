'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useDebounce } from '@doska/shared'
import { Trash2 } from 'lucide-react'
import {
    IDEA_CATEGORY_LABELS,
    IDEA_STATUSES,
    IDEA_STATUS_LABELS,
    type AdminIdea,
    type IdeaStatus,
} from '@/apis/admin'
import { useAdminIdeasList } from '@/hooks/queries/admin'
import {
    useAdminDeleteIdea,
    useAdminUpdateIdeaStatus,
} from '@/hooks/mutations/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useConfirm } from '@/components/admin/ConfirmProvider'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
}

const STATUS_BADGE: Record<IdeaStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    planned: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700',
    declined: 'bg-gray-200 text-gray-600',
}

export default function AdminIdeasPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading } = useAdminIdeasList(values.page, values.size, {
        q: values.q || undefined,
        status: values.status === ALL ? undefined : values.status,
    })
    const updateStatus = useAdminUpdateIdeaStatus()
    const deleteIdea = useAdminDeleteIdea()
    const confirm = useConfirm()

    const handleDelete = async (i: AdminIdea) => {
        if (await confirm(`Удалить идею #${i.id}?`)) {
            deleteIdea.mutate(i.id)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Идеи и предложения</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Идеи пользователей</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Форма «Идеи и предложения» в приложении (webview{' '}
                        <b>ideas</b>). Пользователь видит статус своих идей —
                        двигайте его по мере рассмотрения.
                    </p>
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по тексту…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v, page: 1 })}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {IDEA_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {IDEA_STATUS_LABELS[s]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {isLoading ? (
                        <div>Загрузка...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Автор</TableHead>
                                        <TableHead>Категория</TableHead>
                                        <TableHead className="min-w-[24rem]">
                                            Текст
                                        </TableHead>
                                        <TableHead>Фото</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground py-6"
                                            >
                                                Пока нет идей
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((i) => (
                                        <TableRow key={i.id}>
                                            <TableCell>{i.id}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="text-sm font-medium">
                                                    {i.author_name || `ID ${i.user_id}`}
                                                </div>
                                                {i.author_phone && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {i.author_phone}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">
                                                {i.category
                                                    ? (IDEA_CATEGORY_LABELS[
                                                          i.category
                                                      ] ?? i.category)
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="max-w-[40ch]">
                                                <p className="whitespace-pre-wrap text-sm">
                                                    {i.text}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {i.photos.length > 0 ? (
                                                    <div className="flex gap-1">
                                                        {i.photos.map((url, n) => (
                                                            <a
                                                                key={url}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={url}
                                                                    alt={`Фото ${n + 1}`}
                                                                    className="h-10 w-10 rounded object-cover"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={i.status}
                                                    onValueChange={(v) =>
                                                        updateStatus.mutate({
                                                            id: i.id,
                                                            status: v as IdeaStatus,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger
                                                        size="sm"
                                                        className={`w-44 border-0 ${STATUS_BADGE[i.status]}`}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {IDEA_STATUSES.map((s) => (
                                                            <SelectItem
                                                                key={s}
                                                                value={s}
                                                            >
                                                                {
                                                                    IDEA_STATUS_LABELS[
                                                                        s
                                                                    ]
                                                                }
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {format(
                                                    new Date(i.created_at),
                                                    'dd.MM.yyyy HH:mm',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    title="Удалить"
                                                    disabled={deleteIdea.isPending}
                                                    onClick={() => handleDelete(i)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {data && (
                        <Pagination
                            page={data.page}
                            total={data.total}
                            size={data.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
