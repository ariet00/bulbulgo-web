'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ensureAuth, initWebviewAuth, trySilentAuth } from '../../auth'
import { authFetch } from '../../auth'
import { navigateTo } from '../lib/nav'
import { useMyListings } from '../lib/queries'

// Профиль в сервисе: кто вы + сводка по объявлениям. Сам аккаунт (имя,
// телефон, выход) управляется в нативном профиле приложения — здесь только
// то, что относится к авторынку.

interface Me {
    full_name: string | null
    phone: string | null
    avatar_url?: string | null
}

export function ProfileClient() {
    const router = useRouter()
    const [authed, setAuthed] = useState<boolean | null>(null)
    const [me, setMe] = useState<Me | null>(null)
    // из общего кэша «Моих» — счётчик совпадает со вкладкой «Активные»
    const activeCount = useMyListings('active', authed === true).data?.total ?? null

    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            const ok = await trySilentAuth()
            if (!alive) return
            setAuthed(ok)
            if (!ok) return
            authFetch('/users/me')
                .then((r) => r.json())
                .then((u) => alive && setMe(u))
                .catch(() => {})
        })()
        return () => {
            alive = false
        }
    }, [])

    if (authed === false) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Нужен вход</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Войдите в аккаунт BulBul Go, чтобы видеть профиль и свои
                    объявления.
                </p>
                <button
                    onClick={async () => setAuthed(await ensureAuth())}
                    className="mt-6 rounded-xl px-6 py-3 text-[15px] font-semibold text-white"
                    style={{ background: 'var(--am-accent)' }}
                >
                    Войти
                </button>
            </div>
        )
    }

    const row =
        'flex w-full items-center justify-between border-t py-3.5 text-left text-[15px] first:border-t-0'

    return (
        <div className="min-h-dvh px-4 pb-28 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">Профиль</h1>

            <div className="mt-4 flex items-center gap-3.5 rounded-2xl border px-4 py-4">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-bold text-white"
                    style={{ background: 'var(--am-accent)' }}
                >
                    {(me?.full_name ?? '·').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                    {me ? (
                        <>
                            <p className="truncate text-[16px] font-semibold">
                                {me.full_name ?? 'Без имени'}
                            </p>
                            {me.phone && (
                                <p className="font-mono text-[13px] text-muted-foreground">
                                    {me.phone}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2">
                            <div className="am-skeleton h-5 w-36 rounded" />
                            <div className="am-skeleton h-4 w-28 rounded" />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 rounded-2xl border px-4">
                <button
                    className={row}
                    onClick={() => router.replace('/webview/auto/my')}
                >
                    <span>Мои объявления</span>
                    <span className="text-muted-foreground">
                        {activeCount != null ? `${activeCount} активных ›` : '›'}
                    </span>
                </button>
                <button
                    className={row}
                    onClick={() =>
                        router.replace('/webview/auto/favorites')
                    }
                >
                    <span>Избранное</span>
                    <span className="text-muted-foreground">›</span>
                </button>
                <button
                    className={row}
                    onClick={() =>
                        navigateTo(
                            router,
                            '/webview/auto/new',
                            'Подать объявление',
                        )
                    }
                >
                    <span>Подать объявление</span>
                    <span className="text-muted-foreground">›</span>
                </button>
            </div>

            <p className="mt-4 px-1 text-[12px] leading-relaxed text-muted-foreground">
                Имя, телефон и выход из аккаунта — в профиле приложения
                BulBul Go.
            </p>
        </div>
    )
}
