'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@doska/i18n'
import {
    useAdminUser,
    useAdminUserTripsSummary,
    useAdminUserWallets,
    useAdminUserDevices,
    useAdminUserSessions,
} from '@/hooks/queries/admin'
import { useAdminBanUser } from '@/hooks/mutations/admin'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BackButton,
    Button,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Skeleton,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@doska/ui'
import {
    User as UserIcon,
    Phone,
    Mail,
    Ban,
    CheckCircle2,
    Star,
    ShieldCheck,
    Smartphone,
    Monitor,
    Wallet,
    Car,
    Route,
    Calendar,
    Clock,
    Copy,
    ExternalLink,
    MoreVertical,
    Hash,
    Fingerprint,
    Globe,
    Activity,
    Loader2,
    Users,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import { format } from 'date-fns'

/* ────────────────────────────── helpers ────────────────────────────── */

const ACCENT = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
}

function fmt(v?: string | null, withTime = true) {
    if (!v) return '—'
    try {
        return format(new Date(v), withTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy')
    } catch {
        return String(v)
    }
}

function isOnline(lastOnline?: string | null) {
    if (!lastOnline) return false
    return Date.now() - new Date(lastOnline).getTime() < 5 * 60 * 1000
}

function copy(text?: string | null) {
    if (text) navigator.clipboard?.writeText(text)
}

function Pill({
    children,
    tone = 'muted',
}: {
    children: React.ReactNode
    tone?: 'muted' | 'emerald' | 'rose' | 'blue' | 'amber'
}) {
    const tones: Record<string, string> = {
        muted: 'bg-muted text-muted-foreground',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    }
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${tones[tone]}`}
        >
            {children}
        </span>
    )
}

function SectionCard({
    title,
    icon: Icon,
    action,
    children,
    className = '',
}: {
    title: string
    icon: React.ElementType
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <Card className={`overflow-hidden shadow-sm ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border bg-muted/40 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Icon className="h-[18px] w-[18px] text-muted-foreground" />
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent className="pt-5">{children}</CardContent>
        </Card>
    )
}

function StatTile({
    label,
    value,
    accent = 'text-foreground',
    icon: Icon,
}: {
    label: string
    value: React.ReactNode
    accent?: string
    icon: React.ElementType
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
        </div>
    )
}

function InfoRow({
    icon: Icon,
    label,
    children,
    onCopy,
}: {
    icon: React.ElementType
    label: string
    children: React.ReactNode
    onCopy?: () => void
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
            </span>
            <span className="flex items-center gap-1.5 text-right text-sm font-medium text-foreground">
                <span className="break-all">{children}</span>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        title="Скопировать"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </span>
        </div>
    )
}

/* ────────────────────────────── page ────────────────────────────── */

