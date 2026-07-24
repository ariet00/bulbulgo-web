'use client'

import { AdminBroadcastFilters } from '@/apis/admin'
import {
    useAdminNewsList,
    useAdminNotificationRoles,
    useAdminPreviewAudience,
} from '@/hooks/queries/admin'
import {
    useAdminBroadcastNotification,
    useAdminScheduleNotification,
    useAdminSendNotification,
} from '@/hooks/mutations/admin'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { ArrowLeft, CalendarClock, Save, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'
import {
    BUILT_IN_TEMPLATES,
    loadTemplates,
    saveTemplates,
    type NotificationTemplate as Template,
} from '@/lib/notification-templates'

const ALL = '__all__'

// Curated list of mobile-app deep links. The Flutter side reads `click_action`
// from FCM data and navigates via go_router — see
// native_apps/bulbul_go/lib/core/router/app_router.dart for the source of truth.
const CLICK_ACTION_PRESETS: { value: string; label: string }[] = [
    { value: '/rideshare', label: '/rideshare — попутки' },
    { value: '/rideshare/my', label: '/rideshare/my — мои поездки' },
    { value: '/rideshare/history', label: '/rideshare/history — история' },
    { value: '/freight', label: '/freight — грузовые' },
    { value: '/freight/my', label: '/freight/my — мои грузовые' },
    { value: '/bus', label: '/bus — автобусы' },
    { value: '/bus/my', label: '/bus/my — мои билеты' },
    { value: '/messages', label: '/messages — сообщения' },
    { value: '/profile', label: '/profile — профиль' },
    { value: '/profile/wallet', label: '/profile/wallet — кошелёк' },
    { value: '/profile/vehicles', label: '/profile/vehicles — автомобили' },
    { value: '/profile/reviews', label: '/profile/reviews — отзывы' },
]

export default function AdminSendNotificationPage() {
    const router = useRouter()
    const [tab, setTab] = useState<'user' | 'broadcast'>('user')
    const [mode, setMode] = useState<'now' | 'schedule'>('now')
    const [scheduledAt, setScheduledAt] = useState('') // datetime-local value

    // Common content
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [type, setType] = useState('info')
    const [category, setCategory] = useState('')
    const [clickActionPreset, setClickActionPreset] = useState<string>(ALL)
    const [clickActionCustom, setClickActionCustom] = useState('')
    const [dataJson, setDataJson] = useState('')
    const [isDataOnly, setIsDataOnly] = useState(false)

    // User mode
    const [userId, setUserId] = useState<number | null>(null)

    // Broadcast filters
    const [roleId, setRoleId] = useState<string>(ALL)
    const [deviceType, setDeviceType] = useState<string>(ALL)
    const [userStatus, setUserStatus] = useState<string>(ALL)
    const [minVersion, setMinVersion] = useState('')
    const [maxVersion, setMaxVersion] = useState('')
    const [guestsOnly, setGuestsOnly] = useState(false)
    // Explicit targeting (allowlists), comma/space/newline separated
    const [userIdsRaw, setUserIdsRaw] = useState('')
    const [deviceIdsRaw, setDeviceIdsRaw] = useState('')

    const { data: roles } = useAdminNotificationRoles()
    const { data: newsPage } = useAdminNewsList(1, 50, { status: 'published' })
    const publishedNews = newsPage?.items ?? []

    const sendMutation = useAdminSendNotification()
    const broadcastMutation = useAdminBroadcastNotification()
    const scheduleMutation = useAdminScheduleNotification()
    const pending =
        sendMutation.isPending || broadcastMutation.isPending || scheduleMutation.isPending

    const clickAction =
        clickActionPreset === ALL
            ? clickActionCustom.trim() || undefined
            : clickActionPreset

    const dataObj = useMemo(() => {
        const trimmed = dataJson.trim()
        if (!trimmed) return { ok: true as const, value: undefined as Record<string, any> | undefined }
        try {
            const parsed = JSON.parse(trimmed)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return { ok: true as const, value: parsed as Record<string, any> }
            }
            return { ok: false as const, error: 'Корневой элемент должен быть объектом' }
        } catch (e: any) {
            return { ok: false as const, error: e?.message ?? 'Невалидный JSON' }
        }
    }, [dataJson])

    const userIds = useMemo(
        () =>
            userIdsRaw
                .split(/[\s,]+/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map(Number)
                .filter((n) => Number.isInteger(n) && n > 0),
        [userIdsRaw],
    )
    const deviceIds = useMemo(
        () =>
            deviceIdsRaw
                .split(/[\s,\n]+/)
                .map((s) => s.trim())
                .filter(Boolean),
        [deviceIdsRaw],
    )
    const explicitTargeting = userIds.length > 0 || deviceIds.length > 0

    const broadcastFilters: AdminBroadcastFilters = useMemo(
        () => ({
            role_id: guestsOnly ? null : roleId === ALL ? null : Number(roleId),
            status: guestsOnly ? null : userStatus === ALL ? null : userStatus,
            device_type: deviceType === ALL ? null : deviceType,
            min_version: minVersion.trim() || null,
            max_version: maxVersion.trim() || null,
            guests_only: guestsOnly || null,
            user_ids: userIds.length > 0 ? userIds : null,
            device_ids: deviceIds.length > 0 ? deviceIds : null,
        }),
        [roleId, userStatus, deviceType, minVersion, maxVersion, guestsOnly, userIds, deviceIds],
    )

    const {
        data: audience,
        isFetching: audienceLoading,
        refetch: refetchAudience,
    } = useAdminPreviewAudience(broadcastFilters, tab === 'broadcast')

    // Templates
    const [templates, setTemplates] = useState<Template[]>([])
    useEffect(() => {
        setTemplates(loadTemplates())
    }, [])

    const applyTemplate = (tpl: Template) => {
        setTab(tpl.tab)
        setTitle(tpl.title)
        setBody(tpl.body)
        setType(tpl.type || 'info')
        setCategory(tpl.category || '')
        const isPreset = CLICK_ACTION_PRESETS.some((p) => p.value === tpl.clickAction)
        setClickActionPreset(isPreset ? tpl.clickAction : ALL)
        setClickActionCustom(isPreset ? '' : tpl.clickAction || '')
        setDataJson(tpl.dataJson || '')
        setIsDataOnly(!!tpl.isDataOnly)
        setRoleId(tpl.filters.role_id != null ? String(tpl.filters.role_id) : ALL)
        setDeviceType(tpl.filters.device_type ?? ALL)
        setUserStatus(tpl.filters.status ?? ALL)
        setMinVersion(tpl.filters.min_version ?? '')
        setMaxVersion(tpl.filters.max_version ?? '')
        setGuestsOnly(!!tpl.filters.guests_only)
        setUserIdsRaw((tpl.filters.user_ids ?? []).join(', '))
        setDeviceIdsRaw((tpl.filters.device_ids ?? []).join('\n'))
    }

    // Встроенные шаблоны применяют только текстовую часть: активная вкладка
    // (пользователь/рассылка) и настроенные фильтры аудитории сохраняются.
    const applyBuiltIn = (tpl: Template) => {
        setTitle(tpl.title)
        setBody(tpl.body)
        setType(tpl.type || 'info')
        setCategory(tpl.category || '')
        const isPreset = CLICK_ACTION_PRESETS.some((p) => p.value === tpl.clickAction)
        setClickActionPreset(isPreset ? tpl.clickAction : ALL)
        setClickActionCustom(isPreset ? '' : tpl.clickAction || '')
        setDataJson(tpl.dataJson || '')
        setIsDataOnly(!!tpl.isDataOnly)
    }

    const saveTemplate = () => {
        const name = prompt('Название шаблона:')
        if (!name) return
        const tpl: Template = {
            name,
            tab,
            title,
            body,
            type,
            category,
            clickAction: clickAction ?? '',
            dataJson,
            isDataOnly,
            filters: broadcastFilters,
        }
        const next = [...templates.filter((t) => t.name !== name), tpl]
        setTemplates(next)
        saveTemplates(next)
    }

    const deleteTemplate = (name: string) => {
        if (!confirm(`Удалить шаблон «${name}»?`)) return
        const next = templates.filter((t) => t.name !== name)
        setTemplates(next)
        saveTemplates(next)
    }

    const scheduleAtFuture = useMemo(() => {
        if (mode !== 'schedule') return true
        if (!scheduledAt) return false
        const t = new Date(scheduledAt).getTime()
        if (isNaN(t)) return false
        return t > Date.now() + 30_000
    }, [mode, scheduledAt])

    const canSubmit =
        title.trim().length > 0 &&
        body.trim().length > 0 &&
        dataObj.ok &&
        (tab === 'broadcast' || userId != null) &&
        scheduleAtFuture

    const submit = async () => {
        if (!canSubmit) return
        const data = dataObj.ok ? dataObj.value : undefined

        if (mode === 'schedule') {
            await scheduleMutation.mutateAsync({
                kind: tab,
                scheduled_at: new Date(scheduledAt).toISOString(),
                title: title.trim(),
                body: body.trim(),
                type: type || 'info',
                category: category.trim() || undefined,
                click_action: clickAction,
                is_data_only: isDataOnly || undefined,
                data,
                user_id: tab === 'user' ? userId : null,
                filters: tab === 'broadcast' ? broadcastFilters : null,
            })
            router.push('/admin/notifications/scheduled')
            return
        }

        if (tab === 'user') {
            await sendMutation.mutateAsync({
                user_id: userId as number,
                title: title.trim(),
                body: body.trim(),
                type: type || 'info',
                category: category.trim() || undefined,
                click_action: clickAction,
                is_data_only: isDataOnly || undefined,
                data,
            })
        } else {
            if (
                audience &&
                audience.devices > 0 &&
                !confirm(
                    `Отправить ${audience.devices} устройствам (${audience.users} пользователей)?`,
                )
            ) {
                return
            }
            await broadcastMutation.mutateAsync({
                title: title.trim(),
                body: body.trim(),
                type: type || 'info',
                category: category.trim() || undefined,
                click_action: clickAction,
                is_data_only: isDataOnly || undefined,
                data,
                filters: broadcastFilters,
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/notifications">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Отправить уведомление</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Параметры</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs value={tab} onValueChange={(v) => setTab(v as 'user' | 'broadcast')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="user">Пользователю</TabsTrigger>
                                <TabsTrigger value="broadcast">Рассылка</TabsTrigger>
                            </TabsList>

                            <TabsContent value="user" className="space-y-3 pt-3">
                                <div>
                                    <Label>Пользователь *</Label>
                                    <UserCombobox value={userId} onChange={setUserId} allowClear />
                                </div>
                            </TabsContent>

                            <TabsContent value="broadcast" className="space-y-3 pt-3">
                                <div className="flex items-center gap-2 rounded border px-3 py-2">
                                    <Switch
                                        checked={guestsOnly}
                                        onCheckedChange={setGuestsOnly}
                                    />
                                    <Label className="flex-1 cursor-pointer">
                                        Только гостям (user_id IS NULL)
                                    </Label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label>Роль</Label>
                                        <Select
                                            value={roleId}
                                            onValueChange={setRoleId}
                                            disabled={guestsOnly}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Любая" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ALL}>Любая</SelectItem>
                                                {roles?.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        {r.name}
                                                        {r.category ? ` (${r.category})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Тип устройства</Label>
                                        <Select value={deviceType} onValueChange={setDeviceType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ALL}>Все</SelectItem>
                                                <SelectItem value="android">Android</SelectItem>
                                                <SelectItem value="ios">iOS</SelectItem>
                                                <SelectItem value="web">Web</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Статус</Label>
                                        <Select
                                            value={userStatus}
                                            onValueChange={setUserStatus}
                                            disabled={guestsOnly}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ALL}>Все</SelectItem>
                                                <SelectItem value="active">Только активные</SelectItem>
                                                <SelectItem value="banned">Только забаненные</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>Мин. версия</Label>
                                            <Input
                                                value={minVersion}
                                                onChange={(e) => setMinVersion(e.target.value)}
                                                placeholder="1.2.0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Макс. версия</Label>
                                            <Input
                                                value={maxVersion}
                                                onChange={(e) => setMaxVersion(e.target.value)}
                                                placeholder="2.0.0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Версии включительные. Устройства без версии исключаются
                                    мин-фильтром, но проходят макс-фильтр. Рассылка отправляется
                                    асинхронно через очередь.
                                </p>

                                <Separator />

                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">
                                        Точечная отправка (необязательно)
                                    </Label>
                                    <div>
                                        <Label>ID пользователей</Label>
                                        <Textarea
                                            value={userIdsRaw}
                                            onChange={(e) => setUserIdsRaw(e.target.value)}
                                            rows={2}
                                            placeholder="12, 345, 6789"
                                            className="font-mono text-xs"
                                        />
                                        {userIds.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Распознано пользователей: {userIds.length}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Device ID</Label>
                                        <Textarea
                                            value={deviceIdsRaw}
                                            onChange={(e) => setDeviceIdsRaw(e.target.value)}
                                            rows={2}
                                            placeholder={'device-id-1\ndevice-id-2'}
                                            className="font-mono text-xs"
                                        />
                                        {deviceIds.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Распознано устройств: {deviceIds.length}
                                            </p>
                                        )}
                                    </div>
                                    {explicitTargeting && (
                                        <p className="text-xs text-amber-600 dark:text-amber-500">
                                            {deviceIds.length > 0
                                                ? 'Указаны Device ID — остальные фильтры (роль, тип, версия, пользователи) игнорируются, отправка строго на эти устройства.'
                                                : 'Указаны ID пользователей — фильтры роли/активности/гостей игнорируются. Тип устройства и версия, если заданы, всё ещё сужают список.'}
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Separator />

                        <div>
                            <Label>Заголовок *</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label>Текст *</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label>Тип</Label>
                                <Input
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="info"
                                />
                            </div>
                            <div>
                                <Label>Категория</Label>
                                <Input
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="booking / chat / system…"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Click action (deep link)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                                <Select
                                    value={clickActionPreset}
                                    onValueChange={(v) => {
                                        setClickActionPreset(v)
                                        if (v !== ALL) setClickActionCustom('')
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите маршрут" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>— свой URL —</SelectItem>
                                        {CLICK_ACTION_PRESETS.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={clickActionCustom}
                                    onChange={(e) => {
                                        setClickActionCustom(e.target.value)
                                        if (e.target.value) setClickActionPreset(ALL)
                                    }}
                                    placeholder="/rideshare/trips/123"
                                    disabled={clickActionPreset !== ALL}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                По нажатию приложение откроет указанный экран. Если пусто —
                                откроется главный экран.
                            </p>
                            <div className="mt-2">
                                <Select
                                    value={ALL}
                                    onValueChange={(v) => {
                                        const n = publishedNews.find(
                                            (x) => String(x.id) === v,
                                        )
                                        if (!n) return
                                        setClickActionPreset(ALL)
                                        setClickActionCustom(n.click_action)
                                        if (!title.trim()) setTitle(n.title)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="…или открыть новость" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {publishedNews.length === 0 && (
                                            <SelectItem value={ALL} disabled>
                                                Нет опубликованных новостей
                                            </SelectItem>
                                        )}
                                        {publishedNews.map((n) => (
                                            <SelectItem
                                                key={n.id}
                                                value={String(n.id)}
                                            >
                                                #{n.id} — {n.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Подставит диплинк выбранной новости (полноэкранная
                                    статья). Создать новость: «BulBul Go → Новости».
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label>Доп. данные (JSON)</Label>
                            <Textarea
                                value={dataJson}
                                onChange={(e) => setDataJson(e.target.value)}
                                rows={3}
                                placeholder={'{"trip_id": "123"}'}
                                className="font-mono text-xs"
                            />
                            {!dataObj.ok && (
                                <p className="text-xs text-destructive mt-1">{dataObj.error}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch checked={isDataOnly} onCheckedChange={setIsDataOnly} />
                            <Label>Silent push (data-only, без UI на устройстве)</Label>
                        </div>

                        <Separator />

                        <div>
                            <Label>Время отправки</Label>
                            <Tabs value={mode} onValueChange={(v) => setMode(v as 'now' | 'schedule')}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="now">Сейчас</TabsTrigger>
                                    <TabsTrigger value="schedule">Запланировать</TabsTrigger>
                                </TabsList>
                                <TabsContent value="schedule" className="pt-3">
                                    <Input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                    />
                                    {!scheduleAtFuture && scheduledAt && (
                                        <p className="text-xs text-destructive mt-1">
                                            Дата должна быть минимум на 30 секунд в будущем.
                                        </p>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center justify-between">
                            <Button variant="outline" size="sm" onClick={saveTemplate}>
                                <Save className="size-4 mr-1" /> Сохранить как шаблон
                            </Button>
                            <Button onClick={submit} disabled={!canSubmit || pending}>
                                {mode === 'schedule' ? (
                                    <>
                                        <CalendarClock className="size-4 mr-1" /> Запланировать
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4 mr-1" />
                                        {tab === 'broadcast' ? 'Отправить рассылку' : 'Отправить'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {tab === 'broadcast' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Аудитория</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Пользователей</span>
                                    <span className="font-mono">
                                        {audienceLoading ? '…' : (audience?.users ?? 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Гости</span>
                                    <span className="font-mono">
                                        {audienceLoading ? '…' : (audience?.guests ?? 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Устройств</span>
                                    <span className="font-mono">
                                        {audienceLoading ? '…' : (audience?.devices ?? 0)}
                                    </span>
                                </div>
                                {audience && Object.keys(audience.by_device_type).length > 0 && (
                                    <div className="pt-1 flex flex-wrap gap-1">
                                        {Object.entries(audience.by_device_type).map(([k, v]) => (
                                            <Badge key={k} variant="secondary">
                                                {k}: {v}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => refetchAudience()}
                                >
                                    Пересчитать
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Превью</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-2xl border bg-muted/40 p-3 space-y-1 shadow-sm">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="size-4 rounded bg-primary/70" />
                                    <span>BulBul Go</span>
                                    <span>· сейчас</span>
                                </div>
                                <div className="font-semibold text-sm">
                                    {title || 'Заголовок'}
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {body || 'Текст уведомления…'}
                                </div>
                                {clickAction && (
                                    <div className="text-[10px] text-muted-foreground pt-1">
                                        → {clickAction}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Шаблоны</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Готовые
                            </p>
                            {BUILT_IN_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.name}
                                    type="button"
                                    className="block w-full rounded border px-2 py-1 text-left hover:bg-muted/50"
                                    onClick={() => applyBuiltIn(tpl)}
                                    title={tpl.body}
                                >
                                    <span className="text-sm">{tpl.name}</span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {tpl.title}
                                    </span>
                                </button>
                            ))}

                            <p className="pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Мои
                            </p>
                            {templates.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Сохранённых шаблонов нет. Нажмите «Сохранить как шаблон» под
                                    формой.
                                </p>
                            ) : (
                                templates.map((tpl) => (
                                    <div
                                        key={tpl.name}
                                        className="flex items-center justify-between gap-2 rounded border px-2 py-1"
                                    >
                                        <button
                                            type="button"
                                            className="text-left text-sm truncate flex-1 hover:underline"
                                            onClick={() => applyTemplate(tpl)}
                                            title={tpl.title}
                                        >
                                            {tpl.name}
                                            <span className="text-xs text-muted-foreground ml-1">
                                                ({tpl.tab === 'user' ? 'пользователю' : 'рассылка'})
                                            </span>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteTemplate(tpl.name)}
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
