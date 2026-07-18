'use client'

import { useEffect, useState } from 'react'

// Кнопки «открыть в приложении»/сторы. В отличие от smart-link поездок,
// автопереход не делаем — на странице есть контент-превью; Android-кнопка
// идёт intent-URL (приложение, если установлено, иначе Play Store).
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

export default function OpenAppClient({ id }: { id: string }) {
    const [platform, setPlatform] = useState<Platform>('desktop')
    useEffect(() => setPlatform(detectPlatform()), [])

    const androidIntent =
        `intent://go.bulbul.asia/auto/${id}` +
        `#Intent;scheme=https;package=com.bakasov.bulbul_go;` +
        `S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`

    return (
        <div className="flex flex-col items-center gap-3">
            <a
                href={
                    platform === 'android'
                        ? androidIntent
                        : platform === 'ios'
                          ? APPSTORE_URL
                          : PLAY_URL
                }
                className="w-full rounded-xl bg-primary px-5 py-3 text-center font-semibold text-primary-foreground"
            >
                Открыть в приложении BulBul Go
            </a>
            {platform === 'desktop' && (
                <div className="flex gap-4 text-sm">
                    <a href={APPSTORE_URL} className="text-primary underline">
                        App Store
                    </a>
                    <a href={PLAY_URL} className="text-primary underline">
                        Google Play
                    </a>
                </div>
            )}
        </div>
    )
}
