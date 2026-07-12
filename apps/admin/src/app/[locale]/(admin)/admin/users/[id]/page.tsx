'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { Link } from '@doska/i18n'
import { format } from 'date-fns'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useAdminUser, useAdminUserTripsSummary } from '@/hooks/queries/admin'
import { useAdminBanUser } from '@/hooks/mutations/admin'
import { UserFeatureOverridesForm } from '@/components/admin/users/UserFeatureOverridesForm'
import { UserPreBlockWarningForm } from '@/components/admin/users/UserPreBlockWarningForm'
import { UserSendNotificationForm } from '@/components/admin/users/UserSendNotificationForm'
import { RelatedAccountsTab } from '@/components/admin/users/RelatedAccountsTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { DevicesTab } from './components/DevicesTab'
import { ErrorsTab } from './components/ErrorsTab'
import { UserNotificationsCard } from './components/UserNotificationsCard'
import { VehiclesCard } from './components/VehiclesCard'
import { WalletsCard } from './components/WalletsCard'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    BackButton,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Skeleton,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@doska/ui'
import {
    Activity,
    AlertTriangle,
    Ban,
    Bell,
    Calendar,
    Car,
    CheckCircle,
    CheckCircle2,
    Clock,
    Copy,
    Fingerprint,
    Flag,
    Globe,
    Hash,
    Loader2,
    Mail,
    MoreVertical,
    Phone,
    RefreshCw,
    Route,
    ShieldCheck,
    Smartphone,
    Star,
    User as UserIcon,
    Users,
    Wallet as WalletIcon,
    XCircle,
} from 'lucide-react'

const ACCENT = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
}

// Active tab lives in the URL (?tab=wallet) so it survives refresh/back and
// can be shared as a link.
const TAB_DEFAULTS = { tab: 'profile' }

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

/* ────────────────────────────── page ────────────────────────────── */

