'use client'

import { use, useEffect, useState } from 'react'
import { openWebPage, share } from '../../../bridge'
import { authFetch, getAccessToken } from '../../../auth'

// Демо «деталей», открываемых отдельным нативным экраном (мостовой
// openWebPage): шапка и свайп назад — нативные, своя шапка не нужна.
// Переход — SPA без перезагрузки, поэтому сессия (sessionStorage) общая с
// главной страницей: блок «Авторизация» это и проверяет. В браузере (вне
// приложения) страница тоже работает — назад системный.

export default function WebviewTestDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [shared, setShared] = useState(false)
    const [auth, setAuth] = useState('Проверяем…')

    useEffect(() => {
        const run = async () => {
            if (!getAccessToken()) {
                setAuth('Нет сессии (страница вне приложения?)')
                return
            }
            try {
                const r = await authFetch('/users/me')
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                const me = (await r.json()) as {
                    id: number
                    name?: string | null
                    username?: string | null
                    phone?: string | null
                }
                setAuth(
                    `Сессия жива: ${me.name || me.username || me.phone || `#${me.id}`}`,
                )
            } catch (e) {
                setAuth(
                    `Ошибка: ${e instanceof Error ? e.message : String(e)}`,
                )
            }
        }
        run()
    }, [])

    return (
        <main className="mx-auto max-w-md space-y-4 p-5">
            <div className="flex h-40 items-center justify-center rounded-xl border text-4xl">
                📦
            </div>
            <div>
                <p className="text-lg font-semibold">Тестовая сущность #{id}</p>
                <p className="text-sm text-muted-foreground">
                    Открыта отдельным нативным экраном (openWebPage): заголовок и
                    свайп назад — нативные, под жестом виден живой предыдущий
                    экран.
                </p>
            </div>
            <ul className="space-y-2 text-sm">
                <li className="flex justify-between gap-3 rounded-md border p-2">
                    <span className="text-muted-foreground">Авторизация</span>
                    <span className="text-right">{auth}</span>
                </li>
                <li className="flex justify-between rounded-md border p-2">
                    <span className="text-muted-foreground">Статус</span>
                    <span>Активна</span>
                </li>
                <li className="flex justify-between rounded-md border p-2">
                    <span className="text-muted-foreground">Создана</span>
                    <span>04.07.2026</span>
                </li>
            </ul>
            <button
                className="w-full rounded-md border p-2 text-sm font-medium"
                onClick={() =>
                    share(`Тестовая сущность #${id} из вебвью BulBul Go`)
                        .then(() => setShared(true))
                        .catch(() => {})
                }
            >
                {shared ? 'Поделились ✅' : 'Поделиться (мост)'}
            </button>

            {/* Длинный блок — проверка скролла и ВЛОЖЕННОГО openWebPage:
                каждая позиция открывает эти же детали с её номером ещё одним
                нативным экраном (тест → детали → позиция → ...). */}
            <div className="space-y-2">
                <p className="text-sm font-medium">
                    Позиции (тап — вложенный экран)
                </p>
                <ul className="space-y-2 text-sm">
                    {Array.from({ length: 40 }, (_, i) => (
                        <li key={i}>
                            <button
                                className="flex w-full justify-between rounded-md border p-3 text-left"
                                onClick={() =>
                                    openWebPage(
                                        `/webview/test/details/${i + 1}`,
                                        `Позиция ${i + 1}`,
                                    ).catch(() => {
                                        window.location.href = `/webview/test/details/${i + 1}`
                                    })
                                }
                            >
                                <span className="text-muted-foreground">
                                    Позиция {i + 1}
                                </span>
                                <span>{(i + 1) * 100} c</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    )
}
