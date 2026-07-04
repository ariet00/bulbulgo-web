'use client'

import { Component, useEffect, type ReactNode } from 'react'
import { installGlobalErrorReporting, reportWebviewError } from './reporting'

// База обработки JS-ошибок для всех webview-страниц (подключена в layout):
// - error boundary: упавший рендер → экран «Что-то пошло не так» с
//   перезагрузкой вместо белого экрана (нативная сторона JS-ошибки не видит);
// - window.onerror / unhandledrejection → репорт в трекинг бэка.

class Boundary extends Component<
    { children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false }

    static getDerivedStateFromError() {
        return { failed: true }
    }

    componentDidCatch(error: unknown) {
        reportWebviewError(error, { source: 'error_boundary' })
    }

    render() {
        if (!this.state.failed) return this.props.children
        return (
            <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-lg font-semibold">Что-то пошло не так</p>
                <p className="text-sm text-muted-foreground">
                    Попробуйте обновить страницу или откройте сервис заново.
                </p>
                <button
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    onClick={() => window.location.reload()}
                >
                    Обновить
                </button>
            </main>
        )
    }
}

export function WebviewErrorBoundary({ children }: { children: ReactNode }) {
    useEffect(() => {
        installGlobalErrorReporting()
    }, [])
    return <Boundary>{children}</Boundary>
}
