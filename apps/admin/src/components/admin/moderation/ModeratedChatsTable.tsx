'use client'

import {
    Badge,
    Button,
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
import { useState } from 'react'
import { useAdminModeratedChats } from '@/hooks/queries/admin'
import { useAdminUpdateModeratedChat } from '@/hooks/mutations/admin'

// Значение селекта → оверрайд группы. `inherit` убирает оверрайд.
const OVERRIDE_OPTIONS = [
    { value: 'inherit', label: 'Как у бота' },
    { value: 'on', label: 'Включена' },
    { value: 'off', label: 'Выключена' },
] as const

const toValue = (enabled: boolean | null) =>
    enabled === null ? 'inherit' : enabled ? 'on' : 'off'

const fromValue = (value: string): boolean | null =>
    value === 'inherit' ? null : value === 'on'

export function ModeratedChatsTable() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(50)
    const [onlyActive, setOnlyActive] = useState(false)
    const { data, isLoading } = useAdminModeratedChats(page, size, undefined, onlyActive)
    const update = useAdminUpdateModeratedChat()

    const chats = data?.items ?? []

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    Группы появляются здесь сами, когда бота добавляют администратором.
                </p>
                <Button
                    variant={onlyActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setOnlyActive(!onlyActive)
                        setPage(1)
                    }}
                >
                    Только активные
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Группа</TableHead>
                            <TableHead>Chat ID</TableHead>
                            <TableHead>Бот в группе</TableHead>
                            <TableHead className="w-52">Модерация</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && chats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>Загрузка…</TableCell>
                            </TableRow>
                        ) : chats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-muted-foreground">
                                    Пока ни одной группы
                                </TableCell>
                            </TableRow>
                        ) : (
                            chats.map((chat) => (
                                <TableRow key={chat.id}>
                                    <TableCell>{chat.title ?? '—'}</TableCell>
                                    <TableCell className="font-mono text-xs">{chat.chat_id}</TableCell>
                                    <TableCell>
                                        {chat.is_active ? (
                                            <Badge variant="outline">в группе</Badge>
                                        ) : (
                                            <Badge variant="secondary">вышел</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={toValue(chat.enabled)}
                                            onValueChange={(v) =>
                                                update.mutate({ id: chat.id, enabled: fromValue(v) })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OVERRIDE_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
