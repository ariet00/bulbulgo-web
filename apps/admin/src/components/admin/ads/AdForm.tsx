'use client'

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    ImageUploadInput,
    Input,
    Label,
    MultiSelect,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@doska/ui'
import { useState } from 'react'
import type { AdminAd, AdminAdColors, AdminAdCreate } from '@/apis/admin'

/** Слоты приложения — должны совпадать с apps/promotions/constants.py:Placement */
export const PLACEMENTS = [
    { value: 'contacts', label: 'Контакты — лист (квадрат)' },
    { value: 'feed', label: 'Лента — поиск поездок (большой)' },
]

const LANGS = [
    { code: 'ru', label: 'RU' },
    { code: 'ky', label: 'KY' },
    { code: 'en', label: 'EN' },
]

/** Тип действия по тапу на рекламу (поле action_type). */
const ACTION_TYPES = [
    { value: 'url', label: 'Внешняя ссылка / другое приложение' },
    { value: 'route', label: 'Внутренний экран приложения' },
    { value: 'phone', label: 'Позвонить' },
    { value: 'share', label: 'Поделиться (системное меню)' },
    { value: 'copy', label: 'Скопировать в буфер (промокод)' },
    { value: 'none', label: 'Без действия (баннер)' },
]

/**
 * Проверка и нормализация action_url под выбранный тип. Возвращает текст ошибки
 * (или null) и нормализованное значение, которое уйдёт на бэкенд — чтобы в
 * приложение попадал только валидный формат.
 */
function validateAction(
    type: string,
    raw: string,
): { error: string | null; value: string } {
    const v = raw.trim()
    switch (type) {
        case 'none':
            return { error: null, value: '' }
        case 'url':
            return /^https?:\/\/.+/i.test(v)
                ? { error: null, value: v }
                : { error: 'Ссылка должна начинаться с http:// или https://', value: v }
        case 'route':
            return /^\/[\w\-/:]*$/.test(v)
                ? { error: null, value: v }
                : { error: 'Путь экрана должен начинаться с «/» (напр. /profile/wallet)', value: v }
        case 'phone': {
            const digits = v.replace(/[\s\-()]/g, '')
            return /^\+[1-9]\d{8,14}$/.test(digits)
                ? { error: null, value: digits }
                : {
                      error: 'Номер в межд. формате с кодом страны, напр. +996700123456',
                      value: v,
                  }
        }
        case 'share':
        case 'copy':
            return v.length > 0
                ? { error: null, value: v }
                : { error: 'Поле не должно быть пустым', value: v }
        default:
            return { error: null, value: v }
    }
}

/** Подпись и плейсхолдер для поля action_url под каждый тип действия. */
const ACTION_URL_HINT: Record<string, { label: string; placeholder: string }> = {
    url: { label: 'Ссылка перехода (action_url)', placeholder: 'https://example.com' },
    phone: { label: 'Номер телефона', placeholder: '+996700123456' },
    share: { label: 'Текст для «Поделиться»', placeholder: 'Скачивай Bulbul Go: https://…' },
    copy: { label: 'Текст для копирования (промокод)', placeholder: 'BULBUL2026' },
}

/**
 * Частые внутренние экраны для action_type='route'. Пути — go_router из
 * native_apps/bulbul_go/lib/core/router/app_router.dart. Можно вписать свой путь.
 */
const APP_ROUTES = [
    { value: '/rideshare', label: 'Поездки (поиск)' },
    { value: '/rideshare/create', label: 'Создать поездку' },
    { value: '/freight', label: 'Грузы (поиск)' },
    { value: '/freight/create', label: 'Создать груз' },
    { value: '/bus', label: 'Автобусы' },
    { value: '/messages', label: 'Сообщения' },
    { value: '/profile', label: 'Профиль' },
    { value: '/profile/wallet', label: 'Кошелёк' },
    { value: '/profile/vehicles', label: 'Мои авто' },
]

const PLATFORM_OPTIONS = [
    { id: 'android', value: 'Android' },
    { id: 'ios', value: 'iOS' },
    { id: 'web', value: 'Web' },
]
const ROLE_OPTIONS = [
    { id: 'driver', value: 'Водитель' },
    { id: 'passenger', value: 'Пассажир' },
]
const TRIP_TYPE_OPTIONS = [
    { id: 'rideshare', value: 'Rideshare' },
    { id: 'taxi', value: 'Taxi' },
    { id: 'shuttle', value: 'Shuttle' },
    { id: 'bus', value: 'Bus' },
    { id: 'freight', value: 'Freight' },
]

