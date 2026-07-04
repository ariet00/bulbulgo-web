import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { ThemeSync } from './ThemeSync'
import { WebviewErrorBoundary } from './WebviewErrorBoundary'

// Страницы для вебвью мобильного приложения: свой корневой layout без
// сайтового хрома (шапка/футер/локаль/next-auth) — AppBar рисует само
// приложение. Роуты /webview/* исключены из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    title: 'BulBul Go',
    robots: { index: false, follow: false },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

// Применяет тему и локаль ДО первой отрисовки (никакой белой вспышки):
// приложение передаёт ?theme= и ?locale= в URL, скрипт блокирующе вешает
// класс `dark` и атрибут lang; параметры запоминаются в sessionStorage,
// чтобы переживать внутренние переходы. Мостовой ThemeSync остаётся
// уточнением для страниц без параметров.
const themeInitJs = `(function () {
  try {
    var qs = new URLSearchParams(location.search);
    var qt = qs.get('theme');
    if (qt) sessionStorage.setItem('bbg_theme', qt);
    var t = qt || sessionStorage.getItem('bbg_theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
    var ql = qs.get('locale');
    if (ql) sessionStorage.setItem('bbg_locale', ql);
    var l = ql || sessionStorage.getItem('bbg_locale');
    if (l) document.documentElement.lang = l;
  } catch (e) {}
})();`

export default function WebviewLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // overflow-x-hidden на обоих уровнях: в вебвью не должно быть
        // горизонтального скрола, даже если контент шире экрана.
        // suppressHydrationWarning: класс dark ставится до гидрации.
        <html lang="ru" className="overflow-x-hidden" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitJs }} />
            </head>
            <body className="overflow-x-hidden max-w-[100vw] bg-background text-foreground antialiased">
                <ThemeSync />
                <WebviewErrorBoundary>{children}</WebviewErrorBoundary>
            </body>
        </html>
    )
}
