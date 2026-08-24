import { Suspense } from 'react'
import { WizardClient } from '../components/wizard/WizardClient'

// Подача объявления: /webview/auto/new (продажа, 4 шага) и
// /webview/auto/new?kind=want («куплю», одна форма).

export default function NewListingPage() {
    return (
        <main>
            {/* useSearchParams в клиенте требует Suspense-границу */}
            <Suspense>
                <WizardClient />
            </Suspense>
        </main>
    )
}
