'use client'

import {
    type ParserSetting,
    useDebounce,
    useDeleteParserSetting,
    useParserSettings,
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

function dataPreview(value: any): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string') return value.length > 80 ? value.slice(0, 80) + '…' : value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return `[список, ${value.length}]`
    if (typeof value === 'object') return `{объект, ${Object.keys(value).length} ключей}`
    return String(value)
}

function scopeLabel(s: ParserSetting): string {
    const parts: string[] = []
    if (s.user_id) parts.push(`user=${s.user_id}`)
    if (s.company_id) parts.push(`company=${s.company_id}`)
    if (s.domain) parts.push(s.domain)
    return parts.length ? parts.join(' · ') : '—'
}

export default function ParserSettingsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const [groupFilter, setGroupFilter] = useState('')
    const dq = useDebounce(q, 300)
    const dGroup = useDebounce(groupFilter, 300)

    const { data, isLoading } = useParserSettings(
        page,
        size,
        dGroup || undefined,
        dq || undefined,
    )
    const remove = useDeleteParserSetting()

    const handleDelete = (row: ParserSetting) => {
        if (confirm(`Удалить ${row.group}/${row.key}?`)) {
            remove.mutate(row.id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Парсер · Настройки</h1>
                <Link href="/admin/parser/settings/new">
                    <Button size="sm">
                        <Plus className="size-4 mr-1" /> Создать
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Универсальный KV-стор</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Группа (напр. parser.ai)"
                            value={groupFilter}
                            onChange={(e) => {
                                setGroupFilter(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-xs"
                        />
                        <Input
                            placeholder="Поиск по key/group/description…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-md"
                        />
                    </div>

                    {isLoading ? (
                        <div>Loading…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Scope</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Описание</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.group}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.key}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {scopeLabel(row)}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate text-xs font-mono">
                                                {dataPreview(row.data)}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                                {row.description ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/admin/parser/settings/${row.id}`}
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(row)}
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
