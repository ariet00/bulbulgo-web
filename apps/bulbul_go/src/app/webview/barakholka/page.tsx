import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `barakholka` (карточка «Барахолка» на «Главной»).

export default function BarakholkaPage() {
    return (
        <ComingSoon
            accent="#C24B6E"
            icon={<TagIcon />}
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

function TagIcon() {
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
            <path d="M11 3.5H4.8a1.3 1.3 0 0 0-1.3 1.3V11a2 2 0 0 0 .6 1.4l7.3 7.3a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8l-7.3-7.3A2 2 0 0 0 11 3.5Z" />
            <circle cx="8" cy="8" r="1.3" />
        </svg>
    )
}
