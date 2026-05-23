'use client'

import {
    useDebounce,
    useDeleteParserChannel,
    useParserChannels,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function ParserChannelsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)

    const { data, isLoading } = useParserChannels(page, size, 'parse', dq || undefined)
    const remove = useDeleteParserChannel()

    const handleDelete = (id: number, chatId: string) => {
        if (confirm(`Удалить канал "${chatId}"?`)) {
            remove.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
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
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value)
                            setPage(1)
                        }}
                        className="max-w-md"
                    />

                    {isLoading ? (
                        <div>Loading…</div>
                    ) : (
                        <div className="rounded-md border">
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
                                                {row.is_active ? (
                                                    <Badge variant="default">active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">off</Badge>
                                                )}
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
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
