'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link } from '@doska/i18n'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import type { AdminErrorGroup, AdminErrorUser } from '@/apis/admin'

export const ERROR_CLASSES: Array<{ value: string; label: string }> = [
    { value: '', label: 'Все' },
    { value: '5xx', label: '5xx' },
    { value: '4xx', label: '4xx' },
]

export function ErrorStatusBadge({ status }: { status: string | null }) {
    const code = Number(status)
    const cls =
        !status || Number.isNaN(code)
            ? 'bg-muted text-muted-foreground'
            : code >= 500
            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
            : code === 422
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
    return (
        <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold font-mono ${cls}`}>
            {status ?? '—'}
        </span>
    )
}

const SERIES = [
    { key: 'server', label: '5xx', color: '#dc2626' },
    { key: 'client', label: '4xx', color: '#f97316' },
    { key: 'validation', label: '422', color: '#f59e0b' },
] as const

export function ErrorsTimeseriesChart({
    data,
    granularity = 'day',
}: {
    data: Array<{ bucket: string; server: number; client: number; validation: number; total: number }>
    granularity?: 'hour' | 'day' | 'week' | 'month'
}) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const dark = mounted && resolvedTheme === 'dark'
    const grid = dark ? '#27272a' : '#e5e7eb'
    const axis = dark ? '#a1a1aa' : '#52525b'

    const series = data.map(d => ({
        ...d,
        label:
            granularity === 'hour'
                ? new Date(d.bucket).toLocaleString(undefined, { day: 'numeric', hour: '2-digit' })
                : new Date(d.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }))

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" fontSize={12} stroke={axis} tick={{ fill: axis }} />
                <YAxis allowDecimals={false} fontSize={12} stroke={axis} tick={{ fill: axis }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: dark ? '#18181b' : '#ffffff',
                        border: `1px solid ${dark ? '#3f3f46' : '#e5e7eb'}`,
                        borderRadius: 6,
                        color: dark ? '#fafafa' : '#18181b',
                    }}
                />
                <Legend wrapperStyle={{ color: axis }} />
                {SERIES.map(s => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} stackId="errors" fill={s.color} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}

export function ErrorSignaturesTable({
    data,
    onSelect,
    selected,
}: {
    data: AdminErrorGroup[]
    onSelect?: (row: AdminErrorGroup) => void
    selected?: AdminErrorGroup | null
}) {
    const isSelected = (r: AdminErrorGroup) =>
        selected &&
        selected.kind === r.kind &&
        selected.status === r.status &&
        selected.error_type === r.error_type &&
        selected.error_code === r.error_code
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-20">Статус</TableHead>
                    <TableHead>Ошибка</TableHead>
                    <TableHead>Эндпоинт</TableHead>
                    <TableHead className="w-20 text-right">Кол-во</TableHead>
                    <TableHead className="w-20 text-right">Юзеров</TableHead>
                    <TableHead className="w-32 text-right">Первая</TableHead>
                    <TableHead className="w-32 text-right">Последняя</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow
                        key={i}
                        onClick={onSelect ? () => onSelect(row) : undefined}
                        className={`${onSelect ? 'cursor-pointer' : ''} ${
                            isSelected(row) ? 'bg-muted' : ''
                        }`}
                    >
                        <TableCell>
                            <ErrorStatusBadge status={row.status} />
                        </TableCell>
                        <TableCell>
                            <div className="font-mono text-sm">
                                {row.error_type ?? '—'}
                                {row.error_code ? ` · ${row.error_code}` : ''}
                            </div>
                            {row.sample_message && (
                                <div className="text-xs text-muted-foreground truncate max-w-md">
                                    {row.sample_message}
                                </div>
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="font-mono text-xs truncate max-w-[18rem]">
                                {row.sample_path ?? '—'}
                            </div>
                            {row.paths > 1 && (
                                <div className="text-xs text-muted-foreground">+{row.paths - 1} др.</div>
                            )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{row.count}</TableCell>
                        <TableCell className="text-right">{row.users}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(row.first_seen).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(row.last_seen).toLocaleString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function ErrorUsersTable({ data }: { data: AdminErrorUser[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead className="w-24 text-right">Ошибок</TableHead>
                    <TableHead className="w-36 text-right">Последняя</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(u => (
                    <TableRow key={u.user_id}>
                        <TableCell>
                            <Link
                                href={`/admin/analytics/users/${u.user_id}`}
                                className="flex items-center gap-2 hover:underline"
                            >
                                {u.avatar_url ? (
                                    <img
                                        src={u.avatar_url}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs">
                                        {(u.name ?? '?').slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <span>{u.name ?? `user #${u.user_id}`}</span>
                            </Link>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{u.count}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(u.last_seen).toLocaleString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
