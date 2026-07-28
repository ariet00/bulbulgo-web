'use client'

// Единый auth-гейт экранов webview-сервисов («Мои метки», «Избранное»,
// «Профиль», …): состояние authed (null — определяем, показывайте скелетон),
// вход по кнопке и самолечение.
//
// Устойчивость, ради которой хук и существует:
// - «Войти» не мигает на холодной загрузке: мост инжектится позже эффектов —
//   пока не убедились, что логина точно нет, держим null (скелетон);
// - подписка на onAuthChanged: если интерактивный вход оборвался (гонка на
//   нативной стороне, потерянный промис под экраном логина) — страница
//   добирает сессию по событию приложения; разлогин в нативном профиле
//   мгновенно возвращает гейт;
// - неуспешный вход не молчит (тост).

import { useCallback, useEffect, useRef, useState } from 'react'
import { ensureAuth, initWebviewAuth, trySilentAuth } from './auth'
import { bridgeAvailable, onAuthChanged, toast, waitForBridge } from './bridge'

export function useWebviewAuth(opts?: {
    /** экран требует входа сразу: нет логина → нативный экран входа прямо
     * на маунте (семантика «Моих»/«Избранного» авторынка) */
    interactiveOnMount?: boolean
    /** дёргается после ПОЯВЛЕНИЯ сессии (кнопка/событие) — сюда экраны
     * вешают инвалидацию своих запросов */
    onAuthed?: () => void
}): { authed: boolean | null; login: () => Promise<void> } {
    const [authed, setAuthed] = useState<boolean | null>(null)
    const onAuthedRef = useRef(opts?.onAuthed)
    onAuthedRef.current = opts?.onAuthed
    const interactiveOnMount = opts?.interactiveOnMount ?? false

    useEffect(() => {
        let alive = true
        void (async () => {
            // ?code= из URL (страница открыта приложением) / живые токены
            if (await initWebviewAuth()) {
                if (alive) setAuthed(true)
                return
            }
            // тихий код от приложения (залогинен — код выдаётся без UI)
            if (await trySilentAuth()) {
                if (alive) setAuthed(true)
                return
            }
            // мост мог ещё не инжектиться (trySilentAuth ждёт лишь 1.5с) —
            // дожидаемся дольше, прежде чем заключить «не залогинен»
            if (!bridgeAvailable() && (await waitForBridge(4000))) {
                if (await trySilentAuth()) {
                    if (alive) setAuthed(true)
                    return
                }
            }
            if (!alive) return
            if (interactiveOnMount && bridgeAvailable()) {
                const ok = await ensureAuth()
                if (alive) setAuthed(ok)
                return
            }
            setAuthed(false)
        })()

        const off = onAuthChanged((authorized) => {
            if (!authorized) {
                setAuthed(false) // токены страницы уже почистил auth.ts
                return
            }
            setAuthed(null) // добираем сессию — скелетон, не «Войти»
            void trySilentAuth().then((ok) => {
                setAuthed(ok)
                if (ok) onAuthedRef.current?.()
            })
        })
        return () => {
            alive = false
            off()
        }
        // interactiveOnMount фиксирован на первый маунт осознанно
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = useCallback(async () => {
        if (await ensureAuth()) {
            setAuthed(true)
            onAuthedRef.current?.()
        } else if (bridgeAvailable()) {
            void toast('Не получилось войти — попробуйте ещё раз', 'warning').catch(
                () => {},
            )
        }
    }, [])

    return { authed, login }
}
