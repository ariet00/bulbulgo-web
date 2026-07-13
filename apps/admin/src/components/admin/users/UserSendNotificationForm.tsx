'use client'

import { useEffect, useMemo, useState } from 'react'
import {
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
import { CalendarClock, Save, Send, Trash2 } from 'lucide-react'
import {
    useAdminSendNotification,
    useAdminScheduleNotification,
} from '@/hooks/mutations/admin'
import {
    BUILT_IN_TEMPLATES,
    loadTemplates,
    saveTemplates,
    type NotificationTemplate,
} from '@/lib/notification-templates'

const ALL = '__all__'

// Готовые диплинки мобильного приложения. Flutter читает `click_action` из FCM
// data и навигирует через go_router — см.
// native_apps/bulbul_go/lib/core/router/app_router.dart.
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

export function UserSendNotificationForm({ userId }: { userId: number }) {
    const [mode, setMode] = useState<'now' | 'schedule'>('now')
    const [scheduledAt, setScheduledAt] = useState('') // datetime-local value

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [type, setType] = useState('info')
    const [category, setCategory] = useState('')
    const [clickActionPreset, setClickActionPreset] = useState<string>(ALL)
    const [clickActionCustom, setClickActionCustom] = useState('')
    const [dataJson, setDataJson] = useState('')
    const [isDataOnly, setIsDataOnly] = useState(false)

    const sendMutation = useAdminSendNotification()
    const scheduleMutation = useAdminScheduleNotification()
    const pending = sendMutation.isPending || scheduleMutation.isPending

    const clickAction =
        clickActionPreset === ALL
            ? clickActionCustom.trim() || undefined
            : clickActionPreset

    const dataObj = useMemo(() => {
        const trimmed = dataJson.trim()
        if (!trimmed)
            return { ok: true as const, value: undefined as Record<string, any> | undefined }
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

    // Шаблоны общие со страницей рассылок (localStorage). Фильтры рассылки здесь
    // не нужны — из шаблона применяется только текстовая часть.
    const [templates, setTemplates] = useState<NotificationTemplate[]>([])
    useEffect(() => {
        setTemplates(loadTemplates())
    }, [])

    const applyTemplate = (tpl: NotificationTemplate) => {
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
        const tpl: NotificationTemplate = {
            name,
            tab: 'user',
            title,
            body,
            type,
            category,
            clickAction: clickAction ?? '',
            dataJson,
            isDataOnly,
            filters: {},
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
        title.trim().length > 0 && body.trim().length > 0 && dataObj.ok && scheduleAtFuture

    const resetContent = () => {
        setTitle('')
        setBody('')
        setType('info')
        setCategory('')
        setClickActionPreset(ALL)
        setClickActionCustom('')
        setDataJson('')
        setIsDataOnly(false)
        setScheduledAt('')
        setMode('now')
    }

    const submit = async () => {
        if (!canSubmit) return
        const data = dataObj.ok ? dataObj.value : undefined

        if (mode === 'schedule') {
            await scheduleMutation.mutateAsync({
                kind: 'user',
                user_id: userId,
                scheduled_at: new Date(scheduledAt).toISOString(),
                title: title.trim(),
                body: body.trim(),
                type: type || 'info',
                category: category.trim() || undefined,
                click_action: clickAction,
                is_data_only: isDataOnly || undefined,
                data,
                filters: null,
            })
        } else {
            await sendMutation.mutateAsync({
                user_id: userId,
                title: title.trim(),
                body: body.trim(),
                type: type || 'info',
                category: category.trim() || undefined,
                click_action: clickAction,
                is_data_only: isDataOnly || undefined,
                data,
            })
        }
        resetContent()
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
                <CardHeader>
                    <CardTitle>Отправить уведомление пользователю</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                    <Send className="size-4 mr-1" /> Отправить
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
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
                            <div className="font-semibold text-sm">{title || 'Заголовок'}</div>
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
                                onClick={() => applyTemplate(tpl)}
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
    )
}
