// Типизированный клиент JS-моста мобильного приложения для webview-сервисов.
// Мост внедряется приложением (window.BulBulGo) после загрузки страницы —
// вне приложения bridgeAvailable() === false, и страница должна деградировать.
// Нативная сторона: webview_service_screen.dart (_handleBridgeMethod).

export type BridgeLocation = { latitude: number; longitude: number } | null
export type BridgeAppInfo = { platform: 'ios' | 'android'; version: string }
export type BridgePhotoItem = {
    base64: string
    mimeType: string
    name: string
}
export type BridgePhoto = BridgePhotoItem | null
export type BridgeFile = {
    base64: string
    name: string
    size: number
    extension: string | null
}

type BulBulGoBridge = {
    available: boolean
    call: <T>(method: string, params?: unknown) => Promise<T>
}

declare global {
    interface Window {
        BulBulGo?: BulBulGoBridge
    }
}

export function bridgeAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.BulBulGo?.available
}

/**
 * Дождаться появления моста. Приложение внедряет window.BulBulGo только по
 * окончании загрузки страницы (onPageFinished), а React-эффекты могут
 * выполниться раньше — поэтому опрашиваем. false — мост так и не появился
 * (страница открыта вне приложения).
 */
export function waitForBridge(timeoutMs = 3000): Promise<boolean> {
    return new Promise((resolve) => {
        if (bridgeAvailable()) return resolve(true)
        const started = Date.now()
        const timer = setInterval(() => {
            if (bridgeAvailable()) {
                clearInterval(timer)
                resolve(true)
            } else if (Date.now() - started > timeoutMs) {
                clearInterval(timer)
                resolve(false)
            }
        }, 100)
    })
}

async function call<T>(method: string, params?: unknown): Promise<T> {
    if (!bridgeAvailable()) throw new Error('bridge_unavailable')
    return window.BulBulGo!.call<T>(method, params)
}

export const getAppInfo = () => call<BridgeAppInfo>('getAppInfo')

/** null — пользователь не дал разрешение или локация недоступна. */
export const getLocation = () => call<BridgeLocation>('getLocation')

/** null — пользователь отменил выбор. */
export const pickPhoto = (source: 'gallery' | 'camera' = 'gallery') =>
    call<BridgePhoto>('pickPhoto', { source })

/** Мультивыбор фото из галереи (limit ≤ 10). null — отмена. */
export const pickPhotos = (limit = 10) =>
    call<BridgePhotoItem[] | null>('pickPhotos', { limit })

/** Выбор файлов (каждый ≤ 10 МБ, крупнее — пропускаются). null — отмена. */
export const pickFiles = () => call<BridgeFile[] | null>('pickFiles')

export const share = (text: string) => call<boolean>('share', { text })

/** Набрать номер телефона в нативной звонилке. */
export const callPhone = (phone: string) => call<boolean>('call', { phone })

export const toast = (
    text: string,
    type: 'success' | 'error' | 'warning' = 'success',
) => call<boolean>('toast', { text, type })

export const copyToClipboard = (text: string) =>
    call<boolean>('copyToClipboard', { text })

/**
 * Тактильный отклик. light — мягкий (дефолт), selection — переключение,
 * medium/success — подтверждение действия, heavy/error — ошибка/акцент.
 */
export const haptic = (
    type:
        | 'light'
        | 'medium'
        | 'heavy'
        | 'selection'
        | 'success'
        | 'error' = 'light',
) => call<boolean>('haptic', { type })

export type BridgeCapabilities = { methods: string[]; appVersion: string }

/** Список методов моста этого приложения (для проверки поддержки). */
export const getCapabilities = () =>
    call<BridgeCapabilities>('getCapabilities')

/**
 * Методы моста первого релиза приложения: старое приложение без
 * getCapabilities поддерживает ровно их — фолбэк supports().
 */
const V1_METHODS = new Set([
    'getAppInfo', 'getLocation', 'pickPhoto', 'pickPhotos', 'pickFiles',
    'share', 'call', 'toast', 'copyToClipboard', 'isAuthorized',
    'requestAuth', 'getLocale', 'getTheme', 'openUrl', 'openRoute',
    'openWebPage', 'setTitle', 'setChrome', 'setNavBadge', 'setBackHandler',
    'close',
])

let capabilitiesCache: Promise<Set<string>> | null = null

/**
 * Поддерживает ли ПРИЛОЖЕНИЕ метод моста. Страницы деплоятся мгновенно,
 * приложение обновляется неделями — новый метод зовём только после проверки,
 * иначе деградируем (спрятать кнопку, обойтись без хаптики и т.п.).
 * На старом приложении без getCapabilities — фолбэк на список V1.
 */
export function supports(method: string): Promise<boolean> {
    if (!bridgeAvailable()) return Promise.resolve(false)
    capabilitiesCache ??= getCapabilities()
        .then((c) => new Set(c.methods))
        .catch(() => V1_METHODS)
    return capabilitiesCache.then((methods) => methods.has(method))
}

/**
 * Есть ли логин в ПРИЛОЖЕНИИ (не сессия страницы): дешёвый статус для
 * адаптации UI анонимной страницы, ничего не создаёт.
 */
export const isAuthorized = () => call<boolean>('isAuthorized')

/**
 * Одноразовый код авторизации по требованию (ленивая авторизация страницы).
 * interactive: false — только тихий путь (код, если приложение залогинено,
 * иначе null); true (по умолчанию) — при отсутствии логина откроется
 * нативный экран входа поверх вебвью. null — логина нет / пользователь
 * отменил. Обычно нужен не сам метод, а хелперы trySilentAuth()/ensureAuth()
 * из auth.ts — они и код обменяют.
 */
