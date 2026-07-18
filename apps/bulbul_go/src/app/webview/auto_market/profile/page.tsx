import '../auto-market.css'
import { ProfileClient } from '../components/ProfileClient'
import { TabBar } from '../components/TabBar'

// Таб «Профиль» авторынка.

export default function ProfilePage() {
    return (
        <main className="am-root">
            <ProfileClient />
            <TabBar active="profile" />
        </main>
    )
}
