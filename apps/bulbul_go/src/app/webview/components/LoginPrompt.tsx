'use client'

// Стандартный экран «Нужен вход» webview-сервисов: заголовок, подпись и
// кнопка «Войти» (обычно onLogin = login из useWebviewAuth).

export function LoginPrompt({
    title = 'Нужен вход',
    text,
    onLogin,
    variant = 'block',
}: {
    title?: string
    text: string
    onLogin: () => void | Promise<void>
    /** block — блок в потоке страницы (лента), screen — по центру экрана */
    variant?: 'block' | 'screen'
}) {
    const inner = (
        <>
            <p className="text-[16px] font-semibold">{title}</p>
            <p className="mt-1 max-w-72 text-[13.5px] leading-snug text-muted-foreground">
                {text}
            </p>
            <button
                onClick={() => void onLogin()}
                className="mt-4 rounded-full bg-[var(--wv-accent)] px-6 py-2.5 text-[14px] font-semibold text-white active:opacity-80"
            >
                Войти
            </button>
        </>
    )
    if (variant === 'screen') {
        return (
            <div className="wv-rise flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                {inner}
            </div>
        )
    }
    return (
        <div className="wv-rise flex flex-col items-center px-6 py-16 text-center">
            {inner}
        </div>
    )
}
