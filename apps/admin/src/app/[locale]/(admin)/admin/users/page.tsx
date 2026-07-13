'use client'

import { useAdminBanUser } from '@/hooks/mutations/admin'
import { useDebounce } from '@doska/shared'
import { useEffect, useState } from 'react'
import { useAdminUsers } from '@/hooks/queries/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@doska/ui"
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@doska/ui"
import { Ban, CheckCircle, Eye, Phone, Mail, Star, X, RefreshCw, Car } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { format } from 'date-fns'

const ALL = '__all__'
const STATUS_OPTIONS = [
    { value: 'active', label: 'Активные' },
    { value: 'banned', label: 'Забанены' },
]
const GENDERS = ['male', 'female']
const PROVIDERS = ['google', 'apple', 'telegram', 'phone']

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
    gender: ALL,
    provider: ALL,
    date_from: '',
    date_to: '',
}

export default function UsersPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data: users, isLoading, isFetching, refetch } = useAdminUsers(
        values.page,
        values.size,
        values.q || undefined,
        {
            is_active: values.status === ALL ? undefined : values.status === 'active',
            gender: values.gender === ALL ? undefined : values.gender,
            provider: values.provider === ALL ? undefined : values.provider,
            date_from: values.date_from || undefined,
            date_to: values.date_to || undefined,
        },
    )
    const banUserMutation = useAdminBanUser()

    const handleBan = (id: number, isActive: boolean) => {
        if (confirm(`Are you sure you want to ${isActive ? 'unban' : 'ban'} this user?`)) {
            banUserMutation.mutate({ id, isActive })
        }
    }

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q ||
        values.status !== ALL ||
        values.gender !== ALL ||
        values.provider !== ALL ||
        !!values.date_from ||
        !!values.date_to

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Management</CardTitle>
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                        <Input
                            placeholder="Поиск по имени/телефону/email/id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.gender}
                            onValueChange={(v) => setValues({ gender: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Пол" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Любой пол</SelectItem>
                                {GENDERS.map((g) => (
                                    <SelectItem key={g} value={g} className="capitalize">
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.provider}
                            onValueChange={(v) => setValues({ provider: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Провайдер" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все провайдеры</SelectItem>
                                {PROVIDERS.map((p) => (
                                    <SelectItem key={p} value={p} className="capitalize">
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Регистрация от</span>
                            <Input
                                type="date"
                                value={values.date_from}
                                onChange={(e) => setValues({ date_from: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">до</span>
                            <Input
                                type="date"
                                value={values.date_to}
                                onChange={(e) => setValues({ date_to: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Сбросить
                            </Button>
                        )}
                    </div>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                    <>
                    {/* Mobile: cards */}
                    <div className="space-y-3 md:hidden">
                        {users?.items.length === 0 && (
                            <div className="rounded-md border py-6 text-center text-muted-foreground">
                                Ничего не найдено
                            </div>
                        )}
                        {users?.items.map((user: any) => (
                            <div key={user.id} className="rounded-md border p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="flex min-w-0 flex-col hover:underline"
                                    >
                                        <span className="truncate font-medium">
                                            {user.full_name || user.name || '—'}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            @{user.username} · #{user.id}
                                        </span>
                                    </Link>
                                    {user.is_active ? (
                                        <span className="flex shrink-0 items-center text-xs text-green-600">
                                            <CheckCircle className="mr-1 h-3 w-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex shrink-0 items-center text-xs text-red-600">
                                            <Ban className="mr-1 h-3 w-3" /> Banned
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col text-sm">
                                    {user.phone && (
                                        <span className="flex items-center">
                                            <Phone className="mr-1 h-3 w-3 shrink-0 text-muted-foreground" />
                                            {user.phone}
                                        </span>
                                    )}
                                    {user.email && (
                                        <span className="flex items-center text-muted-foreground">
                                            <Mail className="mr-1 h-3 w-3 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {!!user.rating && (
                                        <span className="flex items-center">
                                            <Star className="mr-1 h-3 w-3 text-yellow-500" />
                                            {user.rating.toFixed(1)}
                                            {!!user.review_count && ` (${user.review_count})`}
                                        </span>
                                    )}
                                    {user.gender && <span className="capitalize">{user.gender}</span>}
                                    {user.provider && <span className="capitalize">{user.provider}</span>}
                                </div>
                                <div className="flex items-center justify-between gap-2 border-t pt-2">
                                    <div className="flex min-w-0 flex-col text-xs text-muted-foreground">
                                        <span title="Регистрация">
                                            рег.{' '}
                                            {user.created_at
                                                ? format(new Date(user.created_at), 'dd.MM.yyyy')
                                                : '—'}
                                        </span>
                                        <span title="Последний онлайн">
                                            онлайн{' '}
                                            {user.last_online_at
                                                ? format(new Date(user.last_online_at), 'dd.MM.yyyy HH:mm')
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 space-x-2">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/admin/trips?user_id=${user.id}`}
                                            title="Поездки пользователя"
                                        >
                                            <Button variant="outline" size="sm">
                                                <Car className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant={user.is_active ? 'destructive' : 'default'}
                                            size="sm"
                                            onClick={() => handleBan(user.id, !user.is_active)}
                                            disabled={banUserMutation.isPending}
                                        >
                                            {user.is_active ? (
                                                <Ban className="h-4 w-4" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="hidden md:block rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Contacts</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead>Last online</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-6">
                                            Ничего не найдено
                                        </TableCell>
                                    </TableRow>
                                )}
                                {users?.items.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="flex flex-col hover:underline"
                                            >
                                                <span className="font-medium">
                                                    {user.full_name || user.name || '—'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    @{user.username}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                {user.phone && (
                                                    <span className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        {user.phone}
                                                    </span>
                                                )}
                                                {user.email && (
                                                    <span className="flex items-center text-muted-foreground">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {user.email}
                                                    </span>
                                                )}
                                                {!user.phone && !user.email && '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{user.gender || '—'}</TableCell>
                                        <TableCell>
                                            {user.rating ? (
                                                <span className="flex items-center">
                                                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                                    {user.rating.toFixed(1)}
                                                    {!!user.review_count && (
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            ({user.review_count})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="capitalize">{user.provider || '—'}</TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {user.last_online_at ? format(new Date(user.last_online_at), 'dd.MM.yyyy HH:mm') : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <span className="text-green-600 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-red-600 flex items-center">
                                                    <Ban className="h-4 w-4 mr-1" /> Banned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/trips?user_id=${user.id}`} title="Поездки пользователя">
                                                    <Button variant="outline" size="sm">
                                                        <Car className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant={user.is_active ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleBan(user.id, !user.is_active)}
                                                    disabled={banUserMutation.isPending}
                                                >
                                                    {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    </>
                    )}
                    {users && (
                        <Pagination
                            page={users.page}
                            total={users.total}
                            size={users.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
