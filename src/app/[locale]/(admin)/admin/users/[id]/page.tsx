'use client'

import { useAdminBanUser } from '@/hooks/mutations/admin'
import { useAdminUser } from '@/hooks/queries/admin'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Ban, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from '@/components/ui/back-button'

export default function UserDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: user, isLoading, refetch } = useAdminUser(id)
    const banUserMutation = useAdminBanUser()

    const handleBan = () => {
        if (!user) return
        if (confirm(`Are you sure you want to ${user.is_active ? 'ban' : 'unban'} this user?`)) {
            banUserMutation.mutate({ id: user.id, isActive: !user.is_active })
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (!user) return <div>User not found</div>

    return (
        <div className="space-y-6">
            <BackButton />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Details: {user.username}</h1>
                <Button
                    variant={user.is_active ? "destructive" : "default"}
                    onClick={handleBan}
                >
                    {user.is_active ? (
                        <>
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Unban User
                        </>
                    )}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
                            <div className="mt-1 text-lg">{user.id}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                            <div className="mt-1 text-lg">{user.email}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                            <div className="mt-1 text-lg">{user.phone || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                            <div className="mt-1 text-lg">
                                {user.is_active ? 'Active' : 'Banned'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Online</label>
                            <div className="mt-1 text-lg">{user.last_online_at ? new Date(user.last_online_at).toLocaleString() : '-'}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
