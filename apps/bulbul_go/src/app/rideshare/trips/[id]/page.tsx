'use client'

import { use, useEffect, useState } from 'react'

// ─── Ссылки на сторы ────────────────────────────────────────────────────────
// Android-пакет берётся из native_apps/bulbul_go/android/app/build.gradle.
const PLAY_URL =
    'https://play.google.com/store/apps/details?id=com.bakasov.bulbul_go'
const APPSTORE_URL =
    'https://apps.apple.com/kg/app/bulbul-go-%D0%BF%D0%BE%D0%BF%D1%83%D1%82%D0%BA%D0%B0-%D0%BA%D1%8B%D1%80%D0%B3%D1%8B%D0%B7%D1%81%D1%82%D0%B0%D0%BD/id6757710471'

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
    if (typeof navigator === 'undefined') return 'desktop'
    const ua = navigator.userAgent || ''
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
    if (/Android/i.test(ua)) return 'android'
    return 'desktop'
}

export default function TripSmartLink({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [platform, setPlatform] = useState<Platform>('desktop')

    useEffect(() => {
        const p = detectPlatform()
        setPlatform(p)

        if (p === 'android') {
            // Intent-URL: если приложение установлено — откроет нативный экран
            // (в т.ч. из in-app браузеров, которые не триггерят App Link),
            // иначе уйдёт на Play Store через browser_fallback_url.
            const fallback = encodeURIComponent(PLAY_URL)
            window.location.href =
                `intent://go.bulbul.asia/rideshare/trips/${id}` +
                `#Intent;scheme=https;package=com.bakasov.bulbul_go;` +
                `S.browser_fallback_url=${fallback};end`
            return
        }

        if (p === 'ios') {
            // Если приложение установлено, Universal Link уже открыл бы экран и
            // эта страница не загрузилась бы. Раз мы здесь — ведём в App Store
            // (там будет «Открыть», если приложение всё же установлено).
            const t = setTimeout(() => {
                window.location.href = APPSTORE_URL
            }, 1200)
            return () => clearTimeout(t)
        }
    }, [id])

    const storeUrl = platform === 'ios' ? APPSTORE_URL : PLAY_URL

    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                    🚗
                </div>
                <h1 className="text-xl font-bold">BulBul Go</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Чтобы открыть поездку, установите приложение BulBul Go или
                    откройте её в уже установленном приложении.
                </p>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-3">
                <a
                    href={storeUrl}
                    className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                >
                    Скачать приложение
                </a>
                {platform === 'desktop' && (
                    <div className="flex flex-col gap-2 text-sm">
                        <a href={APPSTORE_URL} className="text-primary underline">
                            App Store
                        </a>
                        <a href={PLAY_URL} className="text-primary underline">
                            Google Play
                        </a>
                    </div>
                )}
            </div>
        </main>
    )
}
