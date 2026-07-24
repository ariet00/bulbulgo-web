'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Mail, Phone, Plus, RefreshCw, Trash2, User, X } from 'lucide-react'
import { useDebounce } from '@doska/shared'
import {
    BackButton,
    Badge,
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
import type { AdminBannedIdentifier, AdminBannedIdentifierGroup } from '@/apis/admin/users'
import { useAdminBannedIdentifiers } from '@/hooks/queries/admin'
import { useAdminBanIdentifier, useAdminUnbanIdentifier } from '@/hooks/mutations/admin'
import { useFilterParams } from '@/hooks/useFilterParams'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    type: ALL,
}

function TypeBadge({ type }: { type: string }) {
    return type === 'email' ? (
        <Badge variant="secondary" className="gap-1">
            <Mail className="h-3 w-3" /> email
        </Badge>
    ) : (
        <Badge variant="secondary" className="gap-1">
            <Phone className="h-3 w-3" /> phone
        </Badge>
    )
}

/** Заголовок группы: юзер (ссылка; имя может отсутствовать — аккаунт уже
 * удалён, бан переживает purge) либо ручной бан. */
function GroupHeader({ group }: { group: AdminBannedIdentifierGroup }) {
    if (group.user_id) {
        return (
            <Link
                href={`/admin/users/${group.user_id}`}
                className="flex items-center gap-1.5 font-medium hover:underline"
            >
                <User className="h-4 w-4 text-muted-foreground" />
                {group.user_name || `юзер #${group.user_id}`}
                <span className="font-normal text-muted-foreground">
                    #{group.user_id} · бан аккаунта
                </span>
            </Link>
        )
    }
    const adminId = group.identifiers[0]?.data?.banned_by_admin_id
    return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Вручную{adminId ? ` (админ #${adminId})` : ''}
        </span>
    )
}

export default function BannedIdentifiersPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminBannedIdentifiers(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            type: values.type === ALL ? undefined : values.type,
        },
    )

    const banMutation = useAdminBanIdentifier()
    const unbanMutation = useAdminUnbanIdentifier()

    // Форма ручного бана
    const [newType, setNewType] = useState('phone')
    const [newValue, setNewValue] = useState('')
    const [newReason, setNewReason] = useState('')

    const handleAdd = () => {
        if (!newValue.trim()) return
        banMutation.mutate(
            { type: newType, value: newValue.trim(), reason: newReason.trim() || undefined },
            {
                onSuccess: () => {
                    setNewValue('')
                    setNewReason('')
                },
            },
        )
    }

    const handleUnban = (row: AdminBannedIdentifier) => {
        if (confirm(`Разбанить ${row.type === 'email' ? 'почту' : 'номер'} ${row.value}?`)) {
            unbanMutation.mutate(row.id)
        }
    }

    const hasActiveFilters = !!values.q || values.type !== ALL

    return (
        <div className="space-y-6">
            <BackButton />
            <h1 className="text-2xl font-bold">Забаненные номера и почты</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Ручной бан</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:flex-row">
                    <Select value={newType} onValueChange={setNewType}>
                        <SelectTrigger className="sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="phone">Телефон</SelectItem>
                            <SelectItem value="email">Почта</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={newType === 'email' ? 'user@example.com' : '+996 700 …'}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="sm:w-64"
                    />
                    <Input
                        placeholder="Причина (необязательно)"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="sm:flex-1"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={!newValue.trim() || banMutation.isPending}
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" /> Забанить
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Реестр</CardTitle>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Обновить"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            placeholder="Поиск по значению…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="sm:w-64"
                        />
                        <Select
                            value={values.type}
                            onValueChange={(v) => setValues({ type: v, page: 1 })}
                        >
                            <SelectTrigger className="sm:w-40">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все типы</SelectItem>
                                <SelectItem value="phone">Телефон</SelectItem>
                                <SelectItem value="email">Почта</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setQInput('')
                                    reset()
                                }}
                                className="gap-1"
                            >
                                <X className="h-4 w-4" /> Сбросить
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Значение</TableHead>
                                        <TableHead>Причина</TableHead>
                                        <TableHead>Дата</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-6 text-center text-muted-foreground"
                                            >
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((group, gi) => (
                                        <Fragment key={group.user_id ?? `manual-${group.identifiers[0]?.id ?? gi}`}>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableCell colSpan={5} className="py-2">
                                                    <GroupHeader group={group} />
                                                </TableCell>
                                            </TableRow>
                                            {group.identifiers.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <TypeBadge type={row.type} />
                                                    </TableCell>
                                                    <TableCell className="font-mono">{row.value}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                                        {row.data?.reason || '—'}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                        {format(new Date(row.created_at), 'dd.MM.yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUnban(row)}
                                                            disabled={unbanMutation.isPending}
                                                            title="Разбанить"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </Fragment>
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
