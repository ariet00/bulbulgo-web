'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Activity,
    AlertTriangle,
    BarChart,
    Bell,
    BellRing,
    Bot,
    Boxes,
    Car,
    ChartColumn,
    ChevronRight,
    Coins,
    Database,
    ClipboardList,
    Flag,
    FlaskConical,
    FolderTree,
    Fuel,
    Gift,
    Headset,
    LayoutDashboard,
    LayoutGrid,
    LineChart,
    List,
    MapPin,
    Megaphone,
    MessageSquare,
    Newspaper,
    Radio,
    Route,
    Send,
    Settings as SettingsIcon,
    ShieldBan,
    Smartphone,
    Star,
    Store,
    Tags,
    Timer,
    Trophy,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react'
import { cn } from '@doska/shared'

type NavItem = { name: string; href: string; icon: typeof LayoutDashboard }
type NavSection = { label?: string; icon?: typeof LayoutDashboard; items: NavItem[] }

// Раскрытые/свёрнутые группы переживают перезагрузку страницы.
const OPEN_SECTIONS_KEY = 'admin:sidebar:open-sections'

const sections: NavSection[] = [
    {
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Ops',
        icon: Wrench,
        items: [
            { name: 'Celery', href: '/admin/celery', icon: Timer },
            { name: 'Сидеры', href: '/admin/seeders', icon: Database },
        ],
    },
    {
        label: 'Common',
        icon: Boxes,
        items: [
            { name: 'Users', href: '/admin/users', icon: Users },
            { name: 'Устройства', href: '/admin/devices', icon: Smartphone },
            { name: 'Companies', href: '/admin/companies', icon: BarChart },
            { name: 'Regions', href: '/admin/regions', icon: MapPin },
            { name: 'Валюты', href: '/admin/currencies', icon: Coins },
            { name: 'Notifications', href: '/admin/notifications', icon: Bell },
            { name: 'Ads', href: '/admin/ads', icon: Megaphone },
            { name: 'Сервисы', href: '/admin/services', icon: LayoutGrid },
            { name: 'Жалобы', href: '/admin/complaints', icon: Flag },
            { name: 'Отзывы', href: '/admin/reviews', icon: Star },
            { name: 'Общие настройки', href: '/admin/common/settings', icon: SettingsIcon },
        ],
    },
    {
        label: 'Маркетплейс',
        icon: Store,
        items: [
            { name: 'Категории', href: '/admin/marketplace/categories', icon: FolderTree },
            { name: 'Атрибуты', href: '/admin/marketplace/attributes', icon: Tags },
            { name: 'Объявления', href: '/admin/marketplace/listings', icon: ClipboardList },
        ],
    },
    {
        label: 'Analytics',
        icon: ChartColumn,
        items: [
            { name: 'Обзор', href: '/admin/analytics/overview', icon: LineChart },
            { name: 'BulBul Go', href: '/admin/analytics/bulbulgo', icon: LineChart },
            { name: 'Версии', href: '/admin/analytics/versions', icon: LineChart },
            { name: 'Ошибки', href: '/admin/analytics/errors', icon: AlertTriangle },
            { name: 'События', href: '/admin/analytics/events', icon: Activity },
            { name: 'Отчёты', href: '/admin/reports', icon: ClipboardList },
        ],
    },
    {
        label: 'BulBul Go',
        icon: Route,
        items: [
            { name: 'Trips', href: '/admin/trips', icon: List },
            { name: 'Подписки', href: '/admin/subscriptions', icon: BellRing },
            { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
            { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
            { name: 'Поддержка', href: '/admin/support', icon: Headset },
            { name: 'Новости', href: '/admin/news', icon: Newspaper },
            { name: 'Рефералы', href: '/admin/referral', icon: Gift },
            { name: 'Настройки', href: '/admin/settings', icon: SettingsIcon },
        ],
    },
    {
        label: 'Где Бензин',
        icon: Fuel,
        items: [
            { name: 'Метки топлива', href: '/admin/fuel/reports', icon: Fuel },
            { name: 'АЗС', href: '/admin/fuel/stations', icon: MapPin },
            { name: 'Баллы', href: '/admin/fuel/settings', icon: Trophy },
        ],
    },
    {
        // Всё, что про Telegram: сами боты, каналы парсера и модерация групп.
        label: 'Telegram',
        icon: Send,
        items: [
            { name: 'Боты', href: '/admin/booking/bots', icon: Bot },
            { name: 'Каналы', href: '/admin/telegram/channels', icon: Radio },
            { name: 'Модерация групп', href: '/admin/moderation', icon: ShieldBan },
        ],
    },
    {
        // Внутренний кабинет продвижения (apps/tglab) — здесь только операторы,
        // сама работа идёт в отдельном приложении @doska/tglab.
        label: 'Tglab',
        icon: FlaskConical,
        items: [
            { name: 'Операторы', href: '/admin/tglab', icon: UserCog },
        ],
    },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === '/admin'
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

    // Группа текущей страницы всегда раскрыта — иначе активный пункт не видно.
    const activeLabel = useMemo(
        () =>
            sections.find(
                (section) =>
                    section.label && section.items.some((item) => isActive(item.href)),
            )?.label,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pathname],
    )

    // На сервере localStorage нет, поэтому стартуем с детерминированного
    // состояния (открыта только активная группа) и подмешиваем сохранённое
    // после монтирования — иначе будет расхождение гидратации.
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        activeLabel ? { [activeLabel]: true } : {},
    )

    useEffect(() => {
        try {
            const saved = localStorage.getItem(OPEN_SECTIONS_KEY)
            if (saved) {
                setOpenSections(JSON.parse(saved) as Record<string, boolean>)
            }
        } catch {
            // приватный режим / битый JSON — остаёмся на дефолте
        }
    }, [])

    useEffect(() => {
        if (!activeLabel) return
        setOpenSections((prev) =>
            prev[activeLabel] ? prev : { ...prev, [activeLabel]: true },
        )
    }, [activeLabel])

    const toggleSection = (label: string) =>
        setOpenSections((prev) => {
            const next = { ...prev, [label]: !prev[label] }
            try {
                localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(next))
            } catch {
                // запись недоступна — состояние просто не переживёт перезагрузку
            }
            return next
        })

    return (
        <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-1">
            {sections.map((section, idx) => {
                const isOpen = section.label ? !!openSections[section.label] : true
                const hasActive = section.label === activeLabel

                const items = section.items.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center px-3 py-2 text-sm rounded-md group transition-colors',
                            isActive(item.href)
                                ? 'bg-gray-800 dark:bg-gray-800 text-white font-medium'
                                : 'text-gray-400 hover:bg-gray-800/70 hover:text-white',
                        )}
                    >
                        <item.icon className="mr-2.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                    </Link>
                ))

                return (
                    <div key={section.label ?? idx}>
                        {section.label ? (
                            <>
                                {/* Заголовок — полоса во всю ширину с разделителем:
                                    так секция читается как шапка, а не как пункт */}
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.label!)}
                                    aria-expanded={isOpen}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 border-b border-gray-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-gray-800/50 hover:text-white',
                                        hasActive ? 'text-white' : 'text-gray-400',
                                    )}
                                >
                                    {section.icon && (
                                        <section.icon
                                            className="h-4 w-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span className="flex-1 truncate text-left">
                                        {section.label}
                                    </span>
                                    <ChevronRight
                                        className={cn(
                                            'h-3.5 w-3.5 shrink-0 transition-transform',
                                            isOpen && 'rotate-90',
                                        )}
                                        aria-hidden="true"
                                    />
                                </button>
                                {isOpen && (
                                    // Пункты уходят вправо под направляющую —
                                    // видно, что они принадлежат секции
                                    <div className="my-1 ml-6 space-y-0.5 border-l border-gray-800 pl-2 pr-2">
                                        {items}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-0.5 px-2 pb-1">{items}</div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
