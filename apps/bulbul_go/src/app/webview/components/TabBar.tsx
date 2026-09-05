'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Icon, type IconName } from './icons'

// Стандартный нижний таббар webview-сервисов. Сервис описывает только табы
// (и опционально центральное действие) — каркас общий: fixed-панель,
// подсветка активного оптимистично по тапу (пока Next грузит страницу),
// префетч роутов, скрытие на глубоких экранах, переключение router.replace
// (один нативный экран, история не растёт). Живёт в layout сегмента — не
// перемонтируется при переходах.
//
// Вид повторяет бар приложения (BottomNavigationBar + bottomNavigationBarTheme
// в core/theme/app_theme.dart, центральная кнопка — CreateTabIcon из
// core/router/product_sub_nav.dart): плоская панель в цвет фона без тени и
// делителя, активный пункт — accent, значок 24 и подпись 12/700, неактивный —
// onSurfaceVariant (--muted-foreground), 22 и 11/500. Значки контурные и в
// активном состоянии: залитый среди контурных читается как другой набор.

/** Высота значка по состоянию — как selected/unselectedIconTheme в теме. */
const ICON_SIZE_ACTIVE = 24
const ICON_SIZE_IDLE = 22

export interface TabItem {
    key: string
    path: string
    label: string
    icon: IconName
}

export function TabBar({
    items,
    centerAction,
}: {
    items: TabItem[]
    /** круглая кнопка действия в центре бара («Создать» в авторынке) */
    centerAction?: { ariaLabel: string; onPress: () => void }
}) {
    const router = useRouter()
    const pathname = usePathname()

    const [pending, setPending] = useState<string | null>(null)
    useEffect(() => setPending(null), [pathname])

    useEffect(() => {
        for (const t of items) router.prefetch(t.path)
    }, [router, items])

    const isTabRoute = items.some((t) => t.path === pathname)
    if (!isTabRoute) return null

    const active =
        pending ?? items.find((t) => t.path === pathname)?.key ?? items[0]?.key

    // Значок и подпись живут в блоках фиксированной высоты: активный крупнее,
    // но строка не должна дёргаться при переключении (в баре приложения
    // высота тоже постоянная — 56 плюс safe-area).
    const tab = (t: TabItem) => {
        const isActive = t.key === active
        const size = isActive ? ICON_SIZE_ACTIVE : ICON_SIZE_IDLE
        return (
            <button
                key={t.key}
                onClick={() => {
                    if (isActive) return
                    setPending(t.key)
                    router.replace(t.path)
                }}
                // touch-manipulation: WebKit не придерживает первый тап в
                // ожидании двойного (зум) — срабатывание с первого касания
                className={`flex flex-1 touch-manipulation flex-col items-center gap-0.5 pt-2 pb-[calc(env(safe-area-inset-bottom)+26px)] ${
                    isActive ? '' : 'text-muted-foreground'
                }`}
                style={isActive ? { color: 'var(--wv-accent)' } : undefined}
            >
                <span className="flex h-6 items-center">
                    <Icon name={t.icon} size={size} />
                </span>
                <span
                    className={`flex h-4 items-center leading-none ${
                        isActive
                            ? 'text-[12px] font-bold'
                            : 'text-[11px] font-medium'
                    }`}
                >
                    {t.label}
                </span>
            </button>
        )
    }

    const mid = Math.ceil(items.length / 2)
    const [left, right] = centerAction
        ? [items.slice(0, mid), items.slice(mid)]
        : [items, []]

    return (
        // Панель плоская и непрозрачная — как бар приложения (elevation 0,
        // фон surface): ни делителя сверху, ни подложки с blur.
        <nav className="fixed inset-x-0 bottom-0 z-40 bg-background">
            {/* нижний запас (+26px к safe-area: во вьюве inset может быть 0)
                живёт ВНУТРИ кнопок, не на контейнере — иначе нижняя часть
                панели была бы мёртвой зоной и тапы «мимо иконки» терялись */}
            <div className="flex items-stretch px-2">
                {left.map(tab)}

                {centerAction && (
                    <button
                        onClick={centerAction.onPress}
                        aria-label={centerAction.ariaLabel}
                        className="relative flex-1 touch-manipulation"
                    >
                        {/* круг 48 занимает обе строки ячейки (значок +
                            подпись) и не растит бар — как OverflowBox в
                            CreateTabIcon; подписи у кнопки в приложении нет */}
                        <span
                            className="absolute left-1/2 top-1 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full"
                            style={{
                                background: 'var(--wv-primary)',
                                color: 'var(--wv-on-primary)',
                            }}
                        >
                            <Icon name="plus" size={30} />
                        </span>
                    </button>
                )}

                {right.map(tab)}
            </div>
        </nav>
    )
}
