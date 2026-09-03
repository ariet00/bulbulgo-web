import { Link } from '@doska/i18n'

const LINKS = [
  { href: '/privacy', label: 'Конфиденциальность' },
  { href: '/terms', label: 'Условия использования' },
  { href: '/data-deletion', label: 'Удаление данных' },
] as const

export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} BulBul</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Документы">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
