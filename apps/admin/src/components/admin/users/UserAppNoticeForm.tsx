'use client'

import { type AdminUserAppNotice } from '@/apis/admin'
import { useAdminUserAppNotice } from '@/hooks/queries/admin'
import { useUpdateAdminUserAppNotice } from '@/hooks/mutations/admin'
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from '@doska/ui'
import { useEffect, useState } from 'react'

// Готовые сценарии: заполняют тип/заголовок/текст/кнопку — можно отредактировать
// перед сохранением.
const PRESETS: {
    label: string
    kind: 'warning' | 'info'
    title: string
    message: string
    action_route: string
    action_label: string
}[] = [
    {
        label: 'Заполните данные авто',
        kind: 'info',
        title: 'Заполните данные авто',
        message:
            'Укажите марку, цвет и госномер автомобиля — пассажиры охотнее бронируют поездки с заполненным авто.',
        action_route: '/profile/vehicles',
        action_label: 'Заполнить',
    },
    {
        label: 'Заполните профиль',
        kind: 'info',
        title: 'Заполните профиль',
        message:
            'Добавьте имя, фото и данные профиля — это повышает доверие других пользователей.',
        action_route: '/profile',
        action_label: 'К профилю',
    },
    {
        label: 'Нарушение правил',
        kind: 'warning',
        title: 'Предупреждение',
        message:
            'Мы зафиксировали нарушения правил сервиса. Пожалуйста, ознакомьтесь с правилами — при повторных нарушениях аккаунт будет заблокирован.',
        action_route: '',
        action_label: '',
    },
    {
        label: 'Жалобы на объявления',
        kind: 'warning',
        title: 'Предупреждение',
        message:
            'На ваши объявления поступают жалобы. Проверьте корректность публикаций, иначе доступ к аккаунту будет ограничен.',
        action_route: '',
        action_label: '',
    },
    {
        label: 'Спам / накрутка',
        kind: 'warning',
        title: 'Предупреждение',
        message:
            'Замечена подозрительная активность (спам или накрутка). Прекратите подобные действия, чтобы избежать блокировки.',
        action_route: '',
        action_label: '',
    },
    {
        label: 'Недостоверные данные',
        kind: 'warning',
        title: 'Предупреждение',
        message:
            'Вы указываете недостоверные данные в поездках. Исправьте информацию, чтобы избежать блокировки аккаунта.',
        action_route: '',
        action_label: '',
    },
    {
        label: 'Итоговое предупреждение',
        kind: 'warning',
        title: 'Последнее предупреждение',
        message:
            'Итоговое предупреждение: следующее нарушение правил приведёт к блокировке аккаунта.',
        action_route: '',
        action_label: '',
    },
]

export function UserAppNoticeForm({ userId }: { userId: number }) {
    const { data, isLoading } = useAdminUserAppNotice(userId)
    const update = useUpdateAdminUserAppNotice()

    const [enabled, setEnabled] = useState(false)
    const [kind, setKind] = useState<'warning' | 'info'>('info')
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [actionRoute, setActionRoute] = useState('')
    const [actionLabel, setActionLabel] = useState('')
    const [url, setUrl] = useState('')
    const [dismissible, setDismissible] = useState(true)
    const [maxShows, setMaxShows] = useState('')
    const [intervalHours, setIntervalHours] = useState('')

    useEffect(() => {
        if (!data) return
        setEnabled(data.enabled)
        setKind(data.kind)
        setTitle(data.title ?? '')
        setMessage(data.message ?? '')
        setActionRoute(data.action_route ?? '')
        setActionLabel(data.action_label ?? '')
        setUrl(data.url ?? '')
        setDismissible(data.dismissible)
        setMaxShows(data.max_shows ? String(data.max_shows) : '')
        setIntervalHours(
            data.show_interval_hours ? String(data.show_interval_hours) : '',
        )
    }, [data])

    const submit = () => {
        const body: AdminUserAppNotice = {
            enabled,
            kind,
            title: title.trim() || null,
            message: message.trim() || null,
            action_route: actionRoute.trim() || null,
            action_label: actionLabel.trim() || null,
            url: url.trim() || null,
            dismissible,
            max_shows: maxShows ? Number(maxShows) : null,
            show_interval_hours: intervalHours ? Number(intervalHours) : null,
        }
        update.mutate({ id: userId, body })
    }

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                Полноэкранное уведомление в приложении: предупреждение,
                «заполните данные», «пройдите идентификацию» и т.п. Кнопка ведёт
                на нужный экран приложения. Изменение содержимого сбрасывает
                счётчики показов у пользователя.
            </p>

            <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                <div className="space-y-0.5">
                    <Label className="cursor-pointer">Показывать уведомление</Label>
                    <p className="text-xs text-muted-foreground">
                        <code>app_notice.enabled</code>
                    </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="space-y-1">
                <Label>Готовые сценарии</Label>
                <Select
                    onValueChange={(v) => {
                        const preset = PRESETS.find((p) => p.label === v)
                        if (!preset) return
                        setKind(preset.kind)
                        setTitle(preset.title)
                        setMessage(preset.message)
                        setActionRoute(preset.action_route)
                        setActionLabel(preset.action_label)
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Выбрать из списка…" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRESETS.map((p) => (
                            <SelectItem key={p.label} value={p.label}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label>Тип</Label>
                    <Select
                        value={kind}
                        onValueChange={(v) => setKind(v as 'warning' | 'info')}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="info">
                                Инфо (фирменный)
                            </SelectItem>
                            <SelectItem value="warning">
                                Предупреждение (красный)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Заголовок</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Пусто — по типу"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label>Текст</Label>
                <Textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Текст, который увидит пользователь…"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label>Роут кнопки (in-app)</Label>
                    <Input
                        value={actionRoute}
                        onChange={(e) => setActionRoute(e.target.value)}
                        placeholder="/profile/vehicles"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Путь внутри приложения, напр.{' '}
                        <code>/profile/vehicles</code>, <code>/profile</code>.
                        Пусто — кнопки нет.
                    </p>
                </div>
                <div className="space-y-1">
                    <Label>Текст кнопки</Label>
                    <Input
                        value={actionLabel}
                        onChange={(e) => setActionLabel(e.target.value)}
                        placeholder="Заполнить"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Пусто — «Перейти».
                    </p>
                </div>
            </div>

            <div className="space-y-1">
                <Label>Внешняя ссылка (необязательно)</Label>
                <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                />
                <p className="text-[10px] text-muted-foreground">
                    Кнопка «Подробнее» — правила, инструкция и т.п.
                </p>
            </div>

            <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                <div className="space-y-0.5">
                    <Label className="cursor-pointer">Можно закрыть</Label>
                    <p className="text-xs text-muted-foreground">
                        Выкл — экран висит, пока уведомление не отключат
                        (лимиты показов игнорируются).
                    </p>
                </div>
                <Switch checked={dismissible} onCheckedChange={setDismissible} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label>Макс. показов</Label>
                    <Input
                        type="number"
                        min={1}
                        value={maxShows}
                        onChange={(e) => setMaxShows(e.target.value)}
                        placeholder="Без лимита"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Интервал, часов</Label>
                    <Input
                        type="number"
                        min={1}
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(e.target.value)}
                        placeholder="24"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Не чаще, чем раз в N часов. Пусто — раз в сутки.
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
