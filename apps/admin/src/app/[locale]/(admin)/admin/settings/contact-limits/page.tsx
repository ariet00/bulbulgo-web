'use client'

import { ContactLimitsSettingsForm } from '@/components/admin/settings/ContactLimitsSettingsForm'

export default function AdminContactLimitsPage() {
    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <h1 className="text-2xl font-semibold">Лимиты просмотра номеров</h1>
            <ContactLimitsSettingsForm />
        </div>
    )
}
