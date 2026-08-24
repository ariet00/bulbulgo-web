import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `booking` (карточка «Запись» на «Главной»).
// Витрина booking-домена: сейчас он живёт как Telegram Mini App на боте
// компании, здесь — точка входа из приложения.

export default function BookingPage() {
    return (
        <ComingSoon
            accent="#5B54C9"
            icon={<CalendarIcon />}
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

function CalendarIcon() {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" />
            <path d="m9 14.5 2 2 4-4" />
        </svg>
    )
}
