'use client'

import { useState } from 'react'
import { useAdminCompanies } from '@/hooks/queries/admin'
import { useAdminDeleteCompany } from '@/hooks/mutations/admin'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, Building2 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Pagination } from '@/components/ui/pagination-custom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminCompaniesPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const { data: companies, isLoading } = useAdminCompanies(page, size)
    const deleteCompanyMutation = useAdminDeleteCompany()

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete company "${name}"?`)) {
            deleteCompanyMutation.mutate(id)
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Companies</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Company Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
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
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>{company.slug}</TableCell>
                                        <TableCell>{company.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                company.status === 'active' ? 'default' : 
                                                company.status === 'moderation' ? 'outline' : 'destructive'
                                            }>
                                                {company.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/company/${company.slug}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(company.id, company.name)}
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
