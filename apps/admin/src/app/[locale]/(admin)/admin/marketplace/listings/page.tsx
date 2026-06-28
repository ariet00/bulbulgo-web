'use client'

import { useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { ClipboardList } from 'lucide-react'
import type { LabelMap, McCategoryNode, McListing } from '@/apis/marketplace'
import { LISTING_STATUSES } from '@/apis/marketplace'
import { useMpCategories, useMpListings } from '@/hooks/queries/marketplace'
import { useMpSetListingStatus } from '@/hooks/mutations/marketplace'
import { pickLabel } from '@/components/admin/marketplace/shared'

const ALL = 'all'

function flatten(nodes: McCategoryNode[], acc: Map<number, McCategoryNode>) {
    for (const n of nodes) {
        acc.set(n.id, n)
        flatten(n.children ?? [], acc)
    }
    return acc
}

function listingTitle(t: McListing['title']): string {
    if (!t) return '—'
    if (typeof t === 'string') return t
    return pickLabel(t as LabelMap, '—')
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    active: 'default',
    moderation: 'outline',
    draft: 'secondary',
    sold: 'secondary',
    archived: 'destructive',
}

export default function MarketplaceListingsPage() {
    const [status, setStatus] = useState<string>(ALL)
    const [kind, setKind] = useState<string>(ALL)
    const { data: tree } = useMpCategories(true)
    const { data: page, isLoading } = useMpListings({
        status: status === ALL ? undefined : status,
        kind: kind === ALL ? undefined : kind,
        limit: 100,
    })
    const setListingStatus = useMpSetListingStatus()

    const byId = useMemo(() => flatten(tree ?? [], new Map()), [tree])

    return (
        <div className="space-y-4 p-4">
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" /> Объявления
                        {page && <span className="text-sm text-muted-foreground">· {page.total}</span>}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={kind} onValueChange={setKind}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все стороны</SelectItem>
                                <SelectItem value="offer">offer</SelectItem>
                                <SelectItem value="want">want</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {LISTING_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Заголовок</TableHead>
                                    <TableHead>Категория</TableHead>
                                    <TableHead>Сторона</TableHead>
                                    <TableHead>Цена</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="w-40">Сменить статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(page?.items ?? []).map((l) => {
                                    const cat = byId.get(l.category_id)
                                    return (
                                        <TableRow key={l.id}>
                                            <TableCell className="text-xs text-muted-foreground">{l.id}</TableCell>
                                            <TableCell className="font-medium">{listingTitle(l.title)}</TableCell>
                                            <TableCell className="text-sm">
                                                {cat ? pickLabel(cat.label, cat.slug) : `#${l.category_id}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{l.kind}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {l.price != null
                                                    ? `${l.price.toLocaleString('ru-RU')} ${l.currency_code ?? ''}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_VARIANT[l.status] ?? 'secondary'}>
                                                    {l.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={l.status}
                                                    onValueChange={(v) =>
                                                        setListingStatus.mutate({ id: l.id, status: v })
                                                    }
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LISTING_STATUSES.map((s) => (
                                                            <SelectItem key={s} value={s}>
                                                                {s}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {(page?.items ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Нет объявлений
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
