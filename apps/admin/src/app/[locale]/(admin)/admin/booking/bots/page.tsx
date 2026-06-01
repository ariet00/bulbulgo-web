'use client'

import { useAdminBookingBots } from '@/hooks/queries/admin'
import {
    Badge,
    Button,
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
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminBookingBotsPage() {
    const router = useRouter()
    const [onlyUnlinked, setOnlyUnlinked] = useState(false)
    const { data: bots, isLoading } = useAdminBookingBots(onlyUnlinked)

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Боты</h1>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={onlyUnlinked ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOnlyUnlinked((v) => !v)}
                    >
                        Только непривязанные
                    </Button>
                    <Link href="/admin/booking/bots/new">
                        <Button size="sm">
                            <Plus className="size-4 mr-1" /> Создать бот
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && !bots ? (
                        <div>Loading...</div>
                    ) : (bots?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">Ботов нет.</p>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Бот</TableHead>
                                    <TableHead>Компания</TableHead>
                                    <TableHead>Владелец</TableHead>
                                    <TableHead>Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(bots ?? []).map((b) => (
                                    <TableRow
                                        key={b.bot_id}
                                        className="cursor-pointer hover:bg-muted/40"
                                        onClick={() => router.push(`/admin/booking/bots/${b.bot_id}`)}
                                    >
                                        <TableCell>
                                            <div className="font-mono text-sm">{b.bot_slug}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {b.bot_name ?? '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {b.company_id ? (
                                                <div
                                                    className="space-y-0.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Link
                                                        href={`/admin/companies/${b.company_id}`}
                                                        className="text-primary text-sm font-medium hover:underline"
                                                    >
                                                        {b.company_name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {b.company_slug} • #{b.company_id}
                                                    </div>
                                                    <div className="flex gap-1 pt-0.5">
                                                        {b.company_type && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {b.company_type}
                                                            </Badge>
                                                        )}
                                                        {b.company_status && (
                                                            <Badge
                                                                variant={
                                                                    b.company_status === 'active'
                                                                        ? 'default'
                                                                        : b.company_status === 'moderation'
                                                                          ? 'outline'
                                                                          : 'destructive'
                                                                }
                                                                className="text-[10px]"
                                                            >
                                                                {b.company_status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge variant="secondary">не привязан</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {b.owner_id ? (
                                                <div
                                                    className="space-y-0.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Link
                                                        href={`/admin/users/${b.owner_id}`}
                                                        className="text-primary text-sm font-medium hover:underline"
                                                    >
                                                        {b.owner_name ||
                                                            b.owner_username ||
                                                            `#${b.owner_id}`}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {b.owner_username ? `@${b.owner_username}` : ''}
                                                        {b.owner_username && b.owner_phone ? ' • ' : ''}
                                                        {b.owner_phone ?? ''}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        id={b.owner_id}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{b.is_active ? '✅' : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
