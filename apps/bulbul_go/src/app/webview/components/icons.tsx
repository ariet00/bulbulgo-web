import type { CSSProperties } from 'react'
import {
    IconBook,
    IconBrandWhatsapp,
    IconBriefcase,
    IconCalendarCheck,
    IconCamera,
    IconCheck,
    IconChevronDown,
    IconChevronLeft,
    IconCurrentLocation,
    IconDots,
    IconEye,
    IconFileText,
    IconFlag,
    IconGasStation,
    IconHeart,
    IconHeartFilled,
    IconHelpCircle,
    IconHome,
    IconList,
    IconMap,
    IconNews,
    IconPackage,
    IconPlayerPlayFilled,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconShare,
    IconTag,
    IconTool,
    IconUser,
    IconX,
    type TablerIcon,
} from '@tabler/icons-react'

// Значки вебвью — Tabler, тот же набор, что рисует приложение
// (flutter_tabler_icons за фасадом core/theme/app_icons.dart). Здесь фасад
// играет ту же роль: экран зовёт глиф по имени и не знает, из какого набора
// он приехал, — смена набора правится в этой таблице, а не в местах вызова.
// Имена совпадают с AppIcons, чтобы один значок звался одинаково по обе
// стороны (в приложении часть имён осталась от Lucide — здесь так же).
//
// Импорт из корня пакета безопасен: @tabler/icons-react входит в дефолтный
// optimizePackageImports Next, который разворачивает барель в точечные
// импорты — в бандл попадают только перечисленные глифы.
//
// Добавить значок: найти имя на tabler.io/icons и дописать строку в таблицу.
const GLYPHS = {
    x: IconX,
    check: IconCheck,
    chevronLeft: IconChevronLeft,
    chevronDown: IconChevronDown,
    plus: IconPlus,
    search: IconSearch,
    ellipsis: IconDots,
    refreshCw: IconRefresh,
    share: IconShare,
    flag: IconFlag,
    eye: IconEye,
    camera: IconCamera,
    user: IconUser,
    heart: IconHeart,
    heartFilled: IconHeartFilled,
    fileText: IconFileText,
    list: IconList,
    map: IconMap,
    house: IconHome,
    tag: IconTag,
    package: IconPackage,
    briefcase: IconBriefcase,
    wrench: IconTool,
    calendarCheck: IconCalendarCheck,
    newspaper: IconNews,
    book: IconBook,
    playerPlayFilled: IconPlayerPlayFilled,
    fuel: IconGasStation,
    locateFixed: IconCurrentLocation,
    circleHelp: IconHelpCircle,
    brandWhatsapp: IconBrandWhatsapp,
} satisfies Record<string, TablerIcon>

export type IconName = keyof typeof GLYPHS

/** Значок 24×24 с обводкой 2 — сетка Tabler, как на экранах приложения. */
export function Icon({
    name,
    size = 24,
    className,
    style,
}: {
    name: IconName
    size?: number
    className?: string
    style?: CSSProperties
}) {
    const Glyph = GLYPHS[name]
    return <Glyph size={size} className={className} style={style} aria-hidden />
}
