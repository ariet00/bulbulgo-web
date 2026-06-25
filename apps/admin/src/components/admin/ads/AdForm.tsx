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

    const handleSubmit = () => {
        const body: AdminAdCreate = {
            placement,
            image_url: imageUrl || undefined,
            action_url: actionUrl || undefined,
            action_type: 'url',
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
                            <Label>Ссылка перехода (action_url)</Label>
                            <Input
                                placeholder="https://example.com"
                                value={actionUrl}
                                onChange={(e) => setActionUrl(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Тексты (по языкам)</Label>
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
    title,
    buttonLabel,
    colors,
}: {
    placement: string
    imageUrl: string
    title: string
    buttonLabel: string
    colors: AdminAdColors
}) {
    const textBlock = (
        <div className="space-y-2 p-3">
            <div
                className="text-sm font-semibold leading-snug line-clamp-2"
                style={{ color: colors.text }}
            >
                {title || 'Заголовок'}
            </div>
            <button
                type="button"
                className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                style={{ backgroundColor: colors.button, color: colors.button_text }}
            >
                {buttonLabel || 'Кнопка'}
            </button>
        </div>
    )

    // Лента: картинка фиксированной высоты, текст снизу (как карточка поездки).
    if (placement === 'feed') {
        return (
            <div
                className="overflow-hidden rounded-2xl border"
                style={{ backgroundColor: colors.background }}
            >
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
                {textBlock}
            </div>
        )
    }

    // Контакты: квадратная карточка (как Google-слот) — фото тянется на всё место
    // над текстом, заголовок и кнопка снизу. Квадрат = фото + текст вместе.
    return (
        <div
            className="mx-auto flex w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border"
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
            <div className="shrink-0">{textBlock}</div>
        </div>
    )
}
