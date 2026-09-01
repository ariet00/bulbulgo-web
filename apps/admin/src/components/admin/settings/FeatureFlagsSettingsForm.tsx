'use client'

import { type AdminAppFeaturesSettings } from '@/apis/admin'
import { useAdminAppFeaturesSettings } from '@/hooks/queries/admin'
import { useUpdateAdminAppFeaturesSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Switch,
} from '@doska/ui'
import { useEffect, useState, type ReactNode } from 'react'

type FlagKey = Exclude<keyof AdminAppFeaturesSettings, 'min_versions'>

const FLAGS: { key: FlagKey; title: string; description: ReactNode }[] = [
    {
        key: 'is_wallet_enabled',
        title: 'Кошелёк (раздел в профиле)',
        description: (
            <>
                <code>is_wallet_enabled</code>. Показывает пункт «Кошелёк» в
                профиле и блок баланса на экране поездки владельца.
            </>
        ),
    },
    {
        key: 'is_wallet_top_up_enabled',
        title: 'Пополнение баланса (кошелёк)',
        description: (
            <>
                <code>is_wallet_top_up_enabled</code>. Показывает форму
                пополнения и быстрые суммы на экране кошелька в BulBul Go.
            </>
        ),
    },
    {
        key: 'is_passenger_search_enabled',
        title: 'Поиск пассажиров',
        description: (
            <>
                <code>is_passenger_search_enabled</code>. Включает режим поиска
                пассажиров (для водителей) на экране поиска.
            </>
        ),
    },
    {
        key: 'map_route_preview',
        title: 'Предпросмотр маршрута на карте',
        description: (
            <>
                <code>map_route_preview</code>. Показывает предпросмотр маршрута
                на карте при создании поездки.
            </>
        ),
    },
    {
        key: 'require_verified_phone',
        title: 'Требовать подтверждённый номер (старые сборки)',
        description: (
            <>
                <code>require_verified_phone</code>. Легаси-копия флага: её
                читают только старые сборки приложения (через <code>/me</code>).
                Гейты публикации и просмотра контактов берут значение из{' '}
                <b>Правил создания</b> — переключать нужно там, здесь только для
                совместимости.
            </>
        ),
    },
    {
        key: 'phone_login_enabled',
        title: 'Вход по номеру телефона',
        description: (
            <>
                <code>phone_login_enabled</code>. Показывает кнопку «Войти по
                номеру» на экране входа и открывает эндпоинты SMS-логина.
                Выключение закрывает и API, не только кнопку.
            </>
        ),
    },
    {
        key: 'google_login_enabled',
        title: 'Вход через Google',
        description: (
            <>
                <code>google_login_enabled</code>. Показывает кнопку «Войти
                через Google» на экране входа и открывает <code>/auth/google</code>.
                Включено по умолчанию. Точечно для отдельного устройства —
                карточка устройства в «Устройствах».
            </>
        ),
    },
    {
        key: 'apple_login_enabled',
        title: 'Вход через Apple',
        description: (
            <>
                <code>apple_login_enabled</code>. Показывает кнопку «Войти
                через Apple» на экране входа и открывает <code>/auth/apple</code>.
                Включено по умолчанию. Точечно для отдельного устройства —
                карточка устройства в «Устройствах».
            </>
        ),
    },
    {
        key: 'phone_view_insights_enabled',
        title: 'Просмотры номеров',
        description: (
            <>
                <code>phone_view_insights_enabled</code>. Показывает вкладку
                «Просмотры» в приложении и шлёт владельцу пуш при первом
                открытии его номера (один пуш на объявление).
            </>
        ),
    },
    {
        key: 'phone_view_show_viewer_phone',
        title: 'Показывать телефон смотрящего',
        description: (
            <>
                <code>phone_view_show_viewer_phone</code>. В списке «кто
                смотрел» показывает номер смотрящего, а не только имя и аватар.
                Работает только при включённых «Просмотрах номеров».
            </>
        ),
    },
    {
        key: 'bookings_tab_enabled',
        title: 'Вкладка «Брони»',
        description: (
            <>
                <code>bookings_tab_enabled</code>. Показывает вкладку «Брони» в
                «Мои поездки». Выключено — заглушка «Скоро будет доступно».
            </>
        ),
    },
    {
        key: 'sort_trips_by_distance',
        title: 'Сортировка поездок по расстоянию',
        description: (
            <>
                <code>sort_trips_by_distance</code>. Ленты и списки поездок при
                наличии геопозиции клиента показывают ближние первыми.
                Выключено — сортировка только по свежести. Включено по
                умолчанию.
            </>
        ),
    },
]

