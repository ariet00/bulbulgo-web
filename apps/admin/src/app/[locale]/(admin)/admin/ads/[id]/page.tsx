'use client'

import { useAdminUpdateAd } from '@/hooks/mutations/admin'
import { useAdminAd, useAdminAdStats } from '@/hooks/queries/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { use } from 'react'
import { AdForm } from '@/components/admin/ads/AdForm'

export default function AdminAdEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const adId = Number(id)

    const { data: ad, isLoading } = useAdminAd(adId)
    const { data: stats } = useAdminAdStats(adId)
    const updateMutation = useAdminUpdateAd()
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/ads">
                        <ArrowLeft className="size-4 mr-1" /> Назад
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Реклама #{adId}</h1>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Статистика</CardTitle>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/ads/${adId}/stats`}>
                            Подробная статистика
                            <ArrowUpRight className="size-4 ml-1" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="flex gap-8">
                    <Stat label="Показы" value={stats?.impressions ?? 0} />
                    <Stat label="Клики" value={stats?.clicks ?? 0} />
                    <Stat
                        label="CTR"
                        value={
                            stats ? `${(stats.ctr * 100).toFixed(1)}%` : '0%'
                        }
                    />
                </CardContent>
            </Card>

            {isLoading || !ad ? (
                <div>Загрузка…</div>
            ) : (
                <AdForm
                    initial={ad}
                    submitLabel="Сохранить"
                    submitting={updateMutation.isPending}
                    onSubmit={(body) =>
                        updateMutation.mutate(
                            { id: adId, body },
                            { onSuccess: () => router.push('/admin/ads') },
                        )
                    }
                />
            )}
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    )
}
