'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link } from '@doska/i18n'
import {
    useAdminAnalyticsAppErrorSignatureEvents,
    useAdminAnalyticsErrorSignatureBreakdown,
    useAdminAnalyticsErrorSignatureEvents,
    useAdminAnalyticsErrorSignatureUsers,
} from '@/hooks/queries/admin'
import type {
    AdminAppErrorEvent,
    AdminAppErrorGroup,
    AdminErrorEvent,
    AdminErrorGroup,
} from '@/apis/admin'
import { ErrorSignatureSparkline } from './charts-lazy'
import { ErrorStatusBadge, ErrorUsersTable } from './errors-ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {children}
        </div>
    )
}

function EventMeta({
    event,
}: {
    event: Pick<
        AdminErrorEvent,
        'created_at' | 'platform' | 'app_version' | 'user_id' | 'user_name' | 'device_id'
    >
}) {
    return (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{new Date(event.created_at).toLocaleString()}</span>
            {event.platform && (
                <span className="font-mono">
                    {event.platform}
                    {event.app_version ? ` ${event.app_version}` : ''}
                </span>
            )}
            {event.user_id ? (
                <Link href={`/admin/users/${event.user_id}`} className="hover:underline">
                    {event.user_name ?? `user #${event.user_id}`}
                </Link>
            ) : (
                <span>аноним{event.device_id ? ` · ${event.device_id.slice(0, 12)}…` : ''}</span>
            )}
        </div>
    )
}

function CodeBlock({ label, text }: { label: string; text: string }) {
    return (
        <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {label}
            </summary>
            <pre className="mt-1 max-h-64 overflow-auto rounded bg-muted p-2 font-mono text-[11px] whitespace-pre-wrap break-all">
                {text}
            </pre>
        </details>
    )
}

// ── API errors ──

