import { ComingSoon } from '../ComingSoon'

// Заглушка webview-сервиса `ustalar` (карточка «Усталар» на «Главной»).

export default function UstalarPage() {
    return (
        <ComingSoon
            accent="#B8862B"
            icon={<ToolsIcon />}
            title="Усталар"
            tagline="Мастера на все руки: ремонт, отделка, электрика, сантехника — рядом и с отзывами."
            bullets={[
                'Мастера по ремонту и отделке',
                'Рейтинги и отзывы',
                'Заявка в один тап',
            ]}
        />
    )
}

function ToolsIcon() {
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
            <path d="M14.5 6.2a3.6 3.6 0 0 0 4.8 4.6l-8 8a2.1 2.1 0 0 1-3-3l6.2-9.6Z" />
            <path d="M6.8 4.5 4 7.3l2.6 2.6 2-1.3 1.3-2L6.8 4.5Z" />
            <path d="m8.6 8.6 3 3" />
        </svg>
    )
}
