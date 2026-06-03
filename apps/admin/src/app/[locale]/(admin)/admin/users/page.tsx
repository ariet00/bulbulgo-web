'use client'

import { useAdminBanUser } from '@/hooks/mutations/admin'
import { useDebounce } from '@doska/shared'
import { useState } from 'react'
import { useAdminUsers } from '@/hooks/queries/admin'
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

export default function UsersPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [statusFilter, setStatusFilter] = useState<string>(ALL)
    const [gender, setGender] = useState<string>(ALL)
    const [provider, setProvider] = useState<string>(ALL)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    const { data: users, isLoading, isFetching, refetch } = useAdminUsers(page, size, dq || undefined, {
        is_active:
            statusFilter === ALL ? undefined : statusFilter === 'active',
        gender: gender === ALL ? undefined : gender,
        provider: provider === ALL ? undefined : provider,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
    })
    const banUserMutation = useAdminBanUser()

    const handleBan = (id: number, isActive: boolean) => {
        if (confirm(`Are you sure you want to ${isActive ? 'unban' : 'ban'} this user?`)) {
            banUserMutation.mutate({ id, isActive })
        }
    }

    const resetFilters = () => {
        setQ('')
        setStatusFilter(ALL)
        setGender(ALL)
        setProvider(ALL)
        setDateFrom('')
        setDateTo('')
        setPage(1)
    }

    const hasActiveFilters =
        !!q ||
        statusFilter !== ALL ||
        gender !== ALL ||
        provider !== ALL ||
        !!dateFrom ||
        !!dateTo

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Management</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по имени/телефону/email/id…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => {
                                setStatusFilter(v)
                                setPage(1)
                            }}
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
                            value={gender}
                            onValueChange={(v) => {
                                setGender(v)
                                setPage(1)
                            }}
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
                            value={provider}
                            onValueChange={(v) => {
                                setProvider(v)
                                setPage(1)
                            }}
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
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Регистрация от</span>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">до</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value)
                                    setPage(1)
                                }}
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
                    <div className="rounded-md border overflow-x-auto">
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
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {user.full_name || user.name || '—'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    @{user.username}
                                                </span>
                                            </div>
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
                    )}
                    {users && (
                        <Pagination
                            page={users.page}
                            total={users.total}
                            size={users.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
