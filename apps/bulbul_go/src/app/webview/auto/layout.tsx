import { TabBar } from './components/TabBar'

// Layout сегмента авторынка: таббар живёт здесь, а не в страницах — layout
// НЕ перемонтируется при переходах, поэтому подсветка активного таба
// срабатывает мгновенно по тапу (оптимистично), пока Next догружает страницу.
// На глубоких экранах (карточка, wizard, владелец) таббар скрывает себя сам
// по pathname.

export default function AutoMarketLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            {children}
            <TabBar />
        </div>
    )
}
