'use client'

import { useAdminAnalytics } from '@/hooks/queries/admin'
import { Users, FileText, MessageSquare, CheckCircle, Building2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Link } from '@/i18n/routing'

export default function AdminDashboard() {
    const { data: stats, isLoading } = useAdminAnalytics()

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <Link href="/admin/users">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Users</div>
                                <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/companies">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                                <Building2 className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Companies</div>
                                <div className="text-2xl font-bold">{stats?.total_companies || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/trips">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                                <FileText className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Trips</div>
                                <div className="text-2xl font-bold">{stats?.total_trips || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/vehicles">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 mr-4">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Vehicles</div>
                                <div className="text-2xl font-bold">{stats?.total_vehicles || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/chats">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Chats</div>
                                <div className="text-2xl font-bold">{stats?.total_chats || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
