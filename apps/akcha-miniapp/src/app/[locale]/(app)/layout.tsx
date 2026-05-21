import { AkchaNav } from '@/components/AkchaNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-4">{children}</div>
      <AkchaNav />
    </div>
  )
}
