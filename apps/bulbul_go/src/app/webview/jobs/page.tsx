import { ComingSoon } from '../ComingSoon'
import { Icon } from '../components/icons'

// Заглушка webview-сервиса `jobs` (карточка «Вакансии» на «Главной»).

export default function JobsPage() {
    return (
        <ComingSoon
            accent="#2F8F6B"
            icon={<Icon name="briefcase" size={28} />}
            title="Вакансии"
            tagline="Работа рядом с домом и работники, которых не приходится искать месяцами."
            bullets={[
                'Вакансии рядом с вами',
                'Размещение вакансии за минуту',
                'Отклики и связь напрямую',
            ]}
        />
    )
}
