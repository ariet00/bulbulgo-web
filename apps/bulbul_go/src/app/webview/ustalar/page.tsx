import { ComingSoon } from '../ComingSoon'
import { Icon } from '../components/icons'

// Заглушка webview-сервиса `ustalar` (карточка «Усталар» на «Главной»).

export default function UstalarPage() {
    return (
        <ComingSoon
            accent="#B8862B"
            icon={<Icon name="wrench" size={28} />}
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
