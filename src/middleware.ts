import createMiddleware from 'next-intl/middleware';
import type { Config } from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

export const config: Config = {
  matcher: ['/', '/(fr|en)/:path*']
};
