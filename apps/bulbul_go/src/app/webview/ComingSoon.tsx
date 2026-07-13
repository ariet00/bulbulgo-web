import type { ReactNode } from 'react'
import './coming-soon.css'
import { plexMono, unbounded } from './coming-soon-fonts'

// Заглушка ещё не запущенного webview-сервиса: карточка на «Главной» уже
// есть (бейдж «СКОРО»), а по тапу открывается эта страница. Заголовок экрана
// рисует нативный AppBar приложения — здесь только тело.
//
// Серверный компонент: моста и состояния не требует, вся анимация на CSS.

export type ComingSoonProps = {
    /** Акцентный цвет сервиса (любой валидный CSS-цвет). */
    accent: string
    /** Глиф сервиса — inline SVG 28×28, наследует currentColor. */
    icon: ReactNode
    title: string
    tagline: string
    /** Что появится в сервисе — короткие пункты, 2–4 штуки. */
    bullets: string[]
}

export function ComingSoon({
    accent,
    icon,
    title,
    tagline,
    bullets,
}: ComingSoonProps) {
    return (
        <main
            className={`cs-root ${unbounded.variable} ${plexMono.variable} min-h-dvh px-6 pb-16 pt-14`}
            style={{ '--cs-accent': accent } as React.CSSProperties}
        >
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                {/* Глиф в свечении: вращающееся пунктирное кольцо — стройка идёт */}
                <div
                    className="cs-rise relative flex h-32 w-32 items-center justify-center"
                    style={{ '--cs-delay': '0ms' } as React.CSSProperties}
                >
                    <div className="cs-aura absolute inset-0 rounded-full blur-xl" />
                    <div className="cs-ring absolute inset-2 rounded-full border border-dashed" />
                    <div className="cs-glyph-box relative flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-sm">
                        {icon}
                    </div>
                </div>

                <div
                    className="cs-rise relative mt-8 overflow-hidden rounded-full border px-3.5 py-1 cs-chip"
                    style={{ '--cs-delay': '80ms' } as React.CSSProperties}
                >
                    <span className="font-[family-name:var(--font-cs-mono)] text-[10px] uppercase tracking-[0.28em]">
                        Скоро
                    </span>
                </div>

                <h1
                    className="cs-rise mt-5 font-[family-name:var(--font-cs-display)] text-[26px] leading-[1.15] tracking-tight"
                    style={{ '--cs-delay': '140ms' } as React.CSSProperties}
                >
                    {title}
                </h1>

                <p
                    className="cs-rise mt-3 text-[15px] leading-relaxed text-muted-foreground"
                    style={{ '--cs-delay': '200ms' } as React.CSSProperties}
                >
                    {tagline}
                </p>

                <ul className="mt-10 w-full space-y-px text-left">
                    {bullets.map((b, i) => (
                        <li
                            key={b}
                            className="cs-rise flex items-center gap-3.5 border-t py-3.5 last:border-b"
                            style={
                                {
                                    '--cs-delay': `${280 + i * 70}ms`,
                                } as React.CSSProperties
                            }
                        >
                            <span className="cs-bullet-dot h-1.5 w-1.5 shrink-0 rounded-full" />
                            <span className="flex-1 text-[15px]">{b}</span>
                            <span className="font-[family-name:var(--font-cs-mono)] text-[11px] tabular-nums text-muted-foreground/60">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                        </li>
                    ))}
                </ul>

                <p
                    className="cs-rise mt-10 max-w-[19rem] text-[13px] leading-relaxed text-muted-foreground/80"
                    style={
                        {
                            '--cs-delay': `${280 + bullets.length * 70 + 80}ms`,
                        } as React.CSSProperties
                    }
                >
                    Мы уже готовим этот сервис — он появится здесь совсем скоро.
                </p>
            </div>
        </main>
    )
}
