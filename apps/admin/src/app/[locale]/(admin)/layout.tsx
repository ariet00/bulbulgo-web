import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, getMe } from '@doska/shared'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    // The middleware only checks the next-auth cookie, which can outlive the
    // backend session (e.g. after a backend DB/session reset). Verify the
    // session is still alive on the backend; if not, send the user to log in
    // again instead of rendering a broken shell over a dead session.
    let sessionExpired = false
    try {
        const session = await getServerSession(authOptions)
        if (session) {
            await getMe()
        }
    } catch (err) {
        if ((err as { response?: { status?: number } })?.response?.status === 401) {
            sessionExpired = true
        }
        // Other errors (backend down, network) shouldn't hard-block the admin.
    }
    if (sessionExpired) {
        redirect(`/${locale}/login?error=session_expired`)
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                <AdminHeader />
                <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
