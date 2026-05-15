import { OwnerNav } from '@/components/owner/OwnerNav'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <OwnerNav />
    </div>
  )
}
