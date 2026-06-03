'use client';

import { Link } from '@doska/i18n';
import { useMyCompanies } from '@doska/shared';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@doska/ui';
import { Building2, Plus, ArrowRight } from 'lucide-react';

export default function MyCompaniesPage() {
    const { data: companies = [], isLoading } = useMyCompanies();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Мои компании</h1>
                    <p className="text-sm text-muted-foreground">Выберите компанию, чтобы открыть панель управления</p>
                </div>
                <Link href="/company/create">
                    <Button><Plus className="mr-1 h-4 w-4" /> Создать компанию</Button>
                </Link>
            </div>

            {isLoading && <p className="text-muted-foreground">Загрузка…</p>}

            {!isLoading && companies.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">У вас пока нет компаний</p>
                        <Link href="/company/create">
                            <Button><Plus className="mr-1 h-4 w-4" /> Создать компанию</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((c) => (
                    <Link key={c.slug} href={`/dashboard/${c.slug}`}>
                        <Card className="h-full transition-colors hover:border-primary">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="h-4 w-4" />
                                    {c.name}
                                </CardTitle>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="flex items-center gap-2">
                                <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge>
                                <span className="text-xs text-muted-foreground">/{c.slug}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
