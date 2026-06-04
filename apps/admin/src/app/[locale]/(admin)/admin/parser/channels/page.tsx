'use client'

import {
    useDebounce,
    useDeleteParserChannel,
    useParserChannels,
    useUpdateParserChannel,
} from '@doska/shared'
import { Link } from '@doska/i18n'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFilterParams } from '@/hooks/useFilterParams'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
}

export default function ParserChannelsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading } = useParserChannels(values.page, values.size, 'parse', values.q || undefined)
    const remove = useDeleteParserChannel()
    const update = useUpdateParserChannel()

    const handleDelete = (id: number, chatId: string) => {
        if (confirm(`Удалить канал "${chatId}"?`)) {
            remove.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Парсер · Каналы</h1>
                <Link href="/admin/parser/channels/new">
                    <Button size="sm">
                        <Plus className="size-4 mr-1" /> Добавить канал
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Telegram-каналы для парсинга</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Поиск по chat_id…"
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        className="w-full sm:max-w-md"
                    />

                    {isLoading ? (
                        <div>Loading…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>chat_id</TableHead>
                                        <TableHead>Активен</TableHead>
                                        <TableHead>Роль</TableHead>
                                        <TableHead>Парсер</TableHead>
                                        <TableHead>Лимит</TableHead>
                                        <TableHead>AI fallback</TableHead>
                                        <TableHead>Bot</TableHead>
                                        <TableHead>Роли</TableHead>
                                        <TableHead>Порядок</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.chat_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={row.is_active}
                                                        disabled={update.isPending}
                                                        onCheckedChange={(next) =>
                                                            update.mutate({
                                                                id: row.id,
                                                                body: { is_active: next },
                                                            })
                                                        }
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {row.is_active ? 'active' : 'off'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.channel_type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.parser.use_parser_ai ? (
                                                    <Badge variant="outline">AI</Badge>
                                                ) : (
                                                    <Badge variant="outline">regex</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{row.parser.limit_message}</TableCell>
                                            <TableCell>
                                                {row.parser.ai_fallback ? '✓' : '—'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {row.parser.bot_username || '—'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {row.parser.allowed_roles?.length
                                                    ? row.parser.allowed_roles.join(', ')
                                                    : 'все'}
                                            </TableCell>
                                            <TableCell>{row.parser.sort_order}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/admin/parser/channels/${row.id}`}
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(row.id, row.chat_id)
                                                        }
                                                        disabled={remove.isPending}
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
