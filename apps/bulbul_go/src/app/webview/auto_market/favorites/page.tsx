import '../auto-market.css'
import { FavoritesClient } from '../components/FavoritesClient'
import { TabBar } from '../components/TabBar'

// Таб «Избранные» авторынка.

export default function FavoritesPage() {
    return (
        <main className="am-root">
            <FavoritesClient />
            <TabBar active="favorites" />
        </main>
    )
}
