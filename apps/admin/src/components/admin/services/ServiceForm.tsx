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
import type {
    AdminService,
    AdminServiceCreate,
    AdminServiceNavItem,
    LocalizedText,
} from '@/apis/admin'

const LANGS = [
    { code: 'ru', name: 'RU' },
    { code: 'ky', name: 'KY' },
    { code: 'en', name: 'EN' },
]

const NO_BADGE = '__none__'

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

function LocalizedInputs({
    value,
    onChange,
    label,
}: {
    value: LocalizedText
    onChange: (next: LocalizedText) => void
    label: string
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="grid grid-cols-3 gap-2">
                {LANGS.map((l) => (
                    <div key={l.code} className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground">
                            {l.name}
                        </span>
                        <Input
                            value={value?.[l.code] ?? ''}
                            onChange={(e) => {
                                const next = { ...(value ?? {}) }
                                if (e.target.value) next[l.code] = e.target.value
                                else delete next[l.code]
                                onChange(next)
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

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
    const [category, setCategory] = useState<LocalizedText>(
        initial?.category ?? {},
    )
    const [icon, setIcon] = useState(initial?.icon ?? '')
    const [badge, setBadge] = useState(initial?.badge ?? NO_BADGE)
    const [showInTabs, setShowInTabs] = useState(initial?.show_in_tabs ?? true)
    const [url, setUrl] = useState(initial?.url ?? '')
    const [auth, setAuth] = useState(initial?.auth ?? false)
    const [appBar, setAppBar] = useState(initial?.app_bar ?? true)
    const [navItems, setNavItems] = useState<AdminServiceNavItem[]>(
        initial?.nav_items?.map((i) => ({ ...i })) ?? [],
    )
    const [enabled, setEnabled] = useState(initial?.enabled ?? true)
    const [position, setPosition] = useState(initial?.position ?? 0)

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
            category,
            icon: icon.trim() || null,
            badge: badge === NO_BADGE ? null : (badge as 'new' | 'soon'),
            show_in_tabs: showInTabs,
            url: type === 'webview' ? url.trim() : null,
            auth: type === 'webview' ? auth : false,
            app_bar: type === 'webview' ? appBar : true,
            nav_items:
                type === 'webview' ? navItems.filter((i) => i.value.trim()) : [],
            enabled,
            position,
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
                    <LocalizedInputs
                        value={category}
                        onChange={setCategory}
                        label="Категория (группа на «Главной»; пусто — «Другое»)"
                    />

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
                        <Label>Иконка (URL картинки)</Label>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="https://…  (пусто для нативных — иконка в приложении)"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <Label>Показывать в табах</Label>
                            <p className="text-xs text-muted-foreground">
                                Выключено — сервис доступен только с «Главной»
                            </p>
                        </div>
                        <Switch checked={showInTabs} onCheckedChange={setShowInTabs} />
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
