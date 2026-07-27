'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Общий bottom-sheet webview-сервисов (без зависимостей): бэкдроп + панель
// снизу, лок скролла страницы на время показа, закрытие свайпом вниз.
// Высота — до 85dvh, контент скроллится. Анимации — в ../webview.css
// (wv-sheet-*).

//: пикселей вниз до старта жеста (отсеиваем дрожание пальца)
const DRAG_START_PX = 8
//: закрыть, если панель утянута дальше этой доли своей высоты…
const CLOSE_DISTANCE_RATIO = 0.33
//: …или брошена вниз быстрее (px/ms)
const CLOSE_VELOCITY = 0.6

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
    const panelRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Лок скролла страницы: overflow:hidden на body НЕ останавливает
    // touch-скролл в iOS-вебвью — фиксируем body на месте (position:fixed
    // с компенсацией scrollY) и возвращаем позицию при закрытии.
    useEffect(() => {
        if (!open) return
        const scrollY = window.scrollY
        const { position, top, left, right, width, overflow } =
            document.body.style
        Object.assign(document.body.style, {
            position: 'fixed',
            top: `-${scrollY}px`,
            left: '0',
            right: '0',
            width: '100%',
            overflow: 'hidden',
        })
        return () => {
            Object.assign(document.body.style, {
                position,
                top,
                left,
                right,
                width,
                overflow,
            })
            window.scrollTo(0, scrollY)
        }
    }, [open])

    // Свайп-вниз: панель едет за пальцем, отпустили далеко/быстро — закрыть,
    // иначе отпружинить назад. Жест из скролл-области начинается только когда
    // её скролл стоит на самом верху (иначе это скролл контента, не панели);
    // за «ручку»/шапку/футер — тянуть можно всегда. Нативные слушатели с
    // passive:false — React вешает touchmove пассивно, preventDefault оттуда
    // не работает.
    useEffect(() => {
        const panel = panelRef.current
        if (!open || !panel) return

        let startY = 0
        let startT = 0
        let dragging = false
        let allowed = false

        const onStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return
            startY = e.touches[0].clientY
            startT = Date.now()
            dragging = false
            const sc = scrollRef.current
            allowed =
                !sc ||
                !sc.contains(e.target as Node) ||
                sc.scrollTop <= 0
        }

        const onMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return
            const dy = e.touches[0].clientY - startY
            if (!dragging) {
                // палец пошёл вверх — это скролл контента, жест отменяем
                if (dy < 0) {
                    allowed = false
                    return
                }
                if (!allowed || dy < DRAG_START_PX) return
                dragging = true
                panel.style.transition = 'none'
            }
            e.preventDefault() // не отдавать движение скроллу под пальцем
            panel.style.transform = `translateY(${Math.max(0, dy)}px)`
        }

        const onEnd = (e: TouchEvent) => {
            if (!dragging) return
            dragging = false
            const dy = Math.max(
                0,
                e.changedTouches[0].clientY - startY,
            )
            const velocity = dy / Math.max(1, Date.now() - startT)
            const shouldClose =
                dy > panel.offsetHeight * CLOSE_DISTANCE_RATIO ||
                velocity > CLOSE_VELOCITY
            panel.style.transition = 'transform 0.2s ease-out'
            if (shouldClose) {
                panel.style.transform = 'translateY(100%)'
                window.setTimeout(onClose, 180)
            } else {
                panel.style.transform = ''
            }
        }

        panel.addEventListener('touchstart', onStart, { passive: true })
        panel.addEventListener('touchmove', onMove, { passive: false })
        panel.addEventListener('touchend', onEnd)
        panel.addEventListener('touchcancel', onEnd)
        return () => {
            panel.removeEventListener('touchstart', onStart)
            panel.removeEventListener('touchmove', onMove)
            panel.removeEventListener('touchend', onEnd)
            panel.removeEventListener('touchcancel', onEnd)
        }
    }, [open, onClose])

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
                className="wv-sheet-backdrop absolute inset-0 bg-black/45"
                onClick={onClose}
            />
            <div
                ref={panelRef}
                className="wv-sheet-panel absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-background shadow-2xl"
            >
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
                {/* overscroll-contain: доскроллив контент шита до края, жест
                    не перетекает в скролл страницы под ним */}
                <div
                    ref={scrollRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
                >
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
