'use client'

import { useState } from 'react'
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
    Switch,
} from '@doska/ui'
import { Plus, Trash2 } from 'lucide-react'
import { useAdminServiceGroups, useAdminServices } from '@/hooks/queries/admin'
import { LocalizedInputs } from './LocalizedInputs'
import { IconColorInput } from './IconColorInput'
import type {
    AdminService,
    AdminServiceCreate,
    AdminServiceNavItem,
    FeedTemplate,
    LocalizedText,
} from '@/apis/admin'
import {
    FEED_TEMPLATE_LABELS,
    FEED_TEMPLATES,
    HOME_FEED_PARENT_SLUG,
} from '@/apis/admin'

const NO_BADGE = '__none__'
const NO_GROUP = '__ungrouped__'
const NO_PARENT = '__root__'
const NO_TEMPLATE = '__builtin__'
const NO_FEED_SERVICE = '__none__'

// Зеркало AppService._icons (app_service.dart): имена — свои, приложение
// рисует их своими значками. Новое имя работает только после релиза
// приложения — старые сборки его молча проигнорируют (и падают на фолбэк:
// иконка сервиса, а затем первая буква названия).
const SERVICE_ICONS = [
    'car',
    'garage',
    'sell',
    'bus',
    'truck',
    'apartment',
    'work',
    'tools',
    'calendar',
    'package',
    'store',
    'news',
    'fuel',
    'grid',
    'wallet',
    'chat',
    'star',
    'heart',
    'bolt',
    'phone',
    'map',
    'pin',
    'route',
    'ticket',
    'gift',
    'cart',
    'money',
    'card',
    'key',
    'home',
    'bank',
    'school',
    'shield',
    'support',
    'camera',
    'sofa',
    'wrench',
    'box',
    'pet',
    'megaphone',
]

// Синхронно с ServiceNavItem._icons во Flutter (app_service.dart)
const NAV_ICONS = [
    'home',
    'search',
    'person',
    'chat',
    'list',
    'add',
    'star',
    'info',
    'calendar',
    'cart',
    'wallet',
    'grid',
]


type Props = {
    /** present → edit (slug/type заблокированы); absent → create */
    initial?: AdminService
    submitLabel: string
    submitting: boolean
    onSubmit: (body: AdminServiceCreate) => void
}

