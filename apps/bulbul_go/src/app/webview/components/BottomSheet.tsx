'use client'

import { type ReactNode } from 'react'
import { Drawer } from 'vaul'
// vaul ≥1.0 НЕ инжектит стили сам — без этого импорта нет анимаций
// появления/закрытия и touch-action для жеста
import 'vaul/style.css'

// Общий bottom-sheet webview-сервисов поверх vaul (drawer-примитив на базе
// Radix Dialog): свайп-вниз с корректным разруливанием против внутреннего
// скролла, лок скролла страницы (react-remove-scroll — работает и в
// iOS-вебвью), анимации и физика жеста — из коробки. Высота — до 85dvh,
// контент скроллится. Самописный вариант жеста пробовали — конфликтовал со
// скроллом, поэтому библиотека.

export function BottomSheet({
    open,
    onClose,
    title,
    children,
    footer,
}: {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    /** прилипшая к низу панель действия («Показать N») */
    footer?: ReactNode
}) {
    return (
        <Drawer.Root
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose()
            }}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45" />
                <Drawer.Content
                    aria-describedby={undefined}
                    className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-background shadow-2xl outline-none"
                >
                    <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-muted-foreground/30" />
                    <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
                        <Drawer.Title className="text-[17px] font-semibold tracking-tight">
                            {title}
                        </Drawer.Title>
                        <button
                            onClick={onClose}
                            aria-label="Закрыть"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                                <path d="M3 3l10 10M13 3L3 13" />
                            </svg>
                        </button>
                    </div>
                    {/* overscroll-contain: доскроллив контент до края, жест не
                        перетекает в скролл страницы под шитом */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
                        {children}
                    </div>
                    {/* +отступ к safe-area: во вьюве приложения inset = 0 */}
                    {footer ? (
                        <div className="shrink-0 border-t px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+22px)]">
                            {footer}
                        </div>
                    ) : (
                        <div className="pb-[calc(env(safe-area-inset-bottom)+14px)]" />
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
