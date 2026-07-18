import '../auto-market.css'
import { FavoritesClient } from '../components/FavoritesClient'

// «Избранное» авторынка (переход из ленты).

export default function FavoritesPage() {
    return (
        <main className="am-root">
            <FavoritesClient />
        </main>
    )
}
