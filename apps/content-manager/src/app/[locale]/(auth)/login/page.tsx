'use client'

import { Button } from '@doska/ui'
import { Link } from '@doska/i18n'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

import { Wordmark } from '@/components/shell/Wordmark'

function GoogleGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4.5 w-4.5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z" />
    </svg>
  )
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <Wordmark size="lg" />
            <p className="text-muted-foreground">
              Соцсети вашего бизнеса в одном рабочем месте: публикации, ответы
              и статистика.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border bg-card p-6">
            <Button
              size="lg"
              className="w-full gap-3"
              onClick={() => signIn('google', { callbackUrl })}
            >
              <GoogleGlyph />
              Войти через Google
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Входя, вы принимаете{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                условия использования
              </Link>{' '}
              и{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                политику конфиденциальности
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
