// iOS Universal Links для go.bulbul.asia. Отдаётся как application/json без
// расширения в URL. appID = <TeamID>.<bundleId>. paths — whitelist (зеркало
// intent-filter в AndroidManifest): нативные роуты приложения + префиксы
// webview-сервисов /service/ и /s/ (слаг динамический, поэтому общий
// префикс). Всё остальное (/download, инвайт-лендинг /i/*, маркетинг) открыто
// в браузере и в приложение не ведёт.
export const dynamic = 'force-static'

const NATIVE_PREFIXES = [
    '/rideshare',
    '/freight',
    '/bus',
    '/real_estate',
    '/home',
    '/users',
    '/profile',
    '/login',
    '/messages',
    '/tab-settings',
]

const AASA = {
    applinks: {
        apps: [],
        details: [
            {
                appID: 'LH54VCD83H.com.bakasov.bulbulgo',
                paths: [
                    ...NATIVE_PREFIXES.flatMap((p) => [p, `${p}/*`]),
                    '/service/*',
                    '/s/*',
                ],
            },
        ],
    },
}

export function GET() {
    return Response.json(AASA)
}
