import { Suspense } from 'react'
import '../auto-market.css'
import { WizardClient } from '../components/wizard/WizardClient'

// Подача объявления: /webview/auto_market/new (продажа, 4 шага) и
// /webview/auto_market/new?kind=want («куплю», одна форма).

export default function NewListingPage() {
    return (
        <main className="am-root">
            {/* useSearchParams в клиенте требует Suspense-границу */}
            <Suspense>
                <WizardClient />
            </Suspense>
        </main>
    )
}
