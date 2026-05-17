'use client'

import { Button, Card, Input, Label, Skeleton } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useDeleteEmployee, useUpdateEmployee } from '@/hooks/mutations'
import { useEmployees } from '@/hooks/queries'

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const userId = Number(params.id)
  const { data, isLoading } = useEmployees()
  const employee = data?.find((e) => e.user_id === userId) ?? null

  const update = useUpdateEmployee()
  const remove = useDeleteEmployee()

  const [displayName, setDisplayName] = useState('')
  const [position, setPosition] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (!employee) return
    setDisplayName(employee.display_name)
    setPosition(employee.position ?? '')
    setColor(employee.color ?? '')
  }, [employee])

  const save = async () => {
    if (!employee) return
    try {
      await update.mutateAsync({
        userId: employee.user_id,
        body: { display_name: displayName, position, color },
      })
      toast.success('Сохранено')
      router.push('/owner/employees')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const onDelete = async () => {
    if (!employee) return
    if (!confirm('Удалить сотрудника?')) return
    try {
      await remove.mutateAsync(employee.user_id)
      toast.success('Удалено')
      router.push('/owner/employees')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/employees">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Сотрудник</h1>
      </div>

      {isLoading && !data ? (
        <Skeleton className="h-40 w-full" />
      ) : !employee ? (
        <p className="text-sm text-muted-foreground">Сотрудник не найден.</p>
      ) : (
        <Card className="p-3 space-y-3">
          <div>
            <Label>Имя для записей</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label>Должность</Label>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Мастер, администратор…"
            />
          </div>
          <div>
            <Label>Цвет (HEX)</Label>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#3b82f6"
            />
            <p className="text-xs text-muted-foreground mt-1">Будет использоваться в календаре.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={save} disabled={update.isPending}>
              Сохранить
            </Button>
            <Button variant="outline" onClick={onDelete} disabled={remove.isPending}>
              Удалить
            </Button>
          </div>
        </Card>
      )}
    </main>
  )
}
