'use client'

import { FeatureFlagsSettingsForm } from '@/components/admin/settings/FeatureFlagsSettingsForm'

export default function AdminAppFeaturesPage() {
    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <h1 className="text-2xl font-semibold">Feature flags</h1>
            <FeatureFlagsSettingsForm />
        </div>
    )
}
