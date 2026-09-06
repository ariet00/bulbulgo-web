'use client'

import {
    Banknote,
    Box,
    Briefcase,
    Building2,
    Bus,
    Calendar,
    CalendarCheck,
    Camera,
    Car,
    CarFront,
    CirclePlus,
    ClipboardList,
    CreditCard,
    Fuel,
    Gift,
    Hammer,
    Headset,
    Heart,
    House,
    Info,
    Key,
    Landmark,
    LayoutGrid,
    Map,
    MapPin,
    Megaphone,
    MessageCircle,
    Newspaper,
    Package,
    PawPrint,
    Phone,
    Route,
    School,
    Search,
    ShieldCheck,
    ShoppingCart,
    Sofa,
    Star,
    Store,
    Tag,
    Ticket,
    Truck,
    User,
    Wallet,
    Wrench,
    Zap,
    type LucideIcon,
} from 'lucide-react'

/**
 * Имя значка → глиф. Зеркало ``AppService._icons`` (app_service.dart): имена
 * свои и лежат в БД, а набор у клиента — Tabler, поэтому здесь подобраны
 * ближайшие lucide-аналоги: админке нужно узнавание, а не пиксель в пиксель.
 * Новое имя заработает только после релиза приложения — старые сборки
 * молча свалятся на свой фолбэк.
 */
export const SERVICE_ICON_GLYPHS: Record<string, LucideIcon> = {
    car: Car,
    garage: CarFront,
    sell: Tag,
    bus: Bus,
    truck: Truck,
    apartment: Building2,
    work: Briefcase,
    tools: Hammer,
    calendar: CalendarCheck,
    package: Package,
    store: Store,
    news: Newspaper,
    fuel: Fuel,
    grid: LayoutGrid,
    wallet: Wallet,
    chat: MessageCircle,
    star: Star,
    heart: Heart,
    bolt: Zap,
    phone: Phone,
    map: Map,
    pin: MapPin,
    route: Route,
    ticket: Ticket,
    gift: Gift,
    cart: ShoppingCart,
    money: Banknote,
    card: CreditCard,
    key: Key,
    home: House,
    bank: Landmark,
    school: School,
    shield: ShieldCheck,
    support: Headset,
    camera: Camera,
    sofa: Sofa,
    wrench: Wrench,
    box: Box,
    pet: PawPrint,
    megaphone: Megaphone,
}

/** Имена набора — то, что админка кладёт в ``data.icon``. */
export const SERVICE_ICONS = Object.keys(SERVICE_ICON_GLYPHS)

/** Зеркало ``ServiceNavItem._icons`` (app_service.dart). */
export const NAV_ICON_GLYPHS: Record<string, LucideIcon> = {
    home: House,
    search: Search,
    person: User,
    chat: MessageCircle,
    list: ClipboardList,
    add: CirclePlus,
    star: Star,
    info: Info,
    calendar: Calendar,
    cart: ShoppingCart,
    wallet: Wallet,
    grid: LayoutGrid,
}

export const NAV_ICONS = Object.keys(NAV_ICON_GLYPHS)

/** true — в поле лежит адрес картинки, а не имя значка (как hasIconUrl). */
export const isIconUrl = (icon?: string | null) =>
    !!icon && /^https?:\/\//i.test(icon)

/**
 * Значок сервиса в том же порядке разбора, что и у клиента: картинка по URL →
 * значок по имени → первая буква названия.
 */
export function ServiceIcon({
    icon,
    label,
    color,
    size = 'md',
}: {
    icon?: string | null
    label?: string
    color?: string | null
    size?: 'sm' | 'md' | 'lg'
}) {
    const box = { sm: 'size-7', md: 'size-9', lg: 'size-12' }[size]
    const glyph = { sm: 'size-4', md: 'size-5', lg: 'size-6' }[size]
    const Glyph = icon ? SERVICE_ICON_GLYPHS[icon.trim()] : undefined
    const tint = color || undefined

    if (isIconUrl(icon)) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={icon!}
                alt=""
                className={`${box} shrink-0 rounded-lg border object-cover`}
            />
        )
    }

    return (
        <span
            className={`${box} flex shrink-0 items-center justify-center rounded-lg border bg-muted/60`}
            style={tint ? { backgroundColor: `${tint}1a`, borderColor: tint } : undefined}
        >
            {Glyph ? (
                <Glyph className={glyph} style={tint ? { color: tint } : undefined} />
            ) : (
                <span
                    className="text-xs font-semibold uppercase text-muted-foreground"
                    style={tint ? { color: tint } : undefined}
                >
                    {(label ?? '?').trim().charAt(0) || '?'}
                </span>
            )}
        </span>
    )
}
