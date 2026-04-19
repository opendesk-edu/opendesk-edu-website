"use client";

import {Link} from '@/i18n/navigation';
import EmailLink from "@/components/EmailLink";
import {useTranslations} from 'next-intl';

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
          </div>
          <p className="text-xs text-foreground-secondary">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
