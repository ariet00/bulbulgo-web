import type { NextConfig } from 'next'

import createNextIntlPlugin from 'next-intl/plugin'


const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRODUCT: 'bulbulgo',
  },
  // OG-картинки читают шрифты Montserrat с диска (fs.readFile) — форсим их
  // включение в serverless-бандлы этих функций, иначе на проде ENOENT.
  outputFileTracingIncludes: {
    '/rideshare/trips/[id]/opengraph-image': ['./src/app/_og/_Montserrat-*.ttf', './public/favicon.png'],
    '/opengraph-image': ['./src/app/_og/_Montserrat-*.ttf', './public/favicon.png'],
    '/download/opengraph-image': ['./src/app/_og/_Montserrat-*.ttf', './public/favicon.png'],
    '/[locale]/opengraph-image': ['./src/app/_og/_Montserrat-*.ttf', './public/favicon.png'],
  },
  // Dev с реального устройства по LAN-IP (webview-сервисы): разрешаем
  // hot-reload ресурсы Next для приватных адресов. На prod не влияет.
  allowedDevOrigins: ['192.168.75.44', 'localhost', '127.0.0.1', '10.0.2.2', '172.20.10.8'],
  images: {
    // Disable image optimization in development to avoid "resolved to private ip" errors
    // when fetching from local MinIO (localhost:9000)
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
