import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `auto_market` (карточка «Авторынок» на «Главной»).
// Наполнение сервиса ещё не определено — состав пунктов ниже предварительный.

export default function AutoMarketPage() {
    return (
        <ComingSoon
            accent="#E8603C"
            icon={<CarIcon />}
            title="Авторынок"
            tagline="Всё про машины в одном месте: покупка и продажа, запчасти, сервисы и дилеры."
            bullets={[
                'Продажа и покупка авто',
                'Запчасти и разбор',
                'Автосервисы и дилеры',
            ]}
        />
    )
}

function CarIcon() {
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
            <path d="M5 17h14M4 17v-4.2a2 2 0 0 1 .2-.9l1.9-3.8A2 2 0 0 1 7.9 7h8.2a2 2 0 0 1 1.8 1.1l1.9 3.8a2 2 0 0 1 .2.9V17" />
            <path d="M4 17v2h2.5v-2M17.5 17v2H20v-2M5.5 12.5h13" />
            <circle cx="8" cy="14.5" r="1" />
            <circle cx="16" cy="14.5" r="1" />
        </svg>
    )
}
