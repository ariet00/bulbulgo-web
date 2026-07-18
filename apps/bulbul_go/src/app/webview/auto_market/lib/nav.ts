// Навигация авторынка по конвенции приложения:
//
// - вглубь (карточка, wizard) — мостовой openWebPage: приложение кладёт
//   нативный экран поверх, поэтому системный жест «свайп назад» работает;
//   вне приложения — обычный SPA-переход;
// - между табами — router.replace (SPA внутри одного нативного экрана,
//   свайп назад с таба закрывает сервис целиком — как в нативных табах).

import type { useRouter } from 'next/navigation'
import { bridgeAvailable, openWebPage } from '../../bridge'

type Router = ReturnType<typeof useRouter>

/** Переход «вглубь» — нативный экран в приложении, push вне его. */
export function navigateTo(router: Router, path: string, title?: string): void {
    if (bridgeAvailable()) {
        void openWebPage(path, title)
    } else {
        router.push(path)
    }
}
