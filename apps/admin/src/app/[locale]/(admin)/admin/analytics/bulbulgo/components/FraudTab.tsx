'use client'

import { useState } from 'react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw } from 'lucide-react'
import {
    useAdminRideshareMultiAccountDevices,
    useAdminRideshareMultiAccountIps,
} from '@/hooks/queries/admin'
import { AsyncBlock, LIST_SIZE } from './shared'

const MULTI_PERIODS = ['7d', '30d', '90d']

// Devices and IPs share one shape — only the identifying key differs.
type MultiAccountRow = {
    id: string
    account_count: number
    events: number
    last_seen: string
    accounts: Array<{
        user_id: number
        name: string | null
        phone: string | null
        events: number
    }>
}

export function FraudTab() {
    const [devicePeriod, setDevicePeriod] = useState('30d')
    const [devicePage, setDevicePage] = useState(1)
    const devices = useAdminRideshareMultiAccountDevices(devicePeriod, devicePage, LIST_SIZE)

    const [ipPeriod, setIpPeriod] = useState('30d')
    const [ipPage, setIpPage] = useState(1)
    const ips = useAdminRideshareMultiAccountIps(ipPeriod, ipPage, LIST_SIZE)

    return (
        <>
            <MultiAccountCard
                title="Несколько аккаунтов с одного устройства"
                description="Устройства, с которых за период заходили под 2+ разными аккаунтами (по device_id событий)"
                columnLabel="Устройство"
                rows={(devices.data?.devices ?? []).map(d => ({ ...d, id: d.device_id }))}
                total={devices.data?.total ?? 0}
                isLoading={devices.isLoading}
                isFetching={devices.isFetching}
                onRefetch={() => devices.refetch()}
                period={devicePeriod}
                onPeriodChange={p => {
                    setDevicePeriod(p)
                    setDevicePage(1)
                }}
                page={devicePage}
                onPageChange={setDevicePage}
            />

            <MultiAccountCard
                title="Несколько аккаунтов с одного IP"
                description="IP-адреса, с которых за период заходили под 2+ разными аккаунтами (по ip_address событий)"
                columnLabel="IP"
                rows={(ips.data?.ips ?? []).map(d => ({ ...d, id: d.ip_address }))}
                total={ips.data?.total ?? 0}
                isLoading={ips.isLoading}
                isFetching={ips.isFetching}
                onRefetch={() => ips.refetch()}
                period={ipPeriod}
                onPeriodChange={p => {
                    setIpPeriod(p)
                    setIpPage(1)
                }}
                page={ipPage}
                onPageChange={setIpPage}
            />
        </>
    )
}

function MultiAccountCard({
    title,
    description,
    columnLabel,
    rows,
    total,
    isLoading,
    isFetching,
    onRefetch,
    period,
    onPeriodChange,
    page,
    onPageChange,
}: {
    title: string
    description: string
    columnLabel: string
    rows: MultiAccountRow[]
    total: number
    isLoading: boolean
    isFetching: boolean
    onRefetch: () => void
    period: string
    onPeriodChange: (p: string) => void
    page: number
    onPageChange: (p: number) => void
}) {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle>
                        {title} ({total})
                    </CardTitle>
                    <div className="flex items-center gap-1 flex-wrap">
                        {MULTI_PERIODS.map(p => (
                            <Button
                                key={p}
                                variant={period === p ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => onPeriodChange(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefetch}
                            disabled={isFetching}
                        >
                            <RefreshCw
                                className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                            />
                            Обновить
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={isLoading} empty={rows.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead className="w-40">{columnLabel}</TableHead>
                                    <TableHead className="w-24 text-right">Аккаунтов</TableHead>
                                    <TableHead>Аккаунты</TableHead>
                                    <TableHead className="w-24 text-right">Событий</TableHead>
                                    <TableHead className="w-40">Последняя активность</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((d, i) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="text-muted-foreground tabular-nums align-top">
                                            {(page - 1) * LIST_SIZE + i + 1}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs break-all align-top">
                                            {d.id}
                                        </TableCell>
                                        <TableCell className="text-right align-top">
                                            <AccountCountBadge count={d.account_count} />
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <div className="space-y-1">
                                                {d.accounts.map(a => (
                                                    <AccountLine key={a.user_id} account={a} />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums align-top">
                                            {d.events}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap align-top">
                                            {new Date(d.last_seen).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {rows.map((d, i) => (
                            <div key={d.id} className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * LIST_SIZE + i + 1}
                                        </span>
                                        <span className="min-w-0 break-all font-mono text-xs">
                                            {d.id}
                                        </span>
                                    </div>
                                    <AccountCountBadge count={d.account_count} suffix=" акк." />
                                </div>
                                <div className="space-y-1 border-t pt-2">
                                    {d.accounts.map(a => (
                                        <AccountLine key={a.user_id} account={a} />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="tabular-nums">{d.events} событий</span>
                                    <span className="whitespace-nowrap">
                                        {new Date(d.last_seen).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </AsyncBlock>

                {(total > LIST_SIZE || page > 1) && (
                    <div className="mt-4">
                        <Pagination
                            page={page}
                            total={total}
                            size={LIST_SIZE}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function AccountCountBadge({ count, suffix = '' }: { count: number; suffix?: string }) {
    return (
        <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            {count}
            {suffix}
        </span>
    )
}

function AccountLine({ account }: { account: MultiAccountRow['accounts'][number] }) {
    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href={`/admin/users/${account.user_id}`} className="hover:underline">
                {account.name ?? `user #${account.user_id}`}
            </Link>
            <span className="text-xs text-muted-foreground tabular-nums">#{account.user_id}</span>
            {account.phone && (
                <span className="font-mono text-xs text-muted-foreground">{account.phone}</span>
            )}
            <span className="text-xs text-muted-foreground">· {account.events} соб.</span>
        </div>
    )
}
