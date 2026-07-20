'use client'

import { useEffect, type ReactNode } from 'react'

// Общий bottom-sheet вебвью (без зависимостей): бэкдроп + панель снизу,
// блокировка скролла body на время показа. Высота — до 85dvh, контент скроллится.

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
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50"
            // тачи шита не должны всплывать к странице: под ним живут свои
            // жесты (pull-to-refresh ленты), которые ложно срабатывают при
            // скролле контента шита
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            <button
                aria-label="Закрыть"
                className="am-sheet-backdrop absolute inset-0 bg-black/45"
                onClick={onClose}
            />
            <div className="am-sheet-panel absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-background shadow-2xl">
                <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-muted-foreground/30" />
                <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
                    <h2 className="text-[17px] font-semibold tracking-tight">
                        {title}
                    </h2>
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
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
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
            </div>
        </div>
    )
}