const DEFAULT_COLORS: AdminAdColors = {
    background: '#FFFFFF',
    text: '#111111',
    button: '#2563EB',
    button_text: '#FFFFFF',
}

/** Спец-значение цвета: брать из темы приложения (адаптивно). */
const INHERIT = 'inherit'

/** По умолчанию все цвета наследуются из темы (частый кейс). */
const INHERIT_COLORS: AdminAdColors = {
    background: INHERIT,
    text: INHERIT,
    button: INHERIT,
    button_text: INHERIT,
}

/** Подставить цвета темы вместо 'inherit' — для превью. */
function resolveInherit(c: AdminAdColors, dark: boolean): AdminAdColors {
    const t = dark
        ? { background: '#1c1c22', text: '#FFFFFF', button: '#2563EB', button_text: '#FFFFFF' }
        : { background: '#FFFFFF', text: '#111111', button: '#2563EB', button_text: '#FFFFFF' }
    const p = (v: string, d: string) => (v === INHERIT ? d : v)
    return {
        background: p(c.background, t.background),
        text: p(c.text, t.text),
        button: p(c.button, t.button),
        button_text: p(c.button_text, t.button_text),
    }
}

/** Рекомендованный формат картинки под слот (размеры — под реальный рендер). */
const IMAGE_SPEC: Record<string, { ratio: string; size: string; note: string }> = {
    contacts: {
        ratio: '≈ 3:2 (горизонтальная)',
        size: '1080×720 px',
        note: 'Квадратная карточка (как Google): фото заполняет верх над текстом, его высота плавает от длины текста. Важное — по центру (обрезка cover сверху/снизу).',
    },
    feed: {
        ratio: '≈ 16:9 (горизонтальная)',
        size: '1080×600 px',
        note: 'Большой слот в ленте поиска поездок.',
    },
}

function cleanMap(map: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(map)) {
        if (v && v.trim()) out[k] = v.trim()
    }
    return out
}

/** "2026-06-03T12:00" ← ISO; для <input type="datetime-local"> */
function toLocalInput(iso: string | null | undefined): string {
    if (!iso) return ''
    return iso.slice(0, 16)
}

export interface AdFormProps {
    initial?: AdminAd
    submitting?: boolean
    submitLabel: string
    onSubmit: (body: AdminAdCreate) => void
}

