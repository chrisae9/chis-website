import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/posts/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
