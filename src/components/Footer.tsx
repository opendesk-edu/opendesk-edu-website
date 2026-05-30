"use client";

import {Link} from '@/i18n/navigation';
import EmailLink from "@/components/EmailLink";
import {useTranslations, useLocale} from 'next-intl';

function ExternalLink({href, children, className}: {href: string; children: React.ReactNode; className?: string}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/imprint" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              {t('imprint')}
            </Link>
            <Link href="/privacy" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              {t('privacy')}
            </Link>
            <EmailLink className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              {t('contact')}
            </EmailLink>
            <span className="text-border">|</span>
            <ExternalLink
              href="https://codeberg.org/opendesk-edu/opendesk-edu-website"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {t('sourceCode')}
            </ExternalLink>
            <span className="text-border">|</span>
            <a
              href={`/${locale}/rss`}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1"
              aria-label={t('rss')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93v-2.83Z" />
              </svg>
              <span>{t('rss')}</span>
            </a>
          </div>
          <p className="text-xs text-foreground-secondary">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
