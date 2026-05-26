'use client'

import { useAdminCompanies, useAdminDeleteCompany, useDebounce } from '@doska/shared'
import { Link } from '@doska/i18n'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { CompanyTypeSelect } from '@/components/admin/selectors/StaticSelects'

export default function AdminCompaniesPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)

    const { data: companies, isLoading } = useAdminCompanies(
        page,
        size,
        dq || undefined,
        typeFilter,
    )
    const deleteCompanyMutation = useAdminDeleteCompany()

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Удалить компанию "${name}"?`)) {
            deleteCompanyMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Companies</h1>
                <Link href="/admin/companies/new">
                    <Button size="sm">
                        <Plus className="size-4 mr-1" /> Создать
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Поиск по name/slug/id…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-md"
                        />
                        <div className="w-full sm:w-48">
                            <CompanyTypeSelect
                                value={typeFilter}
                                onChange={(v) => {
                                    setTypeFilter(v === '__all__' ? undefined : v)
                                    setPage(1)
                                }}
                                placeholder="Все типы"
                            />
                        </div>
                        {typeFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTypeFilter(undefined)
                                    setPage(1)
                                }}
                            >
                                Сброс типа
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies?.items.map((company: any) => (
                                        <TableRow key={company.id}>
                                            <TableCell>{company.id}</TableCell>
                                            <TableCell className="font-medium">
                                                {company.name}
                                            </TableCell>
                                            <TableCell>{company.slug}</TableCell>
                                            <TableCell>{company.type ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        company.status === 'active'
                                                            ? 'default'
                                                            : company.status === 'moderation'
                                                              ? 'outline'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {company.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Link href={`/admin/companies/${company.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/company/${company.slug}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                company.id,
                                                                company.name,
                                                            )
                                                        }
                                                        disabled={deleteCompanyMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {companies && (
                        <Pagination
                            page={companies.page}
                            total={companies.total}
                            size={companies.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