export default function UserDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0

    const { data: user, isLoading } = useAdminUser(id)
    const tripsSummary = useAdminUserTripsSummary(id)
    const wallets = useAdminUserWallets(id)
    const devices = useAdminUserDevices(id)
    const sessions = useAdminUserSessions(id)

    const banUser = useAdminBanUser()
    const [confirmBan, setConfirmBan] = useState(false)

    if (isLoading) {
        return (
            <div className="space-y-6">
                <BackButton />
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <BackButton />
                <p className="py-12 text-center text-muted-foreground">Пользователь не найден</p>
            </div>
        )
    }

    const summary = tripsSummary.data
    const walletItems = wallets.data?.wallets ?? []
    const totals = wallets.data?.total_balance_by_currency ?? {}
    const online = isOnline(user.last_online_at)

    const handleBan = () => {
        banUser.mutate(
            { id: user.id, isActive: !user.is_active },
            { onSettled: () => setConfirmBan(false) },
        )
    }

    return (
        <div className="space-y-6">
            <BackButton />

            {/* ── Profile header ── */}
            <Card className="overflow-hidden shadow-sm">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16 ring-2 ring-border">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-zinc-900 text-lg text-white">
                                    {(user.full_name || user.username || '?')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${
                                    online ? 'bg-emerald-500' : 'bg-zinc-400'
                                }`}
                                title={online ? 'В сети' : 'Не в сети'}
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                                {user.full_name || user.username}
                            </h1>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {user.is_active ? (
                                    <Pill tone="emerald">
                                        <CheckCircle2 className="h-3 w-3" /> Активен
                                    </Pill>
                                ) : (
                                    <Pill tone="rose">
                                        <Ban className="h-3 w-3" /> Забанен
                                    </Pill>
                                )}
                                {!!user.rating && (
                                    <Pill tone="amber">
                                        <Star className="h-3 w-3 fill-current" />
                                        {Number(user.rating).toFixed(1)} ({user.review_count ?? 0})
                                    </Pill>
                                )}
                                {user.role_slug && (
                                    <Pill tone="blue">
                                        <ShieldCheck className="h-3 w-3" /> {user.role_slug}
                                    </Pill>
                                )}
                                {user.provider && <Pill>{user.provider}</Pill>}
                                {user.gender && <Pill>{user.gender}</Pill>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/admin/analytics/users/${user.id}`}>
                            <Button variant="outline" className="gap-2">
                                <Activity className="h-4 w-4" /> Аналитика
                            </Button>
                        </Link>
                        <Button
                            variant={user.is_active ? 'destructive' : 'default'}
                            className="gap-2"
                            onClick={() => setConfirmBan(true)}
                        >
                            {user.is_active ? (
                                <>
                                    <Ban className="h-4 w-4" /> Забанить
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" /> Разбанить
                                </>
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Скопировать</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => copy(String(user.id))}>
                                    <Hash className="mr-2 h-4 w-4" /> ID: {user.id}
                                </DropdownMenuItem>
                                {user.phone && (
                                    <DropdownMenuItem onClick={() => copy(user.phone)}>
                                        <Phone className="mr-2 h-4 w-4" /> {user.phone}
                                    </DropdownMenuItem>
                                )}
                                {user.email && (
                                    <DropdownMenuItem onClick={() => copy(user.email)}>
                                        <Mail className="mr-2 h-4 w-4" /> {user.email}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <Link href={`/admin/analytics/users/${user.id}`}>
                                    <DropdownMenuItem>
                                        <ExternalLink className="mr-2 h-4 w-4" /> Открыть аналитику
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* ── Trips stat tiles ── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatTile label="Поездок всего" icon={Route} value={summary?.total ?? '—'} />
                <StatTile label="Как водитель" icon={Car} accent={ACCENT.blue} value={summary?.driver ?? '—'} />
                <StatTile label="Как пассажир" icon={Users} value={summary?.passenger ?? '—'} />
                <StatTile label="Активные" icon={Activity} accent={ACCENT.emerald} value={summary?.active ?? '—'} />
                <StatTile label="Завершённые" icon={CheckCircle} accent={ACCENT.emerald} value={summary?.completed ?? '—'} />
                <StatTile label="Отменённые" icon={XCircle} accent={ACCENT.rose} value={summary?.cancelled ?? '—'} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ── Identity ── */}
                <SectionCard title="Идентификация" icon={UserIcon}>
                    <div className="divide-y divide-border">
                        <InfoRow icon={Hash} label="ID" onCopy={() => copy(String(user.id))}>
                            {user.id}
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="ФИО">
                            {[user.surname, user.name, user.patronymic].filter(Boolean).join(' ') || '—'}
                        </InfoRow>
                        <InfoRow icon={Fingerprint} label="Username">
                            @{user.username}
                        </InfoRow>
                        <InfoRow icon={Globe} label="Провайдер">
                            <span className="capitalize">{user.provider || '—'}</span>
                        </InfoRow>
                        <InfoRow icon={ShieldCheck} label="Роль">
                            {user.role_slug || '—'}
                        </InfoRow>
                        <InfoRow icon={Calendar} label="Регистрация">
                            {fmt(user.created_at, false)}
                        </InfoRow>
                        <InfoRow icon={Clock} label="Был онлайн">
                            {online ? (
                                <span className="text-emerald-600 dark:text-emerald-400">сейчас</span>
                            ) : (
                                fmt(user.last_online_at)
                            )}
                        </InfoRow>
                    </div>
                </SectionCard>

                {/* ── Contacts ── */}
                <SectionCard title="Контакты" icon={Phone}>
                    <div className="divide-y divide-border">
                        <InfoRow icon={Phone} label="Телефон" onCopy={user.phone ? () => copy(user.phone) : undefined}>
                            {user.phone || '—'}
                        </InfoRow>
                        <InfoRow icon={Mail} label="Email" onCopy={user.email ? () => copy(user.email) : undefined}>
                            {user.email || '—'}
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="Пол">
                            <span className="capitalize">{user.gender || '—'}</span>
                        </InfoRow>
                        <InfoRow icon={Star} label="Рейтинг">
                            {user.rating ? `${Number(user.rating).toFixed(1)} (${user.review_count ?? 0})` : '—'}
                        </InfoRow>
                    </div>
                </SectionCard>

                {/* ── Wallets ── */}
                <SectionCard
                    title="Кошельки"
                    icon={Wallet}
                    action={
                        Object.keys(totals).length > 0 ? (
                            <span className="text-sm font-semibold tabular-nums text-foreground">
                                {Object.entries(totals)
                                    .map(([cur, val]) => `${val.toLocaleString()} ${cur}`)
                                    .join(' · ')}
                            </span>
                        ) : undefined
                    }
                >
                    {wallets.isLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : walletItems.length === 0 ? (
                        <p className="py-6 text-center text-sm italic text-muted-foreground">
                            Нет кошельков
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {walletItems.map(w => (
                                <div key={w.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {w.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {w.product} · {w.tx_count} операций
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                                        {w.balance.toLocaleString()} {w.currency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Trip types breakdown ── */}
            {summary && summary.by_type.length > 0 && (
                <SectionCard title="Поездки по типам" icon={Route}>
                    <div className="flex flex-wrap gap-2">
                        {summary.by_type.map(t => (
                            <Pill key={t.trip_type ?? 'unknown'} tone="blue">
                                {t.trip_type ?? '—'}
                                <span className="font-bold tabular-nums">{t.count}</span>
                            </Pill>
                        ))}
                    </div>
                </SectionCard>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ── Devices ── */}
                <SectionCard
                    title="Устройства (push)"
                    icon={Smartphone}
                    action={
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {devices.data?.length ?? 0}
                        </span>
                    }
                >
                    {devices.isLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : !devices.data || devices.data.length === 0 ? (
                        <p className="py-6 text-center text-sm italic text-muted-foreground">
                            Нет устройств
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {devices.data.map(d => (
                                <div key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="capitalize">{d.device_type}</span>
                                            {d.app_version && (
                                                <span className="text-xs text-muted-foreground">
                                                    v{d.app_version}
                                                </span>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {d.device_info ?? '—'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                        {fmt(d.created_at, false)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* ── Sessions ── */}
                <SectionCard
                    title="Сессии"
                    icon={Monitor}
                    action={
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {sessions.data?.length ?? 0}
                        </span>
                    }
                >
                    {sessions.isLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : !sessions.data || sessions.data.length === 0 ? (
                        <p className="py-6 text-center text-sm italic text-muted-foreground">
                            Нет сессий
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {sessions.data.map(s => {
                                const active = s.is_deleted != null ? !s.is_deleted : !!s.is_active
                                return (
                                    <div key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                {active ? (
                                                    <Pill tone="emerald">активна</Pill>
                                                ) : (
                                                    <Pill>закрыта</Pill>
                                                )}
                                                {s.app_version && (
                                                    <span className="text-xs text-muted-foreground">
                                                        v{s.app_version}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {s.device_info ?? '—'}
                                                {s.ip_address ? ` · ${s.ip_address}` : ''}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                            {s.last_used_at ? fmt(s.last_used_at) : fmt(s.created_at)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Ban confirm ── */}
            <Dialog open={confirmBan} onOpenChange={setConfirmBan}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {user.is_active ? 'Забанить' : 'Разбанить'} {user.username}?
                        </DialogTitle>
                        <DialogDescription>
                            {user.is_active
                                ? 'Пользователь потеряет доступ к аккаунту до разбана.'
                                : 'Пользователю вернётся доступ к аккаунту.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button
                            variant={user.is_active ? 'destructive' : 'default'}
                            onClick={handleBan}
                            disabled={banUser.isPending}
                            className="gap-2"
                        >
                            {banUser.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.is_active ? (
                                <Ban className="h-4 w-4" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            {user.is_active ? 'Забанить' : 'Разбанить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
