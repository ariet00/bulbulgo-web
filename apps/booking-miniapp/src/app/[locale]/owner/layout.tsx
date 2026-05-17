import { OwnerBootstrap } from '@/components/owner/OwnerBootstrap'
import { OwnerNav } from '@/components/owner/OwnerNav'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      <OwnerBootstrap />
      {children}
      <OwnerNav />
    </div>
  )
}