export default function UserDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const uid = id

    // Активный таб — в URL. Контент табов смонтирован только когда таб открыт
    // (Radix размонтирует неактивные TabsContent), поэтому каждый таб грузит
    // свои данные лениво — страница не делает десяток запросов на открытии.
    const { values: tabParams, setValues: setTabParams } = useFilterParams(TAB_DEFAULTS)

    // Период/продукт общие для табов «Аналитика» и «Ошибки».
    const [period, setPeriod] = useState('7d')
    const [product, setProduct] = useState('')

    const profile = useAdminUser(id)
    const user = profile.data
    const isLoading = profile.isLoading

    const tripsSummary = useAdminUserTripsSummary(id)

    const banUser = useAdminBanUser()
    const [confirmBan, setConfirmBan] = useState(false)

    const queryClient = useQueryClient()
    const isFetching = useIsFetching() > 0
    // Помечает все запросы устаревшими: видимые перезапрашиваются сразу,
    // остальные — при открытии своего таба.
    const refreshAll = () => queryClient.invalidateQueries()

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1400px] space-y-6">
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
            <div className="mx-auto max-w-[1400px] space-y-6">
                <BackButton />
                <p className="py-12 text-center text-muted-foreground">Пользователь не найден</p>
            </div>
        )
    }

    const summary = tripsSummary.data
    const online = isOnline(user.last_online_at)

    const handleBan = () => {
        banUser.mutate(
            { id: user.id, isActive: !user.is_active },
            { onSettled: () => setConfirmBan(false) },
        )
    }

    return (
        <div className="mx-auto max-w-[1400px] space-y-6">
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
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refreshAll}
                            disabled={isFetching}
                            title="Обновить"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
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
                                <Link href={`/admin/trips?user_id=${user.id}`}>
                                    <DropdownMenuItem>
                                        <Route className="mr-2 h-4 w-4" /> Поездки пользователя
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>

                {/* ── Quick facts strip ── */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border bg-muted/30 px-6 py-3 text-sm text-muted-foreground">
                    <button
                        onClick={() => copy(String(user.id))}
                        className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                        title="Скопировать ID"
                    >
                        <Hash className="h-3.5 w-3.5" /> {user.id}
                        <Copy className="h-3 w-3 opacity-50" />
                    </button>
                    {user.phone && (
                        <button
                            onClick={() => copy(user.phone)}
                            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                            title="Скопировать телефон"
                        >
                            <Phone className="h-3.5 w-3.5" /> {user.phone}
                            <Copy className="h-3 w-3 opacity-50" />
                        </button>
                    )}
                    {user.email && (
                        <button
                            onClick={() => copy(user.email)}
                            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                            title="Скопировать email"
                        >
                            <Mail className="h-3.5 w-3.5" /> {user.email}
                            <Copy className="h-3 w-3 opacity-50" />
                        </button>
                    )}
                    <span className="flex items-center gap-1.5" title="Дата регистрации">
                        <Calendar className="h-3.5 w-3.5" /> с {fmt(user.created_at, false)}
                    </span>
                    <span className="flex items-center gap-1.5" title="Был онлайн">
                        <Clock className="h-3.5 w-3.5" />
                        {online ? (
                            <span className="text-emerald-600 dark:text-emerald-400">в сети</span>
                        ) : (
                            fmt(user.last_online_at)
                        )}
                    </span>
                </div>
            </Card>

            {/* ── Tabs ── */}
            <Tabs
                value={tabParams.tab}
                onValueChange={v => setTabParams({ tab: v })}
                className="space-y-6"
            >
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="profile" className="gap-2 shrink-0">
                        <UserIcon className="h-4 w-4" /> Профиль
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2 shrink-0">
                        <Activity className="h-4 w-4" /> Аналитика
                    </TabsTrigger>
                    <TabsTrigger value="errors" className="gap-2 shrink-0">
                        <AlertTriangle className="h-4 w-4" /> Ошибки
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="gap-2 shrink-0">
                        <Smartphone className="h-4 w-4" /> Устройства
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="gap-2 shrink-0">
                        <WalletIcon className="h-4 w-4" /> Кошелёк
                    </TabsTrigger>
                    <TabsTrigger value="related" className="gap-2 shrink-0">
                        <Fingerprint className="h-4 w-4" /> Связи
                    </TabsTrigger>
                    <TabsTrigger value="notify" className="gap-2 shrink-0">
                        <Bell className="h-4 w-4" /> Уведомление
                    </TabsTrigger>
                </TabsList>

                {/* ══════════════════ PROFILE TAB ══════════════════ */}
                <TabsContent value="profile" className="space-y-6">
                    {/* ── Trips stat tiles ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <StatTile label="Поездок всего" icon={Route} value={summary?.total ?? '—'} />
                        <StatTile label="Как водитель" icon={Car} accent={ACCENT.blue} value={summary?.driver ?? '—'} />
                        <StatTile label="Как пассажир" icon={Users} value={summary?.passenger ?? '—'} />
                        <StatTile label="Активные" icon={Activity} accent={ACCENT.emerald} value={summary?.active ?? '—'} />
                        <StatTile label="Завершённые" icon={CheckCircle} accent={ACCENT.emerald} value={summary?.completed ?? '—'} />
                        <StatTile label="Отменённые" icon={XCircle} accent={ACCENT.rose} value={summary?.cancelled ?? '—'} />
                    </div>

                    <Link
                        href={`/admin/trips?user_id=${user.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                        <Route className="h-4 w-4" /> Открыть поездки пользователя →
                    </Link>

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

                        {/* ── Feature overrides ── */}
                        <SectionCard title="Фичи (переопределения)" icon={Flag}>
                            <UserFeatureOverridesForm userId={id} />
                        </SectionCard>

                        {/* ── Pre-block warning ── */}
                        <SectionCard title="Предупреждение перед блокировкой" icon={AlertTriangle}>
                            <UserPreBlockWarningForm userId={id} />
                        </SectionCard>

                    </div>

                    <VehiclesCard uid={uid} />
                </TabsContent>

                {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
                <TabsContent value="analytics" className="space-y-5">
                    <AnalyticsTab uid={uid} period={period} setPeriod={setPeriod} product={product} setProduct={setProduct} />
                </TabsContent>

                {/* ══════════════════ ERRORS TAB ══════════════════ */}
                <TabsContent value="errors" className="space-y-5">
                    <ErrorsTab uid={uid} period={period} setPeriod={setPeriod} product={product} setProduct={setProduct} />
                </TabsContent>

                {/* ══════════════════ DEVICES TAB ══════════════════ */}
                <TabsContent value="devices" className="space-y-6">
                    <DevicesTab uid={uid} />
                </TabsContent>

                {/* ══════════════════ WALLET TAB ══════════════════ */}
                <TabsContent value="wallet" className="space-y-6">
                    <WalletsCard uid={uid} />
                </TabsContent>

                {/* ══════════════════ RELATED TAB ══════════════════ */}
                <TabsContent value="related" className="space-y-6">
                    <RelatedAccountsTab userId={id} />
                </TabsContent>

                {/* ══════════════════ NOTIFY TAB ══════════════════ */}
                <TabsContent value="notify" className="space-y-6">
                    <UserSendNotificationForm userId={id} />

                    <UserNotificationsCard uid={uid} />
                </TabsContent>
            </Tabs>

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

/* ────────────────────────── analytics sub-components ────────────────────────── */

// Client-side row limiter — renders first `step` rows with a "show more" toggle
// so analytics tables stay compact instead of dumping hundreds of rows.
