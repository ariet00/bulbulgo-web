'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@doska/ui'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useLogin } from '@/hooks/mutations'
import { useRouter } from '@/i18n/routing'
import { useAuthStore } from '@/store/useAuthStore'

const schema = z.object({
  login: z.string().min(1, 'Введите логин или почту'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const login = useLogin()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' },
  })

  useEffect(() => {
    if (hydrated && token) router.replace('/dashboard')
  }, [hydrated, token, router])

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, { onSuccess: () => router.replace('/dashboard') }),
  )

  const errorMessage =
    (login.error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? (login.isError ? 'Не удалось войти' : null)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tglab</CardTitle>
          <CardDescription>Вход в кабинет</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин или почта</Label>
              <Input id="login" autoComplete="username" {...form.register('login')} />
              {form.formState.errors.login && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.login.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {errorMessage && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {errorMessage}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Учётные записи заводит администратор — регистрации нет.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
