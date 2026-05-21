import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 ml-64">
                <AdminHeader />
                <main className="flex-1 p-6 overflow-x-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