export function ServiceForm({ initial, submitLabel, submitting, onSubmit }: Props) {
    const isEdit = !!initial
    const [slug, setSlug] = useState(initial?.slug ?? '')
    const [type, setType] = useState<'native' | 'webview'>(
        initial?.type ?? 'webview',
    )
    const [label, setLabel] = useState<LocalizedText>(initial?.label ?? {})
    const [description, setDescription] = useState<LocalizedText>(
        initial?.description ?? {},
    )
    const [icon, setIcon] = useState(initial?.icon ?? '')
    const [color, setColor] = useState(initial?.color ?? '')
    const [badge, setBadge] = useState(initial?.badge ?? NO_BADGE)
    const [showInTabs, setShowInTabs] = useState(initial?.show_in_tabs ?? true)
    const [hidden, setHidden] = useState(initial?.hidden ?? false)
    const [url, setUrl] = useState(initial?.url ?? '')
    const [auth, setAuth] = useState(initial?.auth ?? false)
    const [appBar, setAppBar] = useState(initial?.app_bar ?? true)
    const [navItems, setNavItems] = useState<AdminServiceNavItem[]>(
        initial?.nav_items?.map((i) => ({ ...i })) ?? [],
    )
    const [enabled, setEnabled] = useState(initial?.enabled ?? true)
    const [position, setPosition] = useState(initial?.position ?? 0)
    // Группа у сервиса одна — поэтому она и правится здесь, а не галочками на
    // странице групп (там остаётся порядок внутри группы).
    const [group, setGroup] = useState(initial?.group ?? NO_GROUP)
    const { data: groups } = useAdminServiceGroups()
    const [parent, setParent] = useState(initial?.parent_slug ?? NO_PARENT)
    // Чип ленты «Главной»: куда ведёт блок и каким шаблоном он нарисован.
    const [feedService, setFeedService] = useState(
        initial?.service ?? NO_FEED_SERVICE,
    )
    const [template, setTemplate] = useState<string>(
        initial?.template ?? NO_TEMPLATE,
    )
    const { data: allServices } = useAdminServices()
    // Кандидаты в родители: корневые сервисы (вложенность один уровень),
    // кроме самого редактируемого.
    const parentOptions = (allServices ?? []).filter(
        (s) => !s.parent_slug && s.slug !== initial?.slug,
    )
    const isChild = parent !== NO_PARENT
    const isFeedChip = parent === HOME_FEED_PARENT_SLUG
    // Куда чип может вести — любой корневой сервис реестра.
    const feedTargets = parentOptions

    const addNavItem = () =>
        setNavItems((p) => [
            ...p,
            { label: {}, icon: 'home', kind: 'url', value: '' },
        ])
    const updateNavItem = (i: number, patch: Partial<AdminServiceNavItem>) =>
        setNavItems((p) =>
            p.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
        )
    const removeNavItem = (i: number) =>
        setNavItems((p) => p.filter((_, idx) => idx !== i))

    const canSubmit =
        !submitting &&
        (isEdit || !!slug.trim()) &&
        (type !== 'webview' || !!url.trim())

    const submit = () => {
        if (!canSubmit) return
        onSubmit({
            slug: slug.trim(),
            type,
            label,
            description,
            icon: icon.trim() || null,
            color: color.trim() || null,
            badge: badge === NO_BADGE ? null : (badge as 'new' | 'soon' | 'hit'),
            show_in_tabs: showInTabs,
            hidden,
            url: type === 'webview' ? url.trim() : null,
            auth: type === 'webview' ? auth : false,
            app_bar: type === 'webview' ? appBar : true,
            nav_items:
                type === 'webview' ? navItems.filter((i) => i.value.trim()) : [],
            enabled,
            position,
            // у дочернего сервиса группы «Главной» не бывает
            group: isChild || group === NO_GROUP ? null : group,
            parent_slug: isChild ? parent : null,
            // Поля ленты держим только на чипах: у обычной карточки они
            // ничего не значат и только путали бы в базе.
            service:
                isFeedChip && feedService !== NO_FEED_SERVICE
                    ? feedService
                    : null,
            template:
                isFeedChip && template !== NO_TEMPLATE
                    ? (template as FeedTemplate)
                    : null,
        })
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="my_service"
                                disabled={isEdit}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Тип</Label>
                            <Select
                                value={type}
                                onValueChange={(v) =>
                                    setType(v as 'native' | 'webview')
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="webview">Webview</SelectItem>
                                    <SelectItem value="native">Нативный</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <LocalizedInputs value={label} onChange={setLabel} label="Название" />
                    <LocalizedInputs
                        value={description}
                        onChange={setDescription}
                        label="Описание"
                    />
                    <IconColorInput value={color} onChange={setColor} />
                    <p className="-mt-2 text-xs text-muted-foreground">
                        «Главная» сейчас рисует значки одним акцентным цветом —
                        это поле на неё не влияет.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Бейдж</Label>
                            <Select value={badge} onValueChange={setBadge}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_BADGE}>Без бейджа</SelectItem>
                                    <SelectItem value="new">NEW</SelectItem>
                                    <SelectItem value="soon">СКОРО</SelectItem>
                                    <SelectItem value="hit">ХИТ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Позиция</Label>
                            <Input
                                type="number"
                                value={position}
                                onChange={(e) => setPosition(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Родитель</Label>
                        <Select value={parent} onValueChange={setParent}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_PARENT}>
                                    Нет — карточка «Главной»
                                </SelectItem>
                                {parentOptions.map((s) => (
                                    <SelectItem key={s.slug} value={s.slug}>
                                        {s.label?.ru ?? s.slug}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            С родителем сервис становится плиткой раздела
                            («Что можно сделать» внутри продукта) и на
                            «Главной» не показывается.
                        </p>
                    </div>

                    {isFeedChip && (
                        <div className="space-y-4 rounded-md border p-3">
                            <div className="space-y-1.5">
                                <Label>Сервис блока</Label>
                                <Select
                                    value={feedService}
                                    onValueChange={setFeedService}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_FEED_SERVICE}>
                                            Не выбран
                                        </SelectItem>
                                        {feedTargets.map((s) => (
                                            <SelectItem key={s.slug} value={s.slug}>
                                                {s.label?.ru ?? s.slug}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Куда ведёт блок под чипом: нативный продукт
                                    открывается своим экраном, webview-сервис —
                                    вебвью.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Шаблон блока</Label>
                                <Select value={template} onValueChange={setTemplate}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_TEMPLATE}>
                                            Без шаблона — блок вшит в приложение
                                        </SelectItem>
                                        {FEED_TEMPLATES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {FEED_TEMPLATE_LABELS[t]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    С шаблоном чип появляется в ленте без релиза
                                    приложения: шапка блока — название, описание
                                    и значок самого чипа, а список под ней бэк
                                    отдаёт по слагу сервиса. Данных у сервиса
                                    ещё нет — остаётся одна шапка с переходом.
                                    Без шаблона контент берётся из приложения по
                                    slug'у чипа (попутки, недвижимость,
                                    грузовые, авторынок) — незнакомый slug
                                    приложение пропустит.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isChild && (
                        <div className="space-y-1.5">
                            <Label>Группа</Label>
                            <Select value={group} onValueChange={setGroup}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_GROUP}>Без группы</SelectItem>
                                    {groups?.groups.map((g) => (
                                        <SelectItem key={g.slug} value={g.slug}>
                                            {g.label?.ru ?? g.slug}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Группа одна на сервис — выбор новой переносит его из
                                прежней. На «Главной» секции сейчас не рисуются:
                                сервисы идут одной сеткой.
                            </p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label>Иконка</Label>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="https://… или имя значка (пусто — иконка из приложения)"
                        />
                        <div className="flex flex-wrap gap-1">
                            {SERVICE_ICONS.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setIcon(name)}
                                    className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                                        icon === name
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Имя значка рисуется самим приложением — картинку
                            хостить не нужно. Своя картинка задаётся полным URL.
                        </p>
                    </div>

                    {!isChild && (
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <Label>Показывать в табах</Label>
                                <p className="text-xs text-muted-foreground">
                                    Выключено — сервис доступен только с «Главной»
                                </p>
                            </div>
                            <Switch checked={showInTabs} onCheckedChange={setShowInTabs} />
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <Label>Скрыт из списка</Label>
                            <p className="text-xs text-muted-foreground">
                                Нет ни на «Главной», ни в табах — открывается
                                только по диплинку или переходу из приложения
                            </p>
                        </div>
                        <Switch checked={hidden} onCheckedChange={setHidden} />
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <Label>Включён</Label>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>
                </CardContent>
            </Card>

            {type === 'webview' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Webview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>URL страницы</Label>
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/service"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <Label>Авторизация</Label>
                                <p className="text-xs text-muted-foreground">
                                    Открывать с одноразовым кодом входа (?code=…)
                                </p>
                            </div>
                            <Switch checked={auth} onCheckedChange={setAuth} />
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <Label>Нативная шапка</Label>
                                <p className="text-xs text-muted-foreground">
                                    Выкл — страница рисует свой заголовок и кнопку
                                    закрытия сама (мостовой close)
                                </p>
                            </div>
                            <Switch checked={appBar} onCheckedChange={setAppBar} />
                        </div>

                        <div className="space-y-2 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Нижняя навигация</Label>
                                    <p className="text-xs text-muted-foreground">
                                        «Страница» грузит URL в вебвью, «Экран» открывает
                                        нативный роут приложения. Панель видна от 2 пунктов.
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={addNavItem}>
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                            {navItems.map((item, i) => (
                                <div key={i} className="space-y-2 rounded-md border p-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Название (RU)"
                                            value={item.label?.ru ?? ''}
                                            onChange={(e) =>
                                                updateNavItem(i, {
                                                    label: {
                                                        ...item.label,
                                                        ru: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <Select
                                            value={item.icon}
                                            onValueChange={(v) =>
                                                updateNavItem(i, { icon: v })
                                            }
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {NAV_ICONS.map((name) => (
                                                    <SelectItem key={name} value={name}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeNavItem(i)}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Select
                                            value={item.kind}
                                            onValueChange={(v) =>
                                                updateNavItem(i, {
                                                    kind: v as 'url' | 'route',
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="url">Страница</SelectItem>
                                                <SelectItem value="route">Экран</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder={
                                                item.kind === 'route'
                                                    ? '/profile'
                                                    : 'https://…'
                                            }
                                            value={item.value}
                                            onChange={(e) =>
                                                updateNavItem(i, { value: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button onClick={submit} disabled={!canSubmit}>
                {submitLabel}
            </Button>
        </div>
    )
}
