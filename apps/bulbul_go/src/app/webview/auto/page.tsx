import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query'
import { fetchCategories, fetchListings, fetchRates } from './lib/api'
import { defaultFeedFilters } from './lib/filters'
import { PAGE, qk } from './lib/queryKeys'
import { MarketClient } from './components/MarketClient'

// Webview-сервис «Авторынок» (карточка на «Главной»): лента объявлений
// поверх generic-marketplace (категория auto.cars). Заголовок экрана рисует
// нативный AppBar приложения — здесь только тело.
//
// Первый экран рендерится на сервере: каталог, первая страница ленты с
// дефолтными фильтрами и курсы префетчатся в QueryClient и уезжают в HTML
// через HydrationBoundary под теми же ключами, что читает MarketClient.
// Так карточки видны уже в момент коммита документа, а не после гидрации и
// трёх запросов — по метрике webview_load именно этот хвост давал секунду
// на Android. Страница ISR: Vercel отдаёт готовый HTML из edge-кэша и
// обновляет его в фоне раз в минуту; клиент всё равно тихо рефетчит ленту
// по staleTime (SWR), так что свежее объявление не ждёт минуту.
export const revalidate = 60

/** Первая активная ветка каталога — та же, что MarketClient берёт по
 * умолчанию (tabId стора пуст после полной загрузки). */
function firstTabId(
    catalog: Awaited<ReturnType<typeof fetchCategories>>,
): number | null {
    const auto = catalog.find((c) => c.slug === 'auto')
    const first = (auto?.children ?? [])
        .filter((c) => c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)[0]
    return first?.id ?? null
}

/** Данные первого экрана. Любой сбой API — страница уходит без данных и
 * работает как раньше (клиент запросит сам); сборка/регенерация не падает. */
async function prefetchFeed(): Promise<QueryClient> {
    const qc = new QueryClient()
    try {
        const catalog = await fetchCategories()
        qc.setQueryData(qk.catalog, catalog)
        const tabId = firstTabId(catalog)
        const filters = defaultFeedFilters()
        await Promise.all([
            tabId === null
                ? Promise.resolve()
                : qc.prefetchInfiniteQuery({
                      queryKey: qk.listings(tabId, filters),
                      queryFn: () => fetchListings(tabId, filters, 0, PAGE),
                      initialPageParam: 0,
                  }),
            qc.prefetchQuery({ queryKey: qk.rates, queryFn: fetchRates }),
        ])
    } catch {
        // без данных — как обычная клиентская страница
    }
    return qc
}

export default async function AutoMarketPage() {
    const qc = await prefetchFeed()
    return (
        <HydrationBoundary state={dehydrate(qc)}>
            <main>
                <MarketClient />
            </main>
        </HydrationBoundary>
    )
}
