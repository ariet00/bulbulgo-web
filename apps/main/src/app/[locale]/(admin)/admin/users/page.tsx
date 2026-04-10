'use client'

import { useAdminBanUser } from '@doska/shared'
import { useState } from 'react'
import { useAdminUsers } from '@doska/shared'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@doska/ui"
import { Button } from "@doska/ui"
import { Ban, CheckCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"

export default function UsersPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const { data: users, isLoading } = useAdminUsers(page, size)
    const banUserMutation = useAdminBanUser()

    const handleBan = (id: number, isActive: boolean) => {
        if (confirm(`Are you sure you want to ${isActive ? 'unban' : 'ban'} this user?`)) {
            banUserMutation.mutate({ id, isActive })
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.items.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <span className="text-green-600 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-red-600 flex items-center">
                                                    <Ban className="h-4 w-4 mr-1" /> Banned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant={user.is_active ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleBan(user.id, !user.is_active)}
                                                >
                                                    {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {users && (
                        <Pagination
                            page={users.page}
                            total={users.total}
                            size={users.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
