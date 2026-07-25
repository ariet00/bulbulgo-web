'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { ArrowLeft, Ban, CheckCircle2 } from 'lucide-react'
import { useAdminDevice } from '@/hooks/queries/admin'
import { useAdminBanDevice } from '@/hooks/mutations/admin'
import type { AdminDeviceSessionItem } from '@/apis/admin'

const STATUS_LABELS: Record<string, string> = {
    active: 'Активно',
    logged_out: 'Разлогинено',
    banned: 'Забанено',
}

function StatusBadge({ status }: { status: string }) {
    const variant =
        status === 'active' ? 'default' : status === 'banned' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{STATUS_LABELS[status] ?? status}</Badge>
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 py-2 border-b last:border-0">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <div className="text-sm break-all">{children}</div>
        </div>
    )
}

export default function DeviceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)

    const { data: device, isLoading } = useAdminDevice(id)
    const banDevice = useAdminBanDevice()

    if (isLoading) return <div className="p-4">Загрузка...</div>
    if (!device)
        return (
            <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Назад
                </Button>
                <div className="text-muted-foreground">Устройство не найдено</div>
            </div>
        )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Назад
                    </Button>
                    <h1 className="text-2xl font-bold">Устройство #{device.id}</h1>
                    <StatusBadge status={device.status} />
                </div>
                <Button
                    variant={device.status === 'banned' ? 'default' : 'destructive'}
                    className="gap-2"
                    disabled={banDevice.isPending}
                    onClick={() => {
                        const ban = device.status !== 'banned'
                        if (confirm(`${ban ? 'Забанить' : 'Разбанить'} это устройство?`)) {
                            banDevice.mutate({ id: device.id, status: ban ? 'banned' : 'active' })
                        }
                    }}
                >
                    {device.status === 'banned' ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" /> Разбанить
                        </>
                    ) : (
                        <>
                            <Ban className="h-4 w-4" /> Забанить
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Основное</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Пользователь">
                            {device.user_id ? (
                                <Link
                                    href={`/admin/users/${device.user_id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {device.user_name || device.user_phone || `#${device.user_id}`}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </InfoRow>
                        <InfoRow label="Device ID">
                            <span className="font-mono text-xs">{device.device_id || '—'}</span>
                        </InfoRow>
                        <InfoRow label="Платформа">
                            <span className="capitalize">{device.device_type}</span>
                        </InfoRow>
                        <InfoRow label="Устройство">{device.device_info || '—'}</InfoRow>
                        <InfoRow label="Версия приложения">{device.app_version || '—'}</InfoRow>
                        <InfoRow label="Создано">
                            {format(new Date(device.created_at), 'dd.MM.yyyy HH:mm')}
                        </InfoRow>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Push и безопасность</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Push permission">
                            {device.push_permission || '—'}
                        </InfoRow>
                        <InfoRow label="FCM токен">
                            {device.token ? (
                                <span className="font-mono text-xs">{device.token}</span>
                            ) : (
                                <span className="text-muted-foreground">нет (пуш отправить некуда)</span>
                            )}
                        </InfoRow>
                        <InfoRow label="Root / Jailbreak">
                            {device.rooted == null ? (
                                '—'
                            ) : device.rooted ? (
                                <Badge variant="destructive">root</Badge>
                            ) : (
                                <span className="text-muted-foreground">нет</span>
                            )}
                        </InfoRow>
                        <InfoRow label="Источник установки">
                            {device.installer_store || '—'}
                        </InfoRow>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Сессии с этого устройства ({device.sessions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Активность</TableHead>
                                    <TableHead>Создано</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {device.sessions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                            Нет сессий
                                        </TableCell>
                                    </TableRow>
                                )}
                                {device.sessions.map((s: AdminDeviceSessionItem) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/users/${s.user_id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                #{s.user_id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{s.ip_address || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                                                {s.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {s.last_used_at
                                                ? format(new Date(s.last_used_at), 'dd.MM.yyyy HH:mm')
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {format(new Date(s.created_at), 'dd.MM.yyyy HH:mm')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Сырые данные (data JSONB)</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="text-xs bg-muted rounded-md p-4 overflow-x-auto">
                        {JSON.stringify(device.data, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
