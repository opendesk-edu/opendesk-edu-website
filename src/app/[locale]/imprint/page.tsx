import type { Metadata } from "next";
import {Link} from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('imprint');
  return {
    title: `${t('title')} | openDesk Edu`,
  };
}

export default async function ImprintPage() {
  const t = await getTranslations('imprint');

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose">
        <h1>{t('title')}</h1>

        <h2>{t('infoAccordingTo')}</h2>
        <p>
          <strong>{t('provider')}</strong>
          <br />
          Dr. GraphWiz AI &amp; XR Consulting and Development Services
          <br />
          Grundstraße 69
          <br />
          78628 Rottweil
          <br />
          Germany
        </p>

        <h2>{t('contactHeading')}</h2>
        <p>
          {t('emailLabel')}{" "}
          <a href="mailto:info@opendesk-edu.org">info@opendesk-edu.org</a>
        </p>

        <h2>{t('contentResponsibility')}</h2>
        <p>{t('contentResponsibilityText')}</p>

        <h2>{t('referencesAndLinks')}</h2>
        <p>{t('referencesAndLinksText')}</p>

        <h2>{t('copyrightHeading')}</h2>
        <p>{t('copyrightText')}</p>

        <h2>{t('warrantyHeading')}</h2>
        <p>{t('warrantyText')}</p>

        <h2>{t('privacyHeading')}</h2>
        <p>
          {t('privacyText')}{" "}
          <Link href="/privacy">{t('privacyLinkText')}</Link>{" "}
          {t('privacyTextAfter')}
        </p>

        <h2>{t('disputeResolution')}</h2>
        <p>
          {t('disputeResolutionText')}{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          {" "}{t('disputeResolutionAfter')}
        </p>
      </article>
    </div>
  );
}
