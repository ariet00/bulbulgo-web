'use client'

import { useAdminBanUser, useDebounce } from '@doska/shared'
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
import { Button, Input } from "@doska/ui"
import { Ban, CheckCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"

export default function UsersPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const { data: users, isLoading } = useAdminUsers(page, size, dq || undefined)
    const banUserMutation = useAdminBanUser()

    const handleBan = (id: number, isActive: boolean) => {
        if (confirm(`Are you sure you want to ${isActive ? 'unban' : 'ban'} this user?`)) {
            banUserMutation.mutate({ id, isActive })
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Поиск по имени/телефону/email/id…"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value)
                            setPage(1)
                        }}
                        className="w-full sm:max-w-xs"
                    />
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                    <div className="rounded-md border overflow-x-auto">
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
                    )}
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
