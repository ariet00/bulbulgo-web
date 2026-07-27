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
        <main>
            <OwnerClient id={Number(id)} />
        </main>
    )
}
