import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `training` (пункт «Обучение» в профиле — hidden, на «Главной» не показывается).

export default function TrainingPage() {
    return (
        <ComingSoon
            accent="#2E7DD1"
            icon={<BookIcon />}
            title="Обучение"
            tagline="Короткие гайды и видео: как пользоваться приложением и работать с сервисами BulBul Go."
            bullets={[
                'Гайды по сервисам',
                'Видео-инструкции',
                'Советы для водителей',
            ]}
        />
    )
}

function BookIcon() {
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
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
            <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
        </svg>
    )
}
