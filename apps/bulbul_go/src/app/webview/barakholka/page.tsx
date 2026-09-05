import { ComingSoon } from '../ComingSoon'
import { Icon } from '../components/icons'

// Заглушка webview-сервиса `barakholka` (карточка «Барахолка» на «Главной»).

export default function BarakholkaPage() {
    return (
        <ComingSoon
            accent="#C24B6E"
            icon={<Icon name="tag" size={28} />}
            title="Барахолка"
            tagline="Объявления о вещах: продать ненужное и найти нужное — рядом с домом."
            bullets={[
                'Объявления рядом с вами',
                'Продажа за пару минут',
                'Чат с продавцом',
            ]}
        />
    )
}
