import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aiStatement');
  return {
    title: `${t('title')} | openDesk Edu`,
  };
}

export default async function AIStatementPage() {
  const t = await getTranslations('aiStatement');

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose">
        <h1>{t('title')}</h1>
        <p>{t('updated', { date: t('updatedDate') })}</p>

        <h2>{t('overviewHeading')}</h2>
        <p>{t('overviewP1')}</p>

        <h2>{t('contentHeading')}</h2>
        <p>{t('contentP1')}</p>
        <ul>
          <li>{t('contentItem1')}</li>
          <li>{t('contentItem2')}</li>
          <li>{t('contentItem3')}</li>
        </ul>
        <p>{t('contentP2')}</p>

        <h2>{t('transparencyHeading')}</h2>
        <p>{t('transparencyP1')}</p>
        <ul>
          <li>{t('transparencyItem1')}</li>
          <li>{t('transparencyItem2')}</li>
          <li>{t('transparencyItem3')}</li>
        </ul>

        <h2>{t('responsibilityHeading')}</h2>
        <p>{t('responsibilityP1')}</p>
        <p>
          {t('responsibilityEmailLabel')}{" "}
          <a href="mailto:info@opendesk-edu.org">info@opendesk-edu.org</a>
        </p>

        <h2>{t('contactHeading')}</h2>
        <p>{t('contactP1')}</p>
      </article>
    </div>
  );
}
