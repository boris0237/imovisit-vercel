/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  }
}

export default nextConfig