export function AdForm({ initial, submitting, submitLabel, onSubmit }: AdFormProps) {
    const [placement, setPlacement] = useState(initial?.placement ?? 'contacts')
    const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
    const [actionUrl, setActionUrl] = useState(initial?.action_url ?? '')
    const [actionType, setActionType] = useState(initial?.action_type ?? 'url')
    const [googleInRotation, setGoogleInRotation] = useState(
        initial?.google_in_rotation ?? false,
    )
    const [title, setTitle] = useState<Record<string, string>>(initial?.title ?? {})
    const [buttonLabel, setButtonLabel] = useState<Record<string, string>>(
        initial?.button_label ?? {},
    )
    const [colors, setColors] = useState<AdminAdColors>(initial?.colors ?? INHERIT_COLORS)
    const [colorsDark, setColorsDark] = useState<AdminAdColors>(
        initial?.colors_dark ?? INHERIT_COLORS,
    )
    const [isActive, setIsActive] = useState(initial?.is_active ?? true)
    const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0)
    const [startsAt, setStartsAt] = useState(toLocalInput(initial?.starts_at))
    const [endsAt, setEndsAt] = useState(toLocalInput(initial?.ends_at))
    const [regions, setRegions] = useState<number[]>(initial?.targeting?.regions ?? [])
    const [tripTypes, setTripTypes] = useState<string[]>(initial?.targeting?.trip_types ?? [])
    const [roles, setRoles] = useState<string[]>(initial?.targeting?.roles ?? [])
    const [platforms, setPlatforms] = useState<string[]>(initial?.targeting?.platforms ?? [])

    const [previewLang, setPreviewLang] = useState('ru')
    const [previewDark, setPreviewDark] = useState(false)
    const [triedSubmit, setTriedSubmit] = useState(false)

    const action = validateAction(actionType, actionUrl)
    const showActionError =
        action.error !== null && (triedSubmit || actionUrl.trim().length > 0)

    const handleSubmit = () => {
        if (action.error) {
            setTriedSubmit(true)
            return
        }
        const body: AdminAdCreate = {
            placement,
            image_url: imageUrl || undefined,
            action_url: action.value || undefined,
            action_type: actionType,
            google_in_rotation: googleInRotation,
            title: cleanMap(title),
            button_label: cleanMap(buttonLabel),
            colors,
            colors_dark: colorsDark,
            targeting: {
                regions,
                trip_types: tripTypes,
                roles,
                platforms,
            },
            is_active: isActive,
            sort_order: Number(sortOrder) || 0,
            starts_at: startsAt || null,
            ends_at: endsAt || null,
        }
        onSubmit(body)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Размещение и контент</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Слот</Label>
                                <Select value={placement} onValueChange={setPlacement}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLACEMENTS.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Порядок ротации (sort_order)</Label>
                                <Input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Фото</Label>
                            <ImageUploadInput
                                value={imageUrl}
                                onChange={setImageUrl}
                                isPublic
                            />
                            <ImageGuidance placement={placement} />
                        </div>

                        <div className="space-y-2">
                            <Label>Тип действия по тапу</Label>
                            <Select value={actionType} onValueChange={setActionType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {actionType === 'none' ? null : actionType === 'route' ? (
                            <div className="space-y-2">
                                <Label>Экран приложения (action_url)</Label>
                                <Select
                                    value={
                                        APP_ROUTES.some((r) => r.value === actionUrl)
                                            ? actionUrl
                                            : ''
                                    }
                                    onValueChange={setActionUrl}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите раздел" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {APP_ROUTES.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                {r.label} ({r.value})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="или свой путь, напр. /profile/wallet"
                                    value={actionUrl}
                                    onChange={(e) => setActionUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Путь go_router, начинается с «/».
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>
                                    {(ACTION_URL_HINT[actionType] ?? ACTION_URL_HINT.url)
                                        .label}
                                </Label>
                                <Input
                                    placeholder={
                                        (ACTION_URL_HINT[actionType] ?? ACTION_URL_HINT.url)
                                            .placeholder
                                    }
                                    value={actionUrl}
                                    onChange={(e) => setActionUrl(e.target.value)}
                                />
                            </div>
                        )}

                        {showActionError && (
                            <p className="text-xs text-destructive">{action.error}</p>
                        )}

                        <p className="text-xs text-muted-foreground">
                            {actionType === 'none'
                                ? 'Баннер без действия: тап игнорируется, кнопка не показывается. Подходит для чисто информационного фото.'
                                : 'Всё объявление кликабельно — тап по фото (и по кнопке, если она есть) ведёт по действию выше. Заголовок и кнопка необязательны: оставьте их пустыми, чтобы показать только кликабельное фото.'}
                        </p>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={googleInRotation}
                                    onCheckedChange={setGoogleInRotation}
                                />
                                <Label>Добавлять Google-рекламу в ротацию слота</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Google встанет одной позицией в круговую очередь этого
                                слота (наравне с объявлениями). Настройка действует на
                                весь слот: достаточно включить у одного объявления.
                                Если своих объявлений нет — Google показывается всегда.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Тексты (по языкам) — необязательно</Label>
                            <Tabs defaultValue="ru">
                                <TabsList>
                                    {LANGS.map((l) => (
                                        <TabsTrigger key={l.code} value={l.code}>
                                            {l.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {LANGS.map((l) => (
                                    <TabsContent
                                        key={l.code}
                                        value={l.code}
                                        className="space-y-2 pt-2"
                                    >
                                        <Input
                                            placeholder={`Заголовок (${l.label})`}
                                            value={title[l.code] ?? ''}
                                            onChange={(e) =>
                                                setTitle((t) => ({
                                                    ...t,
                                                    [l.code]: e.target.value,
                                                }))
                                            }
                                        />
                                        <Input
                                            placeholder={`Текст кнопки (${l.label})`}
                                            value={buttonLabel[l.code] ?? ''}
                                            onChange={(e) =>
                                                setButtonLabel((b) => ({
                                                    ...b,
                                                    [l.code]: e.target.value,
                                                }))
                                            }
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Цвета</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <ColorField
                            label="Фон"
                            value={colors.background}
                            defaultColor={DEFAULT_COLORS.background}
                            onChange={(v) => setColors((c) => ({ ...c, background: v }))}
                        />
                        <ColorField
                            label="Текст"
                            value={colors.text}
                            defaultColor={DEFAULT_COLORS.text}
                            onChange={(v) => setColors((c) => ({ ...c, text: v }))}
                        />
                        <ColorField
                            label="Кнопка"
                            value={colors.button}
                            defaultColor={DEFAULT_COLORS.button}
                            onChange={(v) => setColors((c) => ({ ...c, button: v }))}
                        />
                        <ColorField
                            label="Текст кнопки"
                            value={colors.button_text}
                            defaultColor={DEFAULT_COLORS.button_text}
                            onChange={(v) => setColors((c) => ({ ...c, button_text: v }))}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Цвета — тёмная тема</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <ColorField
                            label="Фон"
                            value={colorsDark.background}
                            defaultColor={DEFAULT_COLORS.background}
                            onChange={(v) =>
                                setColorsDark((c) => ({ ...c, background: v }))
                            }
                        />
                        <ColorField
                            label="Текст"
                            value={colorsDark.text}
                            defaultColor={DEFAULT_COLORS.text}
                            onChange={(v) => setColorsDark((c) => ({ ...c, text: v }))}
                        />
                        <ColorField
                            label="Кнопка"
                            value={colorsDark.button}
                            defaultColor={DEFAULT_COLORS.button}
                            onChange={(v) => setColorsDark((c) => ({ ...c, button: v }))}
                        />
                        <ColorField
                            label="Текст кнопки"
                            value={colorsDark.button_text}
                            defaultColor={DEFAULT_COLORS.button_text}
                            onChange={(v) =>
                                setColorsDark((c) => ({ ...c, button_text: v }))
                            }
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Таргетинг и показ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Пустое условие = показывать всем.
                        </p>
                        <div className="space-y-2">
                            <Label>Платформы</Label>
                            <MultiSelect
                                options={PLATFORM_OPTIONS}
                                selected={platforms}
                                onChange={(v) => setPlatforms(v as string[])}
                                placeholder="Все платформы"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Роли</Label>
                            <MultiSelect
                                options={ROLE_OPTIONS}
                                selected={roles}
                                onChange={(v) => setRoles(v as string[])}
                                placeholder="Все роли"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Типы поездок</Label>
                            <MultiSelect
                                options={TRIP_TYPE_OPTIONS}
                                selected={tripTypes}
                                onChange={(v) => setTripTypes(v as string[])}
                                placeholder="Все типы"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Регионы (ID через запятую)</Label>
                            <Input
                                placeholder="напр. 1, 5, 12"
                                value={regions.join(', ')}
                                onChange={(e) =>
                                    setRegions(
                                        e.target.value
                                            .split(',')
                                            .map((s) => Number(s.trim()))
                                            .filter((n) => Number.isFinite(n) && n > 0),
                                    )
                                }
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Показ с</Label>
                                <Input
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Показ до</Label>
                                <Input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                            <Label>Активна</Label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Превью + сабмит */}
            <div className="space-y-4">
                <Card className="sticky top-4">
                    <CardHeader>
                        <CardTitle>Превью</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Select value={previewLang} onValueChange={setPreviewLang}>
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGS.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>
                                            {l.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="ml-auto flex items-center gap-2">
                                <Switch checked={previewDark} onCheckedChange={setPreviewDark} />
                                <Label>Тёмная</Label>
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-3"
                            style={{ backgroundColor: previewDark ? '#0b0b0f' : '#f3f4f6' }}
                        >
                            <AdPreview
                                placement={placement}
                                imageUrl={imageUrl}
                                actionType={actionType}
                                title={title[previewLang] || title.ru || ''}
                                buttonLabel={buttonLabel[previewLang] || buttonLabel.ru || ''}
                                colors={resolveInherit(
                                    previewDark ? colorsDark : colors,
                                    previewDark,
                                )}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitLabel}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ImageGuidance({ placement }: { placement: string }) {
    const spec = IMAGE_SPEC[placement] ?? IMAGE_SPEC.contacts
    return (
        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">Рекомендации по фото</div>
            <div>
                • Размер: <span className="font-medium">{spec.size}</span>, соотношение{' '}
                <span className="font-medium">{spec.ratio}</span>. {spec.note}
            </div>
            <div>• Минимальная ширина 640 px (лучше 1080 — чётко на retina).</div>
            <div>• Формат JPG / PNG / WebP, до ~2 МБ (сервер сожмёт в JPEG).</div>
            <div>
                • Важное — по центру: фото масштабируется под слот с обрезкой (cover),
                края могут срезаться.
            </div>
            <div>
                • Текст лучше задавать полями «Заголовок» и «Кнопка», а не вшивать в
                картинку (он не подстроится под тему/локаль).
            </div>
        </div>
    )
}

function ColorField({
    label,
    value,
    onChange,
    defaultColor = '#FFFFFF',
}: {
    label: string
    value: string
    onChange: (v: string) => void
    defaultColor?: string
}) {
    const isInherit = value === INHERIT
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={isInherit}
                        onChange={(e) =>
                            onChange(e.target.checked ? INHERIT : defaultColor)
                        }
                    />
                    Из темы
                </label>
            </div>
            {isInherit ? (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Наследуется из темы приложения (адаптивно к светлой/тёмной).
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                    />
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="font-mono"
                    />
                </div>
            )}
        </div>
    )
}

function AdPreview({
    placement,
    imageUrl,
    actionType,
    title,
    buttonLabel,
    colors,
}: {
    placement: string
    imageUrl: string
    actionType: string
    title: string
    buttonLabel: string
    colors: AdminAdColors
}) {
    // 'none' — баннер без действия: тапа и кнопки нет (как в приложении).
    const isInteractive = actionType !== 'none'
    const hasTitle = title.trim() !== ''
    const hasButton = isInteractive && buttonLabel.trim() !== ''
    // Нет ни заголовка, ни кнопки → текстовый блок не рисуем (баннер «только
    // фото»), как и в native_apps/.../custom_ad_widget.dart.
    const hasText = hasTitle || hasButton
    // Кликабельное фото без текста — маленький бейдж, чтобы было видно, что тап
    // по самой картинке ведёт по действию.
    const photoClickable = isInteractive && !hasText
    const textBlock = hasText ? (
        <div className="space-y-2 p-3">
            {hasTitle && (
                <div
                    className="text-sm font-semibold leading-snug line-clamp-2"
                    style={{ color: colors.text }}
                >
                    {title}
                </div>
            )}
            {hasButton && (
                <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: colors.button, color: colors.button_text }}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    ) : null
    const clickBadge = photoClickable ? (
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
            фото кликабельно
        </span>
    ) : null

    // Лента: картинка фиксированной высоты, текст снизу (как карточка поездки).
    if (placement === 'feed') {
        return (
            <div
                className="overflow-hidden rounded-2xl border"
                style={{ backgroundColor: colors.background }}
            >
                <div className="relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-44 w-full object-cover" />
                    ) : (
                        <div
                            className="flex h-44 w-full items-center justify-center text-xs opacity-50"
                            style={{ color: colors.text }}
                        >
                            нет фото
                        </div>
                    )}
                    {clickBadge}
                </div>
                {textBlock}
            </div>
        )
    }

    // Контакты: квадратная карточка (как Google-слот) — фото тянется на всё место
    // над текстом, заголовок и кнопка снизу. Квадрат = фото + текст вместе.
    return (
        <div
            className="relative mx-auto flex w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border"
            style={{ aspectRatio: '380 / 370', backgroundColor: colors.background }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt=""
                    className="min-h-0 w-full flex-1 object-cover"
                />
            ) : (
                <div
                    className="flex min-h-0 w-full flex-1 items-center justify-center text-xs opacity-50"
                    style={{ color: colors.text }}
                >
                    нет фото
                </div>
            )}
            {clickBadge}
            {textBlock && <div className="shrink-0">{textBlock}</div>}
        </div>
    )
}
