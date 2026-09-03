import { AppFooter } from '@/components/shell/AppFooter'
import { AppHeader } from '@/components/shell/AppHeader'

// Signed-in workspace: header + footer around every product page. Legal and
// auth routes live outside this group and render without the shell.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>
      <AppFooter />
    </>
  )
}
