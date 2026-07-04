'use client'

import { useEffect, useState } from 'react'

// Диагностическая страница webview-сервисов: прогоняет всю цепочку
// авторизации (?code= → /auth/webview-exchange → access token → /users/me)
// и показывает результат каждого шага. Открывается из мобильного приложения
// (карточка «Тест вебвью» на «Главной») или напрямую в браузере (без кода).

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Step = { name: string; status: 'ok' | 'fail' | 'skip'; detail?: string }

type UserMe = {
    id: number
    name?: string | null
    surname?: string | null
    username?: string | null
    phone?: string | null
}

export default function WebviewTestPage() {
    const [steps, setSteps] = useState<Step[]>([])
    const [user, setUser] = useState<UserMe | null>(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const run = async () => {
            const collected: Step[] = []
            const url = new URL(window.location.href)
            const code = url.searchParams.get('code')

            // Одноразовый код не должен оставаться в адресной строке/истории.
            if (code) {
                url.searchParams.delete('code')
                window.history.replaceState(null, '', url.toString())
            }

            collected.push(
                code
                    ? { name: 'Код в URL', status: 'ok' }
                    : {
                          name: 'Код в URL',
                          status: 'skip',
                          detail: 'Открыто без ?code= — страница вне приложения',
                      },
            )

            if (code) {
                try {
                    const r = await fetch(`${API_URL}/auth/webview-exchange`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    })
                    if (!r.ok) throw new Error(`HTTP ${r.status}`)
                    const { access_token } = (await r.json()) as {
                        access_token: string
                    }
                    collected.push({ name: 'Обмен кода на токен', status: 'ok' })

                    const me = await fetch(`${API_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${access_token}` },
                    })
                    if (!me.ok) throw new Error(`HTTP ${me.status}`)
                    const profile = (await me.json()) as UserMe
                    setUser(profile)
                    collected.push({ name: 'Запрос профиля', status: 'ok' })
                } catch (e) {
                    collected.push({
                        name: 'Авторизация',
                        status: 'fail',
                        detail: e instanceof Error ? e.message : String(e),
                    })
                }
            }

            setSteps(collected)
            setDone(true)
        }
        run()
    }, [])

    const displayName = user
        ? [user.name, user.surname].filter(Boolean).join(' ') ||
          user.username ||
          user.phone ||
          `#${user.id}`
        : null

    return (
        <main className="mx-auto max-w-md p-5 space-y-5">
            <div>
                <h1 className="text-xl font-bold">Тест вебвью</h1>
                <p className="text-sm text-muted-foreground">
                    Проверка цепочки авторизации webview-сервисов
                </p>
            </div>

            {!done && <p className="text-sm">Проверяем…</p>}

            {done && (
                <ul className="space-y-2">
                    {steps.map((s) => (
                        <li
                            key={s.name}
                            className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                        >
                            <span>
                                {s.status === 'ok' && '✅'}
                                {s.status === 'fail' && '❌'}
                                {s.status === 'skip' && '➖'}
                            </span>
                            <span>
                                <span className="font-medium">{s.name}</span>
                                {s.detail && (
                                    <span className="block text-muted-foreground">
                                        {s.detail}
                                    </span>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {displayName && (
                <div className="rounded-lg border border-green-600/40 bg-green-600/10 p-4">
                    <p className="text-sm">Вы вошли как</p>
                    <p className="text-lg font-semibold">{displayName}</p>
                </div>
            )}
        </main>
    )
}
