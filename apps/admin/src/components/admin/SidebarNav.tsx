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
    Car,
    ChevronRight,
    Coins,
    Database,
    ClipboardList,
    Flag,
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
    Settings as SettingsIcon,
    ShieldBan,
    Smartphone,
    Star,
    Tags,
    Timer,
    Trophy,
    UserCog,
    Users,
} from 'lucide-react'
import { cn } from '@doska/shared'

type NavItem = { name: string; href: string; icon: typeof LayoutDashboard }
type NavSection = { label?: string; items: NavItem[] }

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
        items: [
            { name: 'Celery', href: '/admin/celery', icon: Timer },
            { name: 'Сидеры', href: '/admin/seeders', icon: Database },
        ],
    },
    {
        label: 'Common',
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
        items: [
            { name: 'Категории', href: '/admin/marketplace/categories', icon: FolderTree },
            { name: 'Атрибуты', href: '/admin/marketplace/attributes', icon: Tags },
            { name: 'Объявления', href: '/admin/marketplace/listings', icon: ClipboardList },
        ],
    },
    {
        label: 'Analytics',
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
        items: [
            { name: 'Метки топлива', href: '/admin/fuel/reports', icon: Fuel },
            { name: 'АЗС', href: '/admin/fuel/stations', icon: MapPin },
            { name: 'Баллы', href: '/admin/fuel/settings', icon: Trophy },
        ],
    },
    {
        // Всё, что про Telegram: сами боты, каналы парсера и модерация групп.
        label: 'Telegram',
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
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-4 space-y-2">
            {sections.map((section, idx) => {
                const isOpen = section.label ? !!openSections[section.label] : true

                return (
                    <div key={section.label ?? idx} className="space-y-1">
                        {section.label && (
                            <button
                                type="button"
                                onClick={() => toggleSection(section.label!)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors"
                            >
                                <ChevronRight
                                    className={cn(
                                        'h-3 w-3 shrink-0 transition-transform',
                                        isOpen && 'rotate-90',
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="truncate">{section.label}</span>
                            </button>
                        )}
                        {isOpen &&
                            section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={cn(
                                        'flex items-center px-4 py-2 text-sm font-medium rounded-md group transition-colors',
                                        isActive(item.href)
                                            ? 'bg-gray-800 dark:bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                                    {item.name}
                                </Link>
                            ))}
                    </div>
                )
            })}
        </nav>
    )
}