const VERSION_RE = /^\d+(\.\d+)*$/

const DEFAULT_FORM: AdminAppFeaturesSettings = {
    is_wallet_top_up_enabled: false,
    is_wallet_enabled: false,
    is_passenger_search_enabled: false,
    map_route_preview: false,
    require_verified_phone: false,
    phone_login_enabled: false,
    google_login_enabled: true,
    apple_login_enabled: true,
    phone_view_insights_enabled: false,
    phone_view_show_viewer_phone: false,
    bookings_tab_enabled: false,
    sort_trips_by_distance: true,
    min_versions: {},
}

export function FeatureFlagsSettingsForm() {
    const { data, isLoading } = useAdminAppFeaturesSettings()
    const update = useUpdateAdminAppFeaturesSettings()
    const [form, setForm] = useState<AdminAppFeaturesSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm({ ...data, min_versions: data.min_versions ?? {} })
    }, [data])

    const setFlag = (key: FlagKey, value: boolean) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    const setMinVersion = (key: FlagKey, value: string) =>
        setForm((prev) => ({
            ...prev,
            min_versions: { ...prev.min_versions, [key]: value },
        }))

    const isVersionInvalid = (key: FlagKey) => {
        const v = (form.min_versions[key] ?? '').trim()
        return v !== '' && !VERSION_RE.test(v)
    }

    const hasInvalidVersion = FLAGS.some(({ key }) => isVersionInvalid(key))

    const submit = () => {
        const min_versions: Record<string, string> = {}
        for (const [key, value] of Object.entries(form.min_versions)) {
            const trimmed = value.trim()
            if (trimmed) min_versions[key] = trimmed
        }
        update.mutate({ ...form, min_versions })
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Глобальные feature-флаги для клиентов. Хранятся в Redis под
                ключом <code className="text-xs">app:features</code> и
                отдаются через <code className="text-xs">settings.features</code>{' '}
                в <code className="text-xs">GET /me</code>. Per-user override
                (<code className="text-xs">users.data.feature_overrides</code>,
                на странице пользователя) побеждает. «Мин. версия» — флаг
                работает только на мобильных клиентах этой версии и выше
                (по заголовку <code className="text-xs">X-App-Version</code>);
                пусто — на всех.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Флаги</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {FLAGS.map(({ key, title, description }) => (
                        <div
                            key={key}
                            className="space-y-2 rounded border px-3 py-2"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-0.5">
                                    <Label className="cursor-pointer">
                                        {title}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                                <Switch
                                    checked={form[key]}
                                    onCheckedChange={(v) => setFlag(key, v)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="whitespace-nowrap text-xs text-muted-foreground">
                                    Мин. версия
                                </Label>
                                <Input
                                    className="h-7 w-28 text-xs"
                                    placeholder="все версии"
                                    value={form.min_versions[key] ?? ''}
                                    onChange={(e) =>
                                        setMinVersion(key, e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                                {isVersionInvalid(key) && (
                                    <span className="text-xs text-destructive">
                                        формат: 1.0.92
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <Button
                            onClick={submit}
                            disabled={
                                isLoading ||
                                update.isPending ||
                                hasInvalidVersion
                            }
                        >
                            {update.isPending ? 'Сохранение…' : 'Сохранить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
