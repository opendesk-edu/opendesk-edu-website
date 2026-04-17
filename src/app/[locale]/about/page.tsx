import {Link} from '@/i18n/navigation';
import EmailLink from "@/components/EmailLink";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{locale: string}>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  return {
    title: "About | openDesk Edu",
  };
}

const SERVICES = [
  {
    title: "Learning Management",
    description:
      "Moodle and ILIAS — integrated with your campus SSO and data systems for seamless teaching workflows.",
  },
  {
    title: "Cloud Infrastructure",
    description:
      "Scalable container-based deployment on university cloud infrastructure with automated updates and monitoring.",
  },
  {
    title: "Digital Sovereignty",
    description:
      "Full data residency in your jurisdiction. GDPR-compliant by design with transparent data handling.",
  },
  {
    title: "SSO & Federation",
    description:
      "SAML-based single sign-on integration with existing university identity providers and research federations.",
  },
];

const PROJECTS = [
  { title: "Components", description: "The 15 integrated services", href: "/components" as const },
  { title: "Architecture", description: "System design and patterns", href: "/architecture" as const },
  { title: "Get Started", description: "Deployment guides", href: "/get-started" as const },
  { title: "Blog", description: "News and updates", href: "/blog" as const },
];

export default async function AboutPage({params}: PageProps) {
  const _locale = await params;
  void _locale;
  const t = await getTranslations('about');

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
          Interested in deploying openDesk Edu at your university?
        </p>
        <EmailLink className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-button text-white hover:opacity-90 transition-opacity">
          Contact us
        </EmailLink>
      </section>
    </main>
  );
}
