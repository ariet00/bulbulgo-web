import './fuel.css'
import { FuelClient } from './components/FuelClient'

// Webview-сервис «Где заправка» (карточка на «Главной»): краудсорс-карта
// наличия топлива — список АЗС по удалению со статусами по маркам.
// Заголовок экрана рисует нативный AppBar приложения — здесь только тело.

export default function FuelPage() {
    return (
        <main className="fl-root">
            <FuelClient />
        </main>
    )
}
