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
import { Link } from '@doska/i18n'
import { useAdminRideshareTopActiveUsers } from '@/hooks/queries/admin'
import {
    AsyncBlock,
    LIST_SIZE,
    PeriodPicker,
    UserAvatar,
    UserInlineLink,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

export function TopActiveUsersCard({ period, resetNonce }: TabSectionProps) {
    const [cardP, setCardP, overridden] = useCardPeriod(period, resetNonce)
    const query = useAdminRideshareTopActiveUsers(cardP, LIST_SIZE)
    const users = query.data?.users ?? []

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>Топ активных пользователей ({cardP})</CardTitle>
                <PeriodPicker value={cardP} onChange={setCardP} overridden={overridden} />
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={users.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Телефон</TableHead>
                                    <TableHead className="w-32 text-right font-semibold">
                                        Событий
                                    </TableHead>
                                    <TableHead
                                        className="w-28 text-right"
                                        title="Дней с хотя бы одним событием в периоде"
                                    >
                                        Активных дней
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u, i) => (
                                    <TableRow key={u.user_id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <UserInlineLink
                                                userId={u.user_id}
                                                name={u.name}
                                                avatarUrl={u.avatar_url}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {u.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-semibold">
                                            {u.events.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                            {u.active_days}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {users.map((u, i) => (
                            <div
                                key={u.user_id}
                                className="flex items-start justify-between gap-3 rounded-lg border p-3"
                            >
                                <div className="flex min-w-0 items-start gap-2">
                                    <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <Link
                                            href={`/admin/users/${u.user_id}`}
                                            className="flex items-center gap-2 hover:underline"
                                        >
                                            <UserAvatar url={u.avatar_url} name={u.name} />
                                            <span className="truncate text-sm font-medium">
                                                {u.name ?? `user #${u.user_id}`}
                                            </span>
                                        </Link>
                                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                            #{u.user_id} · {u.phone ?? '—'}
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {u.events.toLocaleString()}
                                    </div>
                                    <div className="text-[11px] tabular-nums text-muted-foreground">
                                        событий · {u.active_days} дн.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}

