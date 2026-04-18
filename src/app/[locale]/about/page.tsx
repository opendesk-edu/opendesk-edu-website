import {Link} from '@/i18n/navigation';
import EmailLink from "@/components/EmailLink";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  return {
    title: `${t('title')} | openDesk Edu`,
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  const tHeader = await getTranslations('header');

  const SERVICES = [
    {
      title: t('serviceLearning.title'),
      description: t('serviceLearning.description'),
    },
    {
      title: t('serviceCloud.title'),
      description: t('serviceCloud.description'),
    },
    {
      title: t('serviceSovereignty.title'),
      description: t('serviceSovereignty.description'),
    },
    {
      title: t('serviceSso.title'),
      description: t('serviceSso.description'),
    },
  ];

  const PROJECTS = [
    { title: tHeader('components'), description: t('projectComponents'), href: "/components" as const },
    { title: tHeader('architecture'), description: t('projectArchitecture'), href: "/architecture" as const },
    { title: tHeader('getStarted'), description: t('projectGetStarted'), href: "/get-started" as const },
    { title: tHeader('blog'), description: t('projectBlog'), href: "/blog" as const },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
        <p className="text-lg text-foreground-secondary max-w-2xl">
          {t('description')}
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">{t('services')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="rounded-lg border border-border bg-background p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-foreground-secondary">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">{t('projects')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="rounded-lg border border-border bg-background p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-foreground-secondary">{project.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background-secondary p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">{t('contact')}</h2>
        <p className="text-foreground-secondary mb-4">
          {t('contactDescription')}
        </p>
        <EmailLink className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-button text-white hover:opacity-90 transition-opacity">
          {t('contactCta')}
        </EmailLink>
      </section>
    </main>
  );
}
