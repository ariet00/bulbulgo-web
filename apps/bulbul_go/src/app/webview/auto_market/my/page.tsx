import '../auto-market.css'
import { MyListingsClient } from '../components/MyListingsClient'

// «Мои объявления» авторынка (переход из ленты).

export default function MyListingsPage() {
    return (
        <main className="am-root">
            <MyListingsClient />
        </main>
    )
}
