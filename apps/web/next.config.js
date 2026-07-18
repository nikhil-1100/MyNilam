/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-storage-domain.com'],
  },
  transpilePackages: ['@repo/shared'],
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '**/apps/backend/**',
        '**/apps/mobile/**',
      ]
    }
  }
}

module.exports = nextConfig
