import './fuel.css'
import { TabBar } from './components/TabBar'

// Layout сегмента «Где заправка»: таббар живёт здесь, а не в страницах —
// layout НЕ перемонтируется при переходах, подсветка активного таба
// срабатывает мгновенно по тапу (оптимистично), пока Next догружает страницу.

export default function FuelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fl-root">
            {children}
            <TabBar />
        </div>
    )
}
