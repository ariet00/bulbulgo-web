'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminUserDevices, useAdminUserSessions } from '@/hooks/queries/admin'

function DeviceStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        active: { label: 'активен', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        logged_out: { label: 'вышел', cls: 'bg-muted text-muted-foreground' },
        banned: { label: 'забанен', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    }
    const { label, cls } = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
    return (
        <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    )
}

function RootBadge({ rooted }: { rooted?: boolean | null }) {
    if (!rooted) return null
    return (
        <span
            className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
            title="Root/jailbreak: устройство способно подменять идентификаторы"
        >
            root
        </span>
    )
}

function DeviceTypeBadge({ type }: { type: string }) {
    const cls: Record<string, string> = {
        ios: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
        android: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        web: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
    return (
        <span
            className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                cls[type] ?? 'bg-muted text-muted-foreground'
            }`}
        >
            {type}
        </span>
    )
}

export function DevicesTab({ uid }: { uid: number }) {
    const sessions = useAdminUserSessions(uid)
    const devices = useAdminUserDevices(uid)

    return (
                    <div className="grid gap-3 lg:grid-cols-2">
                        <Card className="min-w-0">
                            <CardHeader>
                                <CardTitle>
                                    Сессии{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({sessions.data?.length ?? 0}) — независимо от периода
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sessions.isLoading ? (
                                    <div>Загрузка…</div>
                                ) : !sessions.data || sessions.data.length === 0 ? (
                                    <div className="text-muted-foreground">Нет сессий</div>
                                ) : (
                                    <>
                                        {/* Mobile: cards */}
                                        <ul className="space-y-2 md:hidden">
                                            {sessions.data.map(s => (
                                                <li key={s.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                                                s.status === 'active'
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    s.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground/40'
                                                                }`}
                                                            />
                                                            {s.status === 'active' ? 'активна' : 'завершена'}
                                                        </span>
                                                        {s.app_version && (
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                v{s.app_version}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5 text-sm font-medium text-foreground">
                                                        {s.device_info ?? '—'}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-muted-foreground">
                                                        {s.ip_address && <span>{s.ip_address}</span>}
                                                        {s.device_id && <span className="break-all">{s.device_id}</span>}
                                                    </div>
                                                    <div className="mt-1.5 text-xs text-muted-foreground">
                                                        {s.last_used_at
                                                            ? `Активность: ${new Date(s.last_used_at).toLocaleString()}`
                                                            : `Создана: ${new Date(s.created_at).toLocaleString()}`}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Desktop: table */}
                                        <div className="hidden md:block">
                                            <Table className="min-w-[760px]">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-24">Статус</TableHead>
                                                        <TableHead>device_id</TableHead>
                                                        <TableHead className="w-28">Версия</TableHead>
                                                        <TableHead>Устройство</TableHead>
                                                        <TableHead className="w-32">IP</TableHead>
                                                        <TableHead className="w-40">Последняя активность</TableHead>
                                                        <TableHead className="w-40">Создана</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sessions.data.map(s => (
                                                        <TableRow key={s.id}>
                                                            <TableCell>
                                                                <span
                                                                    className={
                                                                        s.status === 'active'
                                                                            ? 'text-xs font-medium text-green-600 dark:text-green-400'
                                                                            : 'text-xs text-muted-foreground'
                                                                    }
                                                                >
                                                                    {s.status === 'active' ? 'активна' : 'завершена'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs break-all">
                                                                {s.device_id ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {s.app_version ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {s.device_info ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {s.ip_address ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {s.last_used_at
                                                                    ? new Date(s.last_used_at).toLocaleString()
                                                                    : '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {new Date(s.created_at).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="min-w-0">
                            <CardHeader>
                                <CardTitle>
                                    Push-девайсы{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({devices.data?.length ?? 0}) — независимо от периода
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {devices.isLoading ? (
                                    <div>Загрузка…</div>
                                ) : !devices.data || devices.data.length === 0 ? (
                                    <div className="text-muted-foreground">Нет зарегистрированных девайсов</div>
                                ) : (
                                    <>
                                        {/* Mobile: cards */}
                                        <ul className="space-y-2 md:hidden">
                                            {devices.data.map(d => (
                                                <li key={d.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="flex items-center gap-1.5">
                                                            <DeviceTypeBadge type={d.device_type} />
                                                            <DeviceStatusBadge status={d.status} />
                                                            <RootBadge rooted={d.rooted} />
                                                        </span>
                                                        {d.app_version && (
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                v{d.app_version}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5 text-sm font-medium text-foreground">
                                                        {d.device_info ?? '—'}
                                                    </div>
                                                    {d.device_id && (
                                                        <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                                                            {d.device_id}
                                                        </div>
                                                    )}
                                                    <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                        <span className="truncate font-mono" title={d.token ?? undefined}>
                                                            {d.token ? `${d.token.slice(0, 16)}…` : 'без токена'}
                                                        </span>
                                                        <span className="whitespace-nowrap">
                                                            {new Date(d.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Desktop: table */}
                                        <div className="hidden md:block">
                                            <Table className="min-w-[640px]">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-24">Тип</TableHead>
                                                        <TableHead className="w-24">Статус</TableHead>
                                                        <TableHead>device_id</TableHead>
                                                        <TableHead className="w-28">Версия</TableHead>
                                                        <TableHead>Устройство</TableHead>
                                                        <TableHead className="w-44">Токен</TableHead>
                                                        <TableHead className="w-40">Зарегистрирован</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {devices.data.map(d => (
                                                        <TableRow key={d.id}>
                                                            <TableCell>
                                                                <DeviceTypeBadge type={d.device_type} />
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="flex items-center gap-1">
                                                                    <DeviceStatusBadge status={d.status} />
                                                                    <RootBadge rooted={d.rooted} />
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs break-all">
                                                                {d.device_id ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {d.app_version ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {d.device_info ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-muted-foreground truncate" title={d.token ?? undefined}>
                                                                {d.token ? `${d.token.slice(0, 12)}…` : '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {new Date(d.created_at).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
    )
}
