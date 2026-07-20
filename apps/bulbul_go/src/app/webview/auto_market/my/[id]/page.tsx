import '../../auto-market.css'
import { OwnerClient } from '../../components/owner/OwnerClient'

// Страница управления объявлением (только владелец): статус, статистика,
// быстрые действия и пополевое редактирование через боттом-шиты.

export default async function OwnerListingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <main className="am-root">
            <OwnerClient id={Number(id)} />
        </main>
    )
}
