'use client'

import { useAdminBlockedAuthors } from '@/hooks/queries/admin'
import { useAdminUnblockAuthor } from '@/hooks/mutations/admin'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    BackButton,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Skeleton,
} from '@doska/ui'
import { Ban, ShieldOff, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { Link } from '@doska/i18n'
import { format } from 'date-fns'

function fmtDate(v?: string | null) {
    if (!v) return '—'
    try {
        return format(new Date(v), 'dd MMM yyyy, HH:mm')
    } catch {
        return String(v)
    }
}

export default function BlockedAuthorsPage() {
    const { data: authors, isLoading, isFetching, refetch } = useAdminBlockedAuthors()
    const unblockAuthor = useAdminUnblockAuthor()
    const rows = authors ?? []

    return (
        <div className="space-y-6">
            <BackButton />
            <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <Ban className="h-6 w-6 text-rose-500" />
                    Заблокированные ТГ аккаунты
                </h1>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Автор из этого списка полностью пропускается парсером
                    </CardTitle>
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
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="py-12 text-center text-sm italic text-muted-foreground">
                            Заблокированных авторов нет
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Имя</TableHead>
                                    <TableHead>Заблокировал</TableHead>
                                    <TableHead>Когда</TableHead>
                                    <TableHead>Поездка</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((a) => (
                                    <TableRow key={a.author_id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {a.author_id}
                                        </TableCell>
                                        <TableCell>
                                            {a.username ? `@${a.username}` : '—'}
                                        </TableCell>
                                        <TableCell>{a.name || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {a.blocked_by || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                            {fmtDate(a.blocked_at)}
                                        </TableCell>
                                        <TableCell>
                                            {a.trip_id ? (
                                                <Link href={`/admin/trips/${a.trip_id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1.5 text-muted-foreground"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />#
                                                        {a.trip_id}
                                                    </Button>
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                disabled={
                                                    unblockAuthor.isPending &&
                                                    unblockAuthor.variables === a.author_id
                                                }
                                                onClick={() =>
                                                    unblockAuthor.mutate(a.author_id)
                                                }
                                            >
                                                {unblockAuthor.isPending &&
                                                unblockAuthor.variables === a.author_id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ShieldOff className="h-4 w-4" />
                                                )}
                                                Разблокировать
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
