'use client'

// Позиция пользователя: мост приложения → браузерная геолокация → центр
// Бишкека (с флагом geoDenied для баннера). Общий для Ленты и Карты.

import { useEffect, useState } from 'react'
import { getLocation, waitForBridge } from '../../bridge'
import type { LatLng } from './types'

export const BISHKEK: LatLng = { lat: 42.8746, lng: 74.5698 }

function browserLocation(timeoutMs = 6000): Promise<LatLng | null> {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            return resolve(null)
        }
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(null),
            { timeout: timeoutMs, maximumAge: 60_000 },
        )
    })
}

// Кэш последней найденной позиции на время жизни вебвью: табы — разные
// роуты, экран монтируется заново при каждом переключении — без кэша каждый
// вход ждал бы мост/геолокацию заново и показывал скелетон при тёплых данных.
let cachedResult: { origin: LatLng; geoDenied: boolean } | null = null

export function useOrigin(): { origin: LatLng | null; geoDenied: boolean } {
    const [origin, setOrigin] = useState<LatLng | null>(
        cachedResult?.origin ?? null,
    )
    const [geoDenied, setGeoDenied] = useState(cachedResult?.geoDenied ?? false)

    useEffect(() => {
        let cancelled = false
        void (async () => {
            let loc: LatLng | null = null
            if (await waitForBridge(1500)) {
                const bridged = await getLocation().catch(() => null)
                if (bridged) {
                    loc = { lat: bridged.latitude, lng: bridged.longitude }
                }
            }
            loc ??= await browserLocation()
            if (cancelled) return
            const denied = loc === null
            cachedResult = { origin: loc ?? BISHKEK, geoDenied: denied }
            setGeoDenied(denied)
            setOrigin(loc ?? BISHKEK)
        })()
        return () => {
            cancelled = true
        }
    }, [])

    return { origin, geoDenied }
}
