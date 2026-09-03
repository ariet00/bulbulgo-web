import type { NextConfig } from 'next'

import createNextIntlPlugin from 'next-intl/plugin'


const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  env: {
    // X-Product / X-Client value — must match backend shared/products.py:Product
    NEXT_PUBLIC_PRODUCT: 'content_manager',
  },
  transpilePackages: ['@doska/shared', '@doska/ui'],
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
