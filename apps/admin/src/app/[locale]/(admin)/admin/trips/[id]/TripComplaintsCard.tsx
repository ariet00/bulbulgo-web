'use client'

import { Link } from '@doska/i18n'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Skeleton,
} from '@doska/ui'
import { Flag, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { useAdminComplaints } from '@/hooks/queries/admin/complaints'
import { StatusBadge } from '../../complaints/helpers'

function fmtDate(v?: string | null) {
    if (!v) return '—'
    try {
        return format(new Date(v), 'dd MMM yyyy, HH:mm')
    } catch {
        return String(v)
    }
}

export function TripComplaintsCard({ tripId }: { tripId: number }) {
    const { data, isLoading } = useAdminComplaints(1, 20, {
        target_type: 'trip',
        target_id: tripId,
    })
    const complaints = data?.items ?? []
    const openCount = complaints.filter((c) => c.status === 'open').length

    return (
        <Card className="overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border bg-muted/40 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Flag className="h-[18px] w-[18px] text-muted-foreground" />
                    Жалобы на поездку
                </CardTitle>
                <div className="flex items-center gap-3">
                    {data && (
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {data.total} всего
                            {openCount > 0 && ` · ${openCount} откр.`}
                        </span>
                    )}
                    {!!complaints.length && (
                        <Link
                            href={`/admin/complaints?target_type=trip&target_id=${tripId}`}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-muted-foreground"
                            >
                                <ExternalLink className="h-4 w-4" /> Все жалобы
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : complaints.length === 0 ? (
                    <p className="py-6 text-center text-sm italic text-muted-foreground">
                        На поездку никто не жаловался
                    </p>
                ) : (
                    <div className="divide-y divide-border">
                        {complaints.map((c) => {
                            const reporter = c.reporter
                            const reporterName =
                                reporter?.full_name ||
                                reporter?.name ||
                                (c.reporter_id ? `user #${c.reporter_id}` : 'Аноним')
                            const header = (
                                <div className="flex items-start gap-3 py-3">
                                    <Avatar className="h-10 w-10 ring-1 ring-border">
                                        <AvatarImage
                                            src={reporter?.avatar_url || undefined}
                                        />
                                        <AvatarFallback className="bg-zinc-900 text-xs text-white">
                                            {reporterName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {reporterName}
                                            </span>
                                            <StatusBadge status={c.status} />
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {fmtDate(c.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            {c.reason || '—'}
                                        </p>
                                        {c.description && (
                                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                                {c.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                            return c.reporter_id ? (
                                <Link
                                    key={c.id}
                                    href={`/admin/users/${c.reporter_id}`}
                                    className="block rounded-lg transition-colors hover:bg-muted/40"
                                >
                                    {header}
                                </Link>
                            ) : (
                                <div key={c.id}>{header}</div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
