'use client'

import { SubscriptionSettingsForm } from '@/components/admin/settings/SubscriptionSettingsForm'

export default function AdminSubscriptionSettingsPage() {
    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <h1 className="text-2xl font-semibold">Настройки подписок</h1>
            <SubscriptionSettingsForm />
        </div>
    )
}
