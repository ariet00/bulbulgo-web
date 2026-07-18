import './auto-market.css'
import { MarketClient } from './components/MarketClient'
import { TabBar } from './components/TabBar'

// Webview-сервис «Авторынок» (карточка на «Главной»): лента объявлений
// поверх generic-marketplace (категория auto.cars). Заголовок экрана рисует
// нативный AppBar приложения — здесь только тело.

export default function AutoMarketPage() {
    return (
        <main className="am-root">
            <MarketClient />
            <TabBar active="search" />
        </main>
    )
}
