import '../auto-market.css'
import { FavoritesClient } from '../components/FavoritesClient'

// Таб «Избранные» авторынка.

export default function FavoritesPage() {
    return (
        <main className="am-root">
            <FavoritesClient />
        </main>
    )
}
