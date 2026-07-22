// iOS Universal Links для go.bulbul.asia. Отдаётся как application/json без
// расширения в URL. appID = <TeamID>.<bundleId>. paths: все ссылки открывают
// приложение, кроме /download (там web, чтобы можно было установить апп) и
// инвайт-лендинга /i/* (человек должен увидеть страницу с промокодом и сам
// ввести его в приложении на экране входа).
export const dynamic = 'force-static'

const AASA = {
    applinks: {
        apps: [],
        details: [
            {
                appID: 'LH54VCD83H.com.bakasov.bulbulgo',
                paths: ['NOT /download', 'NOT /i/*', '*'],
            },
        ],
    },
}

export function GET() {
    return Response.json(AASA)
}
