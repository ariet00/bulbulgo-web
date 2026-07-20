'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Общий React Query-клиент webview-сервисов: кэш переживает SPA-переходы
// между экранами (лента ↔ карточка ↔ мои), убирая повторные загрузки
// справочников и «мигание» скелетонами при каждом переходе.

export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        // вебвью не «расфокусируется» как вкладка браузера
                        refetchOnWindowFocus: false,
                        staleTime: 30_000,
                    },
                },
            }),
    )
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