export function ApiErrorDrilldown({
    signature,
    period,
    granularity,
    product,
    onClose,
}: {
    signature: AdminErrorGroup | null
    period: string
    granularity: string
    product?: string
    onClose: () => void
}) {
    const events = useAdminAnalyticsErrorSignatureEvents(signature, period, product)
    const breakdown = useAdminAnalyticsErrorSignatureBreakdown(signature, period, granularity, product)
    const users = useAdminAnalyticsErrorSignatureUsers(signature, period, product)

    return (
        <Sheet open={!!signature} onOpenChange={open => !open && onClose()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
                {signature && (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex flex-wrap items-center gap-2 font-mono text-base">
                                <ErrorStatusBadge status={signature.status} />
                                {signature.error_type ?? '—'}
                                {signature.error_code ? ` · ${signature.error_code}` : ''}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {signature.kind}
                                </span>
                            </SheetTitle>
                        </SheetHeader>
                        <div className="space-y-6 px-4 pb-6">
                            <Section title={`Динамика (${period})`}>
                                {breakdown.data && breakdown.data.timeseries.length > 0 ? (
                                    <ErrorSignatureSparkline
                                        data={breakdown.data.timeseries}
                                        granularity={granularity as 'hour' | 'day'}
                                    />
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        {breakdown.isLoading ? 'Загрузка…' : 'Нет данных'}
                                    </div>
                                )}
                            </Section>

                            <Section title="Последние события">
                                {events.isLoading ? (
                                    <div className="text-sm text-muted-foreground">Загрузка…</div>
                                ) : !events.data || events.data.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Нет событий</div>
                                ) : (
                                    <div className="space-y-3">
                                        {events.data.map(e => (
                                            <div key={e.id} className="rounded border p-2 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                                                    <span className="font-semibold">{e.method ?? '—'}</span>
                                                    <span className="truncate">{e.route ?? e.path ?? '—'}</span>
                                                    {e.route && e.path && e.route !== e.path && (
                                                        <span className="text-muted-foreground truncate">
                                                            {e.path}
                                                        </span>
                                                    )}
                                                </div>
                                                {e.message && (
                                                    <div className="text-xs break-words">{e.message}</div>
                                                )}
                                                <EventMeta event={e} />
                                                {e.request_id && (
                                                    <div className="font-mono text-[11px] text-muted-foreground">
                                                        request_id: {e.request_id}
                                                    </div>
                                                )}
                                                {e.traceback && (
                                                    <CodeBlock label="Traceback" text={e.traceback} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Section>

                            {breakdown.data && breakdown.data.paths.length > 0 && (
                                <Section title="По эндпоинтам">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Эндпоинт</TableHead>
                                                <TableHead className="w-20 text-right">Ошибок</TableHead>
                                                <TableHead className="w-20 text-right">Юзеров</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {breakdown.data.paths.map((p, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">
                                                        <span className="font-semibold">{p.method ?? ''}</span>{' '}
                                                        {p.path ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {p.count}
                                                    </TableCell>
                                                    <TableCell className="text-right">{p.users}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Section>
                            )}

                            {breakdown.data && breakdown.data.versions.length > 0 && (
                                <Section title="По версиям">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Платформа</TableHead>
                                                <TableHead>Версия</TableHead>
                                                <TableHead className="w-20 text-right">Ошибок</TableHead>
                                                <TableHead className="w-20 text-right">Юзеров</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {breakdown.data.versions.map((v, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-sm">
                                                        {v.platform ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {v.app_version ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {v.count}
                                                    </TableCell>
                                                    <TableCell className="text-right">{v.users}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Section>
                            )}

                            <Section title="Пользователи">
                                {users.isLoading ? (
                                    <div className="text-sm text-muted-foreground">Загрузка…</div>
                                ) : !users.data || users.data.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        Нет авторизованных пользователей (анонимные запросы)
                                    </div>
                                ) : (
                                    <ErrorUsersTable data={users.data} />
                                )}
                            </Section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

// ── Client (app) errors ──

export function AppErrorDrilldown({
    signature,
    period,
    product,
    onClose,
}: {
    signature: AdminAppErrorGroup | null
    period: string
    product?: string
    onClose: () => void
}) {
    const events = useAdminAnalyticsAppErrorSignatureEvents(signature, period, product)

    return (
        <Sheet open={!!signature} onOpenChange={open => !open && onClose()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
                {signature && (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex flex-wrap items-center gap-2 font-mono text-base">
                                {signature.fatal && (
                                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                                        fatal
                                    </span>
                                )}
                                {signature.error_type ?? '—'}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {signature.source ?? signature.event_type}
                                </span>
                            </SheetTitle>
                        </SheetHeader>
                        <div className="space-y-6 px-4 pb-6">
                            <Section title="Последние события">
                                {events.isLoading ? (
                                    <div className="text-sm text-muted-foreground">Загрузка…</div>
                                ) : !events.data || events.data.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Нет событий</div>
                                ) : (
                                    <div className="space-y-3">
                                        {events.data.map(e => (
                                            <AppErrorEventItem key={e.id} event={e} />
                                        ))}
                                    </div>
                                )}
                            </Section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

function AppErrorEventItem({ event }: { event: AdminAppErrorEvent }) {
    return (
        <div className="rounded border p-2 space-y-1">
            <div className="font-mono text-xs">{event.source ?? '—'}</div>
            {event.url && (
                <div className="font-mono text-xs">
                    <span className="font-semibold">{event.http_method ?? ''}</span> {event.url}
                    {event.status && <span className="text-red-600 dark:text-red-400"> → {event.status}</span>}
                </div>
            )}
            {event.message && <div className="text-xs break-words">{event.message}</div>}
            <EventMeta event={event} />
            {event.os_version && (
                <div className="text-[11px] text-muted-foreground">{event.os_version}</div>
            )}
            {event.response_body && <CodeBlock label="Ответ сервера" text={event.response_body} />}
            {event.stack && <CodeBlock label="Stack trace" text={event.stack} />}
        </div>
    )
}
