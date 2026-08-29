import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `faq` (пункт «Частые вопросы» в профиле — hidden, на «Главной» не показывается).

export default function FaqPage() {
    return (
        <ComingSoon
            accent="#8A4FBE"
            icon={<QuestionIcon />}
            title="Частые вопросы"
            tagline="Ответы на вопросы про поездки, оплату и аккаунт — без обращения в поддержку."
            bullets={[
                'Поездки и оплата',
                'Аккаунт и профиль',
                'Безопасность',
            ]}
        />
    )
}

function QuestionIcon() {
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
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2.9-1.2 1.9" />
            <path d="M12 17h.01" />
        </svg>
    )
}
