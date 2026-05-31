import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      de: '/ueber-uns',
      fr: '/a-propos',
      zh: '/about'
    },
    '/imprint': {
      en: '/imprint',
      de: '/impressum',
      fr: '/mentions-legales',
      zh: '/imprint'
    },
    '/privacy': {
      en: '/privacy',
      de: '/datenschutz',
      fr: '/politique-de-confidentialite',
      zh: '/privacy'
    },
    '/components': '/components',
    '/docs': '/docs',
    '/blog': '/blog',
    '/blog/tag/[tag]': '/blog/tag/[tag]',
    '/[...slug]': '/[...slug]',
  }
});

