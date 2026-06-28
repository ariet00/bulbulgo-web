'use client'

import { useEffect } from 'react'

// Catches any render/data error in the admin subtree so the user sees an
// actionable screen instead of a blank white page (e.g. an expired backend
// token causing 401s). "Войти заново" sends them to login to re-auth.
export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin error boundary:', error)
    }, [error])

    const goToLogin = () => {
        const locale =
            (typeof window !== 'undefined'
                ? window.location.pathname.split('/')[1]
                : '') || 'ru'
        window.location.href = `/${locale}/login`
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
            <h2 className="text-lg font-semibold">Что-то пошло не так</h2>
            <p className="max-w-md text-sm text-muted-foreground">
                Не удалось загрузить админку. Возможно, истёк сеанс — войдите
                заново.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => reset()}
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                    Повторить
                </button>
                <button
                    onClick={goToLogin}
                    className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
                >
                    Войти заново
                </button>
            </div>
        </div>
    )
}
