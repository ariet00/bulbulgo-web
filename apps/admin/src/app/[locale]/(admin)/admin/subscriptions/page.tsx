'use client'

import { useEffect, useState } from 'react'
import { useAdminTripSubscriptions } from '@/hooks/queries/admin'
import {
    useAdminSetTripSubscriptionActive,
    useAdminDeleteTripSubscription,
} from '@/hooks/mutations/admin'
import { useDebounce } from '@doska/shared'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import { Trash2, MapPin, User, Phone, X, RefreshCw, ArrowRight, Banknote, Settings2 } from 'lucide-react'
import { Link } from '@doska/i18n'
import { format } from 'date-fns'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'
import type { AdminTripSubscription } from '@/apis/admin'

const ALL = '__all__'
const TRIP_TYPES = ['rideshare', 'taxi', 'shuttle', 'freight', 'delivery']
const SEARCH_ROLES = ['driver', 'passenger', 'parcel']

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    trip_type: ALL,
    search_role: ALL,
    is_active: ALL,
    user_id: 0,
    include_deleted: 0,
}

const ROLE_LABELS: Record<string, string> = {
    driver: 'ищет водителя',
    passenger: 'ищет пассажира',
    parcel: 'ищет посылку',
}

type SubStatus = { label: string; cls: string }

function subStatus(s: AdminTripSubscription): SubStatus {
    if (s.is_deleted) return { label: 'удалена', cls: 'bg-gray-200 text-gray-600' }
    if (!s.is_active) return { label: 'выключена', cls: 'bg-yellow-100 text-yellow-800' }
    if (s.expire_at && new Date(s.expire_at).getTime() < Date.now())
        return { label: 'истекла', cls: 'bg-red-100 text-red-800' }
    return { label: 'активна', cls: 'bg-green-100 text-green-800' }
}

export default function AdminSubscriptionsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminTripSubscriptions(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            trip_type: values.trip_type === ALL ? undefined : values.trip_type,
            search_role: values.search_role === ALL ? undefined : values.search_role,
            user_id: values.user_id || undefined,
            is_active:
                values.is_active === ALL ? undefined : values.is_active === 'true',
            include_deleted: values.include_deleted ? true : undefined,
        },
    )

    const setActive = useAdminSetTripSubscriptionActive()
    const deleteSub = useAdminDeleteTripSubscription()

    const handleDelete = (id: number) => {
        if (confirm(`Удалить подписку #${id}?`)) deleteSub.mutate(id)
    }

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q ||
        values.trip_type !== ALL ||
        values.search_role !== ALL ||
        values.is_active !== ALL ||
        !!values.user_id ||
        !!values.include_deleted

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Подписки</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Подписки на поиск поездок</CardTitle>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/settings?tab=subscriptions">
                            <Button variant="outline" size="sm">
                                <Settings2 className="h-4 w-4 mr-1" />
                                Настройки
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                            Обновить
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="w-full sm:w-64">
                            <UserCombobox
                                value={values.user_id || null}
                                onChange={(id) => setValues({ user_id: id ?? 0 })}
                                placeholder="Все пользователи"
                                allowClear
                            />
                        </div>
                        <Input
                            placeholder="Поиск по имени/телефону/id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.trip_type}
                            onValueChange={(v) => setValues({ trip_type: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все типы</SelectItem>
                                {TRIP_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.search_role}
                            onValueChange={(v) => setValues({ search_role: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Кого ищет" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Любая роль</SelectItem>
                                {SEARCH_ROLES.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {ROLE_LABELS[r] ?? r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.is_active}
                            onValueChange={(v) => setValues({ is_active: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Активность" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все</SelectItem>
                                <SelectItem value="true">Включена</SelectItem>
                                <SelectItem value="false">Выключена</SelectItem>
                            </SelectContent>
                        </Select>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Switch
                                checked={!!values.include_deleted}
                                onCheckedChange={(c) => setValues({ include_deleted: c ? 1 : 0 })}
                            />
                            Показывать удалённые
                        </label>
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
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead>Маршрут</TableHead>
                                        <TableHead>Тип / роль</TableHead>
                                        <TableHead>Макс. цена</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Истекает</TableHead>
                                        <TableHead>Создана</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((s) => {
                                        const st = subStatus(s)
                                        return (
                                            <TableRow key={s.id} className={s.is_deleted ? 'opacity-60' : ''}>
                                                <TableCell className="tabular-nums">{s.id}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/users/${s.user_id}`}
                                                        className="flex flex-col text-sm hover:underline"
                                                    >
                                                        <span className="flex items-center text-blue-600">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {s.user_name || `#${s.user_id}`}
                                                        </span>
                                                        {s.user_phone && (
                                                            <span className="flex items-center text-muted-foreground">
                                                                <Phone className="h-3 w-3 mr-1" />
                                                                {s.user_phone}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <MapPin className="h-3 w-3 text-blue-500" />
                                                        {s.from_name || `#${s.from_location_id}`}
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                        <MapPin className="h-3 w-3 text-green-500" />
                                                        {s.to_name || `#${s.to_location_id}`}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="capitalize">{s.trip_type || '—'}</span>
                                                        <span className="text-muted-foreground">
                                                            {ROLE_LABELS[s.search_role] ?? s.search_role}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {s.max_price != null ? (
                                                        <span className="flex items-center gap-1">
                                                            <Banknote className="h-3 w-3 text-muted-foreground" />
                                                            {s.max_price.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${st.cls}`}>
                                                        {st.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    {s.expire_at
                                                        ? format(new Date(s.expire_at), 'dd.MM.yyyy HH:mm')
                                                        : 'бессрочно'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    {format(new Date(s.created_at), 'dd.MM.yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-3">
                                                        {!s.is_deleted && (
                                                            <Switch
                                                                checked={s.is_active}
                                                                disabled={setActive.isPending}
                                                                onCheckedChange={(c) =>
                                                                    setActive.mutate({ id: s.id, isActive: c })
                                                                }
                                                                title={s.is_active ? 'Выключить' : 'Включить'}
                                                            />
                                                        )}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(s.id)}
                                                            disabled={deleteSub.isPending || s.is_deleted}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
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
