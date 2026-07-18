import '../auto-market.css'
import { MyListingsClient } from '../components/MyListingsClient'
import { TabBar } from '../components/TabBar'

// Таб «Мои» авторынка.

export default function MyListingsPage() {
    return (
        <main className="am-root">
            <MyListingsClient />
            <TabBar active="my" />
        </main>
    )
}
