import { ComingSoon } from '../ComingSoon'
import { Icon } from '../components/icons'

// Заглушка webview-сервиса `delivery` (карточка «Доставка» на «Главной»).
// Курьерская доставка: по городу и между городами.

export default function DeliveryPage() {
    return (
        <ComingSoon
            accent="#1F86A8"
            icon={<Icon name="package" size={28} />}
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
