'use client'

import { useEffect, useState } from 'react'
import {
    bridgeAvailable,
    callPhone,
    copyToClipboard,
    getAppInfo,
    getLocale,
    getLocation,
    getTheme,
    interceptBack,
    openUrl,
    pickFiles,
    pickPhoto,
    pickPhotos,
    setNavBadge,
    setTitle,
    share,
    toast,
} from '../bridge'

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

            {done && (
                <a
                    href="bulbulgo://profile"
                    className="block rounded-lg border p-3 text-center text-sm font-medium"
                >
                    Открыть нативный профиль (bulbulgo://profile)
                </a>
            )}

            {done && <BridgePlayground />}
        </main>
    )
}

// Демо JS-моста: каждая кнопка дёргает нативный метод и показывает результат.
function BridgePlayground() {
    const [result, setResult] = useState<string>('')
    const [photos, setPhotos] = useState<string[]>([])
    const [customTitle, setCustomTitle] = useState(false)
    const [badgeCount, setBadgeCount] = useState(0)
    const [releaseBack, setReleaseBack] = useState<(() => void) | null>(null)

    const run = async (name: string, fn: () => Promise<unknown>) => {
        try {
            const r = await fn()
            setResult(`${name}: ${JSON.stringify(r)}`)
        } catch (e) {
            setResult(`${name}: ошибка — ${e instanceof Error ? e.message : e}`)
        }
    }

    return (
        <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">
                JS-мост:{' '}
                {bridgeAvailable() ? '✅ доступен' : '➖ вне приложения'}
            </p>
            <div className="grid grid-cols-2 gap-2">
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => run('appInfo', getAppInfo)}
                >
                    Версия приложения
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => run('location', getLocation)}
                >
                    Локация
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('photo', async () => {
                            const p = await pickPhoto('gallery')
                            setPhotos(
                                p ? [`data:${p.mimeType};base64,${p.base64}`] : [],
                            )
                            return p ? `${p.name} (${p.mimeType})` : null
                        })
                    }
                >
                    Фото из галереи
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('photos', async () => {
                            const list = await pickPhotos(3)
                            setPhotos(
                                (list ?? []).map(
                                    (p) => `data:${p.mimeType};base64,${p.base64}`,
                                ),
                            )
                            return list ? `выбрано: ${list.length}` : null
                        })
                    }
                >
                    Несколько фото (до 3)
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('files', async () => {
                            const list = await pickFiles()
                            return list
                                ? list.map((f) => `${f.name} (${f.size} б)`)
                                : null
                        })
                    }
                >
                    Файлы
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => run('share', () => share('Привет из вебвью BulBul Go!'))}
                >
                    Поделиться
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => run('call', () => callPhone('+996700123456'))}
                >
                    Позвонить
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('toast', () => toast('Тост из вебвью', 'success'))
                    }
                >
                    Тост
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('clipboard', () => copyToClipboard('BULBUL-PROMO-2026'))
                    }
                >
                    Скопировать промокод
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('locale/theme', async () => ({
                            locale: await getLocale(),
                            theme: await getTheme(),
                        }))
                    }
                >
                    Локаль и тема
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => run('openUrl', () => openUrl('https://bulbul.asia'))}
                >
                    Внешняя ссылка
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('setTitle', async () => {
                            const next = !customTitle
                            await setTitle(next ? 'Заголовок из страницы' : '')
                            setCustomTitle(next)
                            return next ? 'установлен' : 'сброшен'
                        })
                    }
                >
                    {customTitle ? 'Сбросить заголовок' : 'Сменить заголовок'}
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() =>
                        run('setNavBadge', async () => {
                            // 0 → 1 → 2 → 3 → 0 (снятие) на второй вкладке
                            const next = (badgeCount + 1) % 4
                            await setNavBadge(1, next)
                            setBadgeCount(next)
                            return next === 0 ? 'снят' : `счётчик: ${next}`
                        })
                    }
                >
                    Бейдж вкладки ({badgeCount})
                </button>
                <button
                    className="rounded-md border p-2 text-sm"
                    onClick={() => {
                        if (releaseBack) {
                            releaseBack()
                            setReleaseBack(null)
                            setResult('interceptBack: отпущен — назад снова закрывает')
                        } else {
                            const release = interceptBack(() =>
                                setResult(
                                    `interceptBack: перехвачено «назад» (${new Date().toLocaleTimeString()})`,
                                ),
                            )
                            setReleaseBack(() => release)
                            setResult(
                                'interceptBack: включён — нажмите системный «назад»',
                            )
                        }
                    }}
                >
                    {releaseBack ? 'Отпустить «назад»' : 'Перехватить «назад»'}
                </button>
            </div>
            {result && (
                <p className="break-all text-xs text-muted-foreground">{result}</p>
            )}
            {photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {photos.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={i}
                            src={src}
                            alt=""
                            className="max-h-32 rounded-md"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
