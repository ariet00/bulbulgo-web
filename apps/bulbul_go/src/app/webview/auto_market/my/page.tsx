import '../auto-market.css'
import { MyListingsClient } from '../components/MyListingsClient'

// Таб «Мои» авторынка.

export default function MyListingsPage() {
    return (
        <main className="am-root">
            <MyListingsClient />
        </main>
    )
}
