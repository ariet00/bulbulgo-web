'use client'

import { useAdminAnalytics } from '@doska/shared'
import { Users, FileText, MessageSquare, CheckCircle, Building2, Smartphone, Monitor, Globe, Info } from 'lucide-react'
import { Card, CardContent } from "@doska/ui"
import { Link } from '@doska/i18n'

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
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
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
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Trips</div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Platforms */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Smartphone className="mr-2 h-5 w-5" /> Platforms
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Android</span>
                                <span className="font-bold">{stats?.platforms?.android || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">iOS</span>
                                <span className="font-bold">{stats?.platforms?.ios || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Web</span>
                                <span className="font-bold">{stats?.platforms?.web || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trip Stats */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="mr-2 h-5 w-5" /> Trip Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Chat Parser Trips (ID: 22)</span>
                                <span className="font-bold text-blue-600">{stats?.chat_parser_trips || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Other Users Trips</span>
                                <span className="font-bold">{stats?.other_users_trips || 0}</span>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="text-sm font-medium mb-2 uppercase text-xs text-gray-400">By Type</div>
                                {Object.entries(stats?.trips_by_type || {}).map(([type, count]: [string, any]) => (
                                    <div key={type} className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-500 capitalize">{type}</span>
                                        <span className="font-medium text-sm">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trip Statuses */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Info className="mr-2 h-5 w-5" /> Trip Statuses
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(stats?.trips_by_status || {}).map(([status, count]: [string, any]) => (
                                <div key={status} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 capitalize">{status}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-sm font-medium mb-2 uppercase text-xs text-gray-400 flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3" /> Vehicles by Type
                            </h4>
                            <div className="space-y-1">
                                {Object.entries(stats?.vehicles_by_type || {}).map(([type, count]: [string, any]) => (
                                    <div key={type} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 capitalize">{type}</span>
                                        <span className="font-medium text-sm">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
