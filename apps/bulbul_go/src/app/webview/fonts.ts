import { Inter } from 'next/font/google'

// Основной шрифт вебвью — тот же Inter, что в приложении (google_fonts в
// core/theme/app_theme.dart), чтобы экраны сервиса не отличались от нативных
// подписями. Имя переменной --font-geist-sans взято не случайно: на неё
// замаплен --font-sans в @theme пакета @doska/ui, и утилита font-sans
// подхватывает шрифт без правки маппинга.
export const inter = Inter({
    subsets: ['cyrillic', 'latin'],
    variable: '--font-geist-sans',
    display: 'swap',
})
