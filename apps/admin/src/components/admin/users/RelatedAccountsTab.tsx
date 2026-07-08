'use client'

import { useState } from 'react'
import { Link } from '@doska/i18n'
import { useAdminUserRelatedAccounts } from '@/hooks/queries/admin'
import { useAdminBanUser } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Ban, CheckCircle2, RefreshCw } from 'lucide-react'

const SOURCE_LABELS: Record<string, string> = {
    events: 'события',
    sessions: 'сессии',
    push_tokens: 'push',
}

function fmtDate(v?: string | null): string {
    return v ? new Date(v).toLocaleString() : '—'
}

type RelatedAccount = {
    user_id: number
    name: string | null
    phone: string | null
    is_active: boolean
    registered_at: string | null
    shared_devices: string[]
    first_seen: string | null
    last_seen: string | null
    events: number
}

export function RelatedAccountsTab({ userId }: { userId: number }) {
    const { data, isLoading, isFetching, refetch } = useAdminUserRelatedAccounts(userId)
    const banUser = useAdminBanUser()
    const [banTarget, setBanTarget] = useState<RelatedAccount | null>(null)

    const devices = data?.devices ?? []
    const related = data?.related ?? []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Обновить
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Устройства{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({devices.length}) — за всё время
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : devices.length === 0 ? (
                        <div className="text-muted-foreground">Устройства не найдены</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>device_id</TableHead>
                                    <TableHead className="w-32">Источники</TableHead>
                                    <TableHead className="w-28">Платформы</TableHead>
                                    <TableHead className="w-24 text-right">Событий</TableHead>
                                    <TableHead className="w-44">Первый раз</TableHead>
                                    <TableHead className="w-44">Последний раз</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.map((d) => (
                                    <TableRow key={d.device_id}>
                                        <TableCell className="font-mono text-xs break-all">
                                            {d.device_id}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {d.sources.map((s) => SOURCE_LABELS[s] ?? s).join(', ')}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {d.platforms.length ? d.platforms.join(', ') : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {d.events.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                            {fmtDate(d.first_seen)}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                            {fmtDate(d.last_seen)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Связанные аккаунты{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({related.length}) — те же device_id
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : related.length === 0 ? (
                        <div className="text-muted-foreground">
                            Другие аккаунты на устройствах пользователя не замечены
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead className="w-36">Телефон</TableHead>
                                    <TableHead className="w-28">Статус</TableHead>
                                    <TableHead>Общие устройства</TableHead>
                                    <TableHead className="w-24 text-right">Событий</TableHead>
                                    <TableHead className="w-44">Последний раз</TableHead>
                                    <TableHead className="w-32" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {related.map((r) => (
                                    <TableRow key={r.user_id}>
                                        <TableCell>
                                            <Link
                                                href={`/admin/users/${r.user_id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {r.name || `#${r.user_id}`}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">
                                                рег. {fmtDate(r.registered_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {r.phone ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {r.is_active ? (
                                                <span className="inline-block rounded bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                    Активен
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                    Забанен
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs break-all">
                                            {r.shared_devices.join(', ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {r.events.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                            {fmtDate(r.last_seen)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant={r.is_active ? 'destructive' : 'outline'}
                                                size="sm"
                                                onClick={() => setBanTarget(r)}
                                                disabled={banUser.isPending}
                                            >
                                                {r.is_active ? (
                                                    <>
                                                        <Ban className="mr-1 h-4 w-4" /> Забанить
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="mr-1 h-4 w-4" />{' '}
                                                        Разбанить
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {banTarget?.is_active ? 'Забанить' : 'Разбанить'}{' '}
                            {banTarget?.name || `#${banTarget?.user_id}`}?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Аккаунт связан с текущим пользователем через устройства:{' '}
                        <span className="font-mono">{banTarget?.shared_devices.join(', ')}</span>
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanTarget(null)}>
                            Отмена
                        </Button>
                        <Button
                            variant={banTarget?.is_active ? 'destructive' : 'default'}
                            disabled={banUser.isPending}
                            onClick={() => {
                                if (!banTarget) return
                                banUser.mutate(
                                    { id: banTarget.user_id, isActive: !banTarget.is_active },
                                    {
                                        onSuccess: () => {
                                            setBanTarget(null)
                                            refetch()
                                        },
                                    },
                                )
                            }}
                        >
                            {banTarget?.is_active ? 'Забанить' : 'Разбанить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
