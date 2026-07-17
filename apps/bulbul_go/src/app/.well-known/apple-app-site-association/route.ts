// iOS Universal Links для go.bulbul.asia. Отдаётся как application/json без
// расширения в URL. appID = <TeamID>.<bundleId>. paths: все ссылки открывают
// приложение, кроме /download (там web, чтобы можно было установить апп).
export const dynamic = 'force-static'

const AASA = {
    applinks: {
        apps: [],
        details: [
            {
                appID: 'LH54VCD83H.com.bakasov.bulbulgo',
                paths: ['NOT /download', '*'],
            },
        ],
    },
}

export function GET() {
    return Response.json(AASA)
}
