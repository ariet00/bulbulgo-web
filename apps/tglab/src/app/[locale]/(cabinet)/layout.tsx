import { CabinetShell } from '@/components/layout/CabinetShell'

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return <CabinetShell>{children}</CabinetShell>
}
