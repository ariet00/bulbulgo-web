import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `ideas` (пункт «Идеи и предложения» в профиле — hidden, на «Главной» не показывается).

export default function IdeasPage() {
    return (
        <ComingSoon
            accent="#7CB342"
            icon={<LightbulbIcon />}
            title="Идеи и предложения"
            tagline="Делитесь идеями по улучшению BulBul Go — мы читаем каждое предложение."
            bullets={[
                'Отправка идеи в пару тапов',
                'Голосование за лучшие идеи',
                'Статус рассмотрения от команды',
            ]}
        />
    )
}

function LightbulbIcon() {
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
            <path d="M9 18h6M10 21h4" />
            <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 .96 1.1 1.6l.1.5h4.6l.1-.5c.1-.64.5-1.16 1.1-1.6A6 6 0 0 0 12 3Z" />
        </svg>
    )
}
