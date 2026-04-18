import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  await params;
  const t = await getTranslations('privacy');
  return {
    title: `${t('title')} | openDesk Edu`,
  };
}

export default async function PrivacyPage({params}: PageProps) {
  await params;
  const t = await getTranslations('privacy');

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose">
        <h1>{t('title')}</h1>

        {/* TODO: Legal review required */}

        <h2>{t('generalInfoHeading')}</h2>
        <p>{t('generalInfoP1')}</p>
        <p>{t('generalInfoP2')}</p>

        <h2>{t('dataProcessingHeading')}</h2>

        <h3>{t('analyticsCookiesHeading')}</h3>
        <p>
          {t.rich('analyticsCookiesP1', {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <ul>
          <li>
            {t.rich('plausibleItem', {
              strong: (chunks) => <strong>{chunks}</strong>,
              link: (chunks) => (
                <a
                  href="https://plausible.io/privacy-focused-web-analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </li>
          <li>
            {t.rich('clarityItem', {
              strong: (chunks) => <strong>{chunks}</strong>,
              link: (chunks) => (
                <a
                  href="https://clarity.microsoft.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </li>
        </ul>
        <p>{t('analyticsConsentP')}</p>

        <h3>{t('serverLogsHeading')}</h3>
        <p>{t('serverLogsP1')}</p>
        <ul>
          <li>{t('serverLog1')}</li>
          <li>{t('serverLog2')}</li>
          <li>{t('serverLog3')}</li>
          <li>{t('serverLog4')}</li>
          <li>{t('serverLog5')}</li>
          <li>{t('serverLog6')}</li>
        </ul>
        <p>{t('serverLogsP2')}</p>

        <h3>{t('contactSectionHeading')}</h3>
        <p>{t('contactSectionP')}</p>

        <h2>{t('sslHeading')}</h2>
        <p>{t('sslP')}</p>

        <h2>{t('cookiesHeading')}</h2>
        <p>{t('cookiesP')}</p>

        <h2>{t('externalLinksHeading')}</h2>
        <p>{t('externalLinksP')}</p>

        <h2>{t('yourRightsHeading')}</h2>
        <p>
          {t.rich('yourRightsP', {
            email: (chunks) => <a href="mailto:info@opendesk-edu.org">{chunks}</a>,
          })}
        </p>

        <h2>{t('contactHeading')}</h2>
        <p>{t('contactP')}</p>
        <p>
          {t.rich('contactEmail', {
            email: (chunks) => <a href="mailto:info@opendesk-edu.org">{chunks}</a>,
          })}
        </p>
      </article>
    </div>
  );
}
