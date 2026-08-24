'use client'

import { useEffect } from 'react'
import { initWebviewAuth, trySilentAuth } from './auth'

// Прогрев авторизации при открытии вебвью: обменять ?code= из URL (если
// приложение его передало) и фоном поднять сессию страницы тихим кодом.
// К моменту захода на защищённый экран токены уже готовы — без шиммера
// «мост → код → обмен». Незалогиненному ничего не показывает. Параллельный
// старт с экранным useWebviewAuth безопасен: тихий обмен дедуплицирован
// в auth.ts (общий in-flight промис).

export function AuthWarmup() {
    useEffect(() => {
        void initWebviewAuth()
            .then(() => trySilentAuth())
            .catch(() => {})
    }, [])
    return null
}
