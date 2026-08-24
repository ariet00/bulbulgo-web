import { DetailClient } from '../components/DetailClient'

// Страница объявления авторынка (внутренний переход из ленты либо диплинк).

export default async function ListingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <main>
            <DetailClient id={Number(id)} />
        </main>
    )
}
