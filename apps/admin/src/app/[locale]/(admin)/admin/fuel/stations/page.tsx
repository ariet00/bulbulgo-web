'use client'

// Справочник АЗС (только просмотр): сид из OSM + ручные записи. CRUD появится,
// когда сидер переключим на Ownership.OPERATOR (иначе правки затрёт ре-сид).

import { useEffect, useState } from 'react'
import { useAdminFuelStations } from '@/hooks/queries/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useDebounce } from '@doska/shared'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
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
import { MapPin, RefreshCw, X } from 'lucide-react'
import { FUEL_TYPE_LABELS } from '../helpers'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 50,
    q: '',
    enabled: ALL,
}

export default function FuelStationsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq, page: 1 })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminFuelStations(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            enabled: values.enabled === ALL ? undefined : values.enabled === 'true',
        },
    )

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">АЗС</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Справочник заправок{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            {data ? `(${data.total})` : ''}
                        </span>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Input
                            className="w-64"
                            placeholder="Поиск: название, бренд, адрес"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />
                        <Select
                            value={values.enabled}
                            onValueChange={(v) => setValues({ enabled: v, page: 1 })}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все</SelectItem>
                                <SelectItem value="true">Включены</SelectItem>
                                <SelectItem value="false">Выключены</SelectItem>
                            </SelectContent>
                        </Select>
                        {(values.q || values.enabled !== ALL) && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="mr-1 h-4 w-4" />
                                Сбросить
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Бренд</TableHead>
                                <TableHead>Адрес</TableHead>
                                <TableHead>Марки</TableHead>
                                <TableHead>Источник</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Карта</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                        Загрузка…
                                    </TableCell>
                                </TableRow>
                            ) : !data?.items.length ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                        Ничего не найдено
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="text-muted-foreground">{s.id}</TableCell>
                                        <TableCell className="max-w-52">
                                            <div className="truncate font-medium">{s.name || '—'}</div>
                                        </TableCell>
                                        <TableCell className="max-w-40 truncate">{s.brand ?? '—'}</TableCell>
                                        <TableCell className="max-w-64 truncate text-muted-foreground">
                                            {s.address ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {s.fuel_types.length
                                                ? s.fuel_types
                                                      .map((t) => FUEL_TYPE_LABELS[t] ?? t)
                                                      .join(', ')
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                                                {s.source}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    s.enabled
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                {s.enabled ? 'Вкл' : 'Выкл'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                                                href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=17/${s.lat}/${s.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <MapPin className="h-3.5 w-3.5" />
                                                OSM
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {data && data.total > values.size && (
                        <div className="mt-4">
                            <Pagination
                                page={values.page}
                                total={data.total}
                                size={values.size}
                                onPageChange={(p) => setValues({ page: p })}
                                onSizeChange={(s) => setValues({ size: s, page: 1 })}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
