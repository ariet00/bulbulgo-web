import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRODUCT: 'tglab',
  },
  transpilePackages: ['@doska/ui', '@doska/shared', '@doska/i18n'],
}

export default withNextIntl(nextConfig)
