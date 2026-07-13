import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `delivery` (карточка «Доставка» на «Главной»).
// Курьерская доставка: по городу и между городами.

export default function DeliveryPage() {
    return (
        <ComingSoon
            accent="#1F86A8"
            icon={<ParcelIcon />}
            title="Доставка"
            tagline="Курьер для документов, посылок и покупок — по городу и между городами."
            bullets={[
                'Курьер по городу в день заказа',
                'Межгород по всей стране',
                'Статус доставки в приложении',
            ]}
        />
    )
}

function ParcelIcon() {
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
            <path d="M12 3.2 20.5 7.6v8.8L12 20.8 3.5 16.4V7.6L12 3.2Z" />
            <path d="M3.5 7.6 12 12l8.5-4.4M12 12v8.8" />
            <path d="m7.75 5.4 8.5 4.4" />
        </svg>
    )
}
