import { cn } from '@doska/shared'
import { Link } from '@doska/i18n'

export function Wordmark({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="BulBul Social, на главную"
    >
      <span
        aria-hidden
        className={cn('rounded-full bg-brand', size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5')}
      />
      <span
        className={cn(
          'font-display font-semibold tracking-tight text-foreground',
          size === 'lg' ? 'text-2xl' : 'text-[15px]',
        )}
      >
        BulBul Social
      </span>
    </Link>
  )
}
