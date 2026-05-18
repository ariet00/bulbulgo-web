import Link from 'next/link'
import { ReactNode } from 'react'

interface LegalLayoutProps {
  title: string
  subtitle?: string
  lastUpdated: string
  children: ReactNode
}

export function LegalLayout({ title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <nav className="mb-8 flex gap-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          ← Home
        </Link>
        <Link href="/privacy" className="hover:text-foreground hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground hover:underline">
          Terms
        </Link>
        <Link href="/data-deletion" className="hover:text-foreground hover:underline">
          Data deletion
        </Link>
      </nav>

      <header className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        <p className="mt-3 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>

      <article className="legal-article">
        {children}
      </article>
      <style>{`
        .legal-article { color: hsl(var(--foreground, 222 47% 11%)); line-height: 1.65; }
        .legal-article h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .legal-article h3 { font-size: 1.05rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .legal-article p { margin: 0.75rem 0; }
        .legal-article ul, .legal-article ol { padding-left: 1.5rem; margin: 0.75rem 0; }
        .legal-article li { margin: 0.35rem 0; }
        .legal-article ul li { list-style: disc; }
        .legal-article ol li { list-style: decimal; }
        .legal-article a { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; }
        .legal-article a:hover { color: #1d4ed8; }
        .legal-article code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.9em; }
        .legal-article table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.95em; }
        .legal-article th, .legal-article td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
        .legal-article th { background: #f8fafc; font-weight: 600; }
        .legal-article hr { margin: 2.5rem 0; border: 0; border-top: 1px solid #e2e8f0; }
      `}</style>
    </div>
  )
}
