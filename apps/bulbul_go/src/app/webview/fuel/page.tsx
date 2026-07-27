import { FuelClient } from './components/FuelClient'

// Таб «Лента» сервиса «Где заправка»: список АЗС по удалению со статусами
// наличия по маркам. Заголовок экрана рисует нативный AppBar приложения.

export default function FuelPage() {
    return (
        <main>
            <FuelClient />
        </main>
    )
}
