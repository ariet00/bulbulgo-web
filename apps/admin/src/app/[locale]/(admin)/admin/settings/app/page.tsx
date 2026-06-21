'use client'

import { AppVersionSettingsForm } from '@/components/admin/settings/AppVersionSettingsForm'

export default function AdminAppSettingsPage() {
    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <h1 className="text-2xl font-semibold">Настройки приложения</h1>
            <AppVersionSettingsForm />
        </div>
    )
}