export const requestAuth = (opts?: { interactive?: boolean }) =>
    call<{ code: string } | null>('requestAuth', {
        interactive: opts?.interactive !== false,
    })

/** Язык интерфейса приложения. */
export const getLocale = () => call<'ru' | 'en' | 'ky'>('getLocale')

/**
 * Локаль без обращения к мосту — из ?locale= (его кладёт приложение при
 * загрузке, инлайн-скрипт layout'а сохраняет в sessionStorage). Доступна
 * синхронно с первого рендера; 'ru' — дефолт вне приложения.
 */
export function currentLocale(): 'ru' | 'en' | 'ky' {
    if (typeof window === 'undefined') return 'ru'
    const l =
        new URLSearchParams(window.location.search).get('locale') ||
        sessionStorage.getItem('bbg_locale')
    return l === 'en' || l === 'ky' ? l : 'ru'
}

/** Разрешённая тема приложения (system уже раскрыт в light/dark). */
export const getTheme = () => call<'light' | 'dark'>('getTheme')

/** Открыть внешнюю ссылку в системном браузере. */
export const openUrl = (url: string) => call<boolean>('openUrl', { url })

/** Открыть нативный экран приложения поверх вебвью (например '/profile'). */
export const openRoute = (route: string) =>
    call<boolean>('openRoute', { route })

/**
 * Открыть страницу сервиса ОТДЕЛЬНЫМ нативным экраном поверх текущего
 * (для «деталей») БЕЗ перезагрузки: приложение переносит вебвью на новый
 * экран и диспатчит `bbg:navigate` — BridgeNav делает SPA-переход Next'ом
 * (состояние и токены сохраняются). Нативные заголовок и свайп назад; под
 * жестом — предыдущий экран. Возврат по истории приложение делает само.
 * Относительный путь резолвится от текущего origin.
 */
export const openWebPage = (
    url: string,
    title?: string,
    opts?: { appBar?: boolean },
) =>
    call<boolean>('openWebPage', {
        url: new URL(url, window.location.origin).toString(),
        title,
        // false — экран без нативной шапки с первого кадра: страница рисует
        // свой заголовок, закрытие — closeWebview()
        appBar: opts?.appBar,
    })

/** Заголовок нативного AppBar (сбрасывается при смене страницы). */
export const setTitle = (title: string) => call<boolean>('setTitle', { title })

/**
 * Скрыть/показать нативный хром (шапку и нижнюю навигацию) — для
 * полноэкранных «деталей», рисующих свою шапку. Непереданное поле не
 * меняется; сбрасывается при смене страницы (не при SPA-переходах —
 * верните хром сами при уходе со страницы).
 */
export const setChrome = (chrome: { appBar?: boolean; navBar?: boolean }) =>
    call<boolean>('setChrome', chrome)

/** Бейдж-счётчик на пункте нижней навигации (count 0 — убрать). */
export const setNavBadge = (index: number, count: number) =>
    call<boolean>('setNavBadge', { index, count })

/** Закрыть вебвью (вернуться в приложение). */
export const closeWebview = () => call<boolean>('close')

/**
 * Перехват системного «назад»: пока включён, back/свайп не закрывает вебвью,
 * а вызывает handler (закройте свою модалку или позовите closeWebview()).
 * Возвращает функцию освобождения — отписывает и возвращает «назад» системе.
 */
export function interceptBack(handler: () => void): () => void {
    const listener = () => handler()
    window.addEventListener('bbg:back', listener)
    void call<boolean>('setBackHandler', { enabled: true }).catch(() => {})
    return () => {
        window.removeEventListener('bbg:back', listener)
        void call<boolean>('setBackHandler', { enabled: false }).catch(() => {})
    }
}

/**
 * Подписка на смену темы приложения, пока страница открыта (класс `dark`
 * приложение обновляет само — подписка нужна для реакции JS-кода страницы).
 * Возвращает функцию отписки.
 */
export function onThemeChanged(cb: (theme: 'light' | 'dark') => void) {
    const handler = (e: Event) =>
        cb((e as CustomEvent).detail === 'dark' ? 'dark' : 'light')
    window.addEventListener('bbg:themechanged', handler)
    return () => window.removeEventListener('bbg:themechanged', handler)
}

/**
 * Подписка на смену логина ПРИЛОЖЕНИЯ, пока страница открыта (разлогин или
 * вход в нативном профиле поверх вебвью). При false auth.ts уже почистил
 * токены страницы — колбэку остаётся перестроить UI (или сделать
 * trySilentAuth при true). Возвращает функцию отписки.
 */
export function onAuthChanged(cb: (authorized: boolean) => void) {
    const handler = (e: Event) => cb((e as CustomEvent).detail === true)
    window.addEventListener('bbg:authchanged', handler)
    return () => window.removeEventListener('bbg:authchanged', handler)
}

/** Подписка на смену языка приложения. Возвращает функцию отписки. */
export function onLocaleChanged(cb: (locale: 'ru' | 'en' | 'ky') => void) {
    const handler = (e: Event) => {
        const l = (e as CustomEvent).detail
        cb(l === 'en' || l === 'ky' ? l : 'ru')
    }
    window.addEventListener('bbg:localechanged', handler)
    return () => window.removeEventListener('bbg:localechanged', handler)
}
