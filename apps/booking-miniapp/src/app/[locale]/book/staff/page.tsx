'use client'

import { Card, Skeleton } from '@doska/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { useEmployees, useServices } from '@/hooks/queries'

export default function BookStaffPage() {
  const router = useRouter()
  const params = useSearchParams()
  const serviceIds = params.getAll('service_ids').map((x) => parseInt(x, 10)).filter(Boolean)

  const { data: services } = useServices({ include_inactive: false })
  const { data: employees, isLoading } = useEmployees()

  const candidates = useMemo(() => {
    if (!services || !employees) return []
    const lists = serviceIds
      .map((sid) => services.find((s) => s.id === sid))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => s.staff_ids ?? [])

    // Empty staff_ids on a service = no restriction. Intersect only over the
    // services that actually constrain.
    const constraining = lists.filter((arr) => arr.length > 0)
    if (constraining.length === 0) return employees.filter((e) => e.is_owner)
    const intersection = constraining.reduce<number[]>((acc, arr) =>
      acc.length === 0 ? arr : acc.filter((x) => arr.includes(x)),
    [])
    return employees.filter((e) => intersection.includes(e.user_id))
  }, [services, employees, serviceIds])

  const goSlot = (uid: number) => {
    const qs = [
      ...serviceIds.map((id) => `service_ids=${id}`),
      `staff_id=${uid}`,
    ].join('&')
    router.push(`/book/slot?${qs}`)
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold mb-3">Выберите мастера</h1>

      {isLoading ? (
        <>
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full" />
        </>
      ) : candidates.length === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          Нет доступных мастеров для этих услуг.
        </Card>
      ) : (
        <div className="space-y-2">
          {candidates.map((emp) => (
            <Card
              key={emp.user_id}
              onClick={() => goSlot(emp.user_id)}
              className="p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {emp.color && (
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ background: emp.color }}
                  />
                )}
                <div>
                  <div className="font-medium">{emp.display_name}</div>
                  {emp.position && (
                    <div className="text-xs text-muted-foreground">{emp.position}</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
