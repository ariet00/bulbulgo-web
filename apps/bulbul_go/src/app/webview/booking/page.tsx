import { ComingSoon } from '../ComingSoon'
import { Icon } from '../components/icons'

// Заглушка webview-сервиса `booking` (карточка «Запись» на «Главной»).
// Витрина booking-домена: сейчас он живёт как Telegram Mini App на боте
// компании, здесь — точка входа из приложения.

export default function BookingPage() {
    return (
        <ComingSoon
            accent="#5B54C9"
            icon={<Icon name="calendarCheck" size={28} />}
            title="Запись"
            tagline="Онлайн-запись к мастерам, врачам и специалистам — без звонков и переписок."
            bullets={[
                'Свободные окошки в календаре',
                'Запись за пару тапов',
                'Напоминание о визите',
            ]}
        />
    )
}
