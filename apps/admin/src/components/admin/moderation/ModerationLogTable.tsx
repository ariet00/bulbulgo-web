'use client'

import { useState } from 'react'
import {
    Badge,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import {
    MODERATION_ACTION_LABELS,
    MODERATION_RULE_LABELS,
    ModerationLog,
} from '@/apis/admin'
import { useAdminModerationLogs } from '@/hooks/queries/admin'

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' })

const author = (row: ModerationLog) =>
    row.username ? `@${row.username}` : (row.full_name ?? row.tg_user_id ?? '—')

export function ModerationLogTable() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(50)
    const [chatId, setChatId] = useState('')
    const { data, isLoading } = useAdminModerationLogs(page, size, {
        chat_id: chatId || undefined,
    })

    const rows = data?.items ?? []

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    value={chatId}
                    onChange={(e) => {
                        setChatId(e.target.value)
                        setPage(1)
                    }}
                    placeholder="Chat ID группы"
                    className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                    Записи попадают в журнал с задержкой до минуты.
                </p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-40">Когда</TableHead>
                            <TableHead>Группа</TableHead>
                            <TableHead>Автор</TableHead>
                            <TableHead>Правило</TableHead>
                            <TableHead>Слово</TableHead>
                            <TableHead>Сообщение</TableHead>
                            <TableHead>Итог</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7}>Загрузка…</TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-muted-foreground">
                                    Пока ничего не удалялось
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="text-xs whitespace-nowrap">
                                        {formatDateTime(row.created_at)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {row.chat_title ?? row.chat_id ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-sm">{author(row)}</TableCell>
                                    <TableCell className="text-sm">
                                        {row.rule ? (MODERATION_RULE_LABELS[row.rule] ?? row.rule) : '—'}
                                        {row.is_edited && (
                                            <Badge variant="outline" className="ml-2">
                                                правка
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm font-mono">{row.matched ?? '—'}</TableCell>
                                    <TableCell className="max-w-md">
                                        <span className="line-clamp-2 text-sm text-muted-foreground">
                                            {row.text ?? '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {row.executed ? (
                                            <Badge variant="outline">
                                                {row.action
                                                    ? (MODERATION_ACTION_LABELS[row.action] ?? row.action)
                                                    : 'выполнено'}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" title={row.error ?? undefined}>
                                                не удалось
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {(data?.total ?? 0) > 0 && (
                <Pagination
                    page={page}
                    total={data?.total ?? 0}
                    size={size}
                    onPageChange={setPage}
                    onSizeChange={(s) => {
                        setSize(s)
                        setPage(1)
                    }}
                />
            )}
        </div>
    )
}
