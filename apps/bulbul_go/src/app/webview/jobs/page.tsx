import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `jobs` (карточка «Вакансии» на «Главной»).

export default function JobsPage() {
    return (
        <ComingSoon
            accent="#2F8F6B"
            icon={<BriefcaseIcon />}
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

function BriefcaseIcon() {
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
            <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
            <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18M10.5 12.5h3" />
        </svg>
    )
}
