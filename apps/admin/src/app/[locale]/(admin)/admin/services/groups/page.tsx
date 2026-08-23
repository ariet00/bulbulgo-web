'use client'

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Link } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import {
    ServiceGroupCard,
    ServiceGroupCreate,
} from '@/components/admin/services/ServiceGroupCard'
import { useAdminCreateServiceGroup } from '@/hooks/mutations/admin'
import { useAdminServiceGroups, useAdminServices } from '@/hooks/queries/admin'

export default function AdminServiceGroupsPage() {
    const { data, isLoading } = useAdminServiceGroups()
    const { data: services } = useAdminServices()
    const createMutation = useAdminCreateServiceGroup()

    const groups = data?.groups ?? []
    const ungrouped = data?.ungrouped ?? []
    const bySlug = new Map((services ?? []).map((s) => [s.slug, s]))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/services">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Группы сервисов</h1>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Группы — это секции «Главной» в приложении. Сервис может входить в
                несколько групп, и в каждой у него свой порядок. Порядок секций
                задаётся полем «Позиция».
            </p>

            {ungrouped.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Не разложены ({ungrouped.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Эти сервисы не входят ни в одну группу и попадут на
                            «Главную» отдельной секцией без заголовка.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {ungrouped.map((slug) => (
                                <Badge key={slug} variant="secondary">
                                    {bySlug.get(slug)?.label?.ru ?? slug}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <ServiceGroupCreate
                submitting={createMutation.isPending}
                onCreate={(body) => createMutation.mutate(body)}
            />

            {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {!isLoading && groups.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Групп пока нет — создайте первую и разложите по ней сервисы.
                </p>
            )}

            <div className="space-y-4">
                {groups.map((group) => (
                    <ServiceGroupCard
                        key={group.id}
                        group={group}
                        services={services ?? []}
                    />
                ))}
            </div>
        </div>
    )
}
