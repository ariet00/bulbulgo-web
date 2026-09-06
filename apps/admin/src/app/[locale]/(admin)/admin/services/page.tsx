'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Link } from '@doska/i18n'
import { LayoutGrid, Plus } from 'lucide-react'
import { useAdminServices } from '@/hooks/queries/admin'
import { ServiceTree } from '@/components/admin/services/ServiceTree'

export default function AdminServicesPage() {
    const { data, isLoading } = useAdminServices()

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Сервисы приложения</h1>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href="/admin/services/groups">
                            <LayoutGrid className="size-4 mr-1" /> Группы
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/admin/services/new">
                            <Plus className="size-4 mr-1" /> Создать
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Реестр «Главной», табов и разделов</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Порядок строк — это и есть порядок карточек на «Главной»
                        (поле position): перетащите строку за ручку слева.
                        Раскрытая строка показывает плитки раздела и чипы ленты.
                    </p>
                </CardHeader>
                <CardContent>
                    <ServiceTree services={data} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    )
}
