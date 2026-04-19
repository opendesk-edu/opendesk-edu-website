import '../globals.css';

import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {ThemeProvider} from '@/components/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import CookieConsent from '@/components/CookieConsent';
import SearchDialogWrapper from '@/components/SearchDialogWrapper';
import {SearchProvider} from '@/components/SearchContext';
import {SITE_URL, SITE_NAME, SITE_DESCRIPTION} from '@/lib/config';
import Script from 'next/script';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;

  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${locale}`,
      locale,
      siteName: SITE_NAME,
      images: ["/static/brand/og-image.png"],
      alternateLocale: routing.locales.filter((l) => l !== locale),
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: [{ url: "/static/brand/icon.svg", type: "image/svg+xml" }],
    manifest: "/static/manifest.json",
    robots: { index: true, follow: true },
  };
}

function JsonLdOrganization({ locale }: { locale: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/static/brand/icon.svg`,
    description: locale === 'de'
      ? "Open-Source-Digitalarbeitsplatz für Hochschulen."
      : locale === 'fr'
        ? "Espace de travail numérique open source pour l'enseignement supérieur."
        : locale === 'zh'
          ? "面向高等教育的开源数字化工作平台。"
          : "Open-source digital workplace for higher education.",
    inLanguage: locale,
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@opendesk-edu.org",
      contactType: "customer service",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="light"?"light":"dark";document.documentElement.setAttribute("data-theme",d)}catch(e){}})()`,
      }}
    />
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} antialiased`} data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#341291" />
        <ThemeScript />
        <JsonLdOrganization locale={locale} />
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white"
          >
            Skip to content
          </a>
          <NextIntlClientProvider messages={messages}>
            <SearchProvider>
              <Header />
            <ErrorBoundary>
              <main id="main-content">
                {children}
              </main>
            </ErrorBoundary>
            <Footer />
            <ScrollToTop />
            <CookieConsent />
            <SearchDialogWrapper />
            <Script
              src="https://analytics.opendesk-edu.org/script.js"
              data-website-id="REPLACE_WITH_WEBSITE_ID"
              strategy="afterInteractive"
            />
            </SearchProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
