// Абсолютный origin сайта для metadataBase (og:image и прочие абсолютные URL
// в превью ссылок). Домен не хардкодим: сейчас прод на bulbulgo-web.vercel.app,
// при привязке кастомного домена VERCEL_PROJECT_PRODUCTION_URL сам станет им.
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3004')

// Токен подтверждения домена в Facebook Business (Meta Business Suite →
// Brand Safety → Domains). Рендерится как
// <meta name="facebook-domain-verification"> в <head> публичных layout'ов.
export const FACEBOOK_DOMAIN_VERIFICATION = '6j4840w2q1m8n1ptaqvp1ieci52k6t'
