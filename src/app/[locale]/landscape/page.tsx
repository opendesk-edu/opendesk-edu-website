// app/[locale]/landscape/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { motion } from 'framer-motion';
import LandscapeVisualization from '@/components/Landscape/LandscapeVisualization';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Landscape' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://opendesk-edu.org/${locale}/landscape`,
      siteName: 'openDesk Edu',
      images: [
        {
          url: '/api/og/landscape',
          width: 1200,
          height: 630,
          alt: 'openDesk Edu Service Landscape',
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/api/og/landscape'],
    },
    alternates: {
      canonical: `https://opendesk-edu.org/${locale}/landscape`,
      languages: {
        en: '/en/landscape',
        de: '/de/landscape',
        fr: '/fr/landscape',
        zh: '/zh/landscape',
      },
    },
  };
}

export default function LandscapePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/10" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 filter blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full translate-x-1/2 -translate-y-1/4 filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-x-1/2 translate-y-1/2 filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full translate-x-1/2 translate-y-1/2 filter blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-block px-4 py-1 mb-6 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">
              Service Overview
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Service Landscape
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore the complete openDesk Edu ecosystem — a unified platform of 
            <span className="text-purple-400 font-semibold">{'>'} 35 integrated services</span> 
            for education, collaboration, and digital sovereignty.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
            >
              <span>🚀 Explore Services</span>
              <span className="text-sm opacity-70">interactive map</span>
            </a>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-purple-600/30 text-purple-400 rounded-xl font-semibold text-lg hover:bg-purple-600/10 transition-all"
            >
              <span>📖 Documentation</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <div className="w-8 h-12 border-2 border-purple-500/40 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-purple-500 rounded-full mt-2"
            />
          </div>
          <span className="mt-4 text-sm text-muted-foreground">Scroll to explore</span>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-background/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-7 gap-12 items-center">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                What is the Service Landscape?
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                The openDesk Edu Service Landscape is an interactive, visual map that showcases 
                every service in our ecosystem. Organized by functional domains, it provides a 
                comprehensive overview of how all components fit together.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Whether you&apos;re evaluating the platform for your institution, onboarding a new 
                team member, or planning integrations, the landscape gives you a clear picture 
                of our complete digital infrastructure.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-background-secondary rounded-lg p-6 border border-border/30">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Decision Makers</h3>
                  <p className="text-sm text-muted-foreground">
                    Assess platform breadth, identify aligned services, understand coverage
                  </p>
                </div>
                <div className="bg-background-secondary rounded-lg p-6 border border-border/30">
                  <div className="text-3xl mb-2">⚙️</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Operators</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick-reference architecture, integration planning, team onboarding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Five Pillars of Digital Infrastructure
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Each domain represents a critical function of modern digital education and research
          </p>
          
          <div className="grid md:grid-cols-5 gap-6">
            {/* Core Platform */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-500/20 group hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Core Platform</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Foundation services for authentication, file storage, email, and groupware
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Keycloak SSO
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>OpenCloud
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Stalwart Mail
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>SOGo Groupware
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <span className="text-sm text-purple-400 font-medium">9 services</span>
              </div>
            </div>

            {/* Education & Research */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 group hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center text-2xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Education & Research</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Purpose-built tools for teaching, learning, and computational research
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Moodle LMS
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>ILIAS LMS
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>JupyterHub
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>XWiki
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <span className="text-sm text-pink-400 font-medium">5 services</span>
              </div>
            </div>

            {/* Collaboration */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl p-6 border border-indigo-500/20 group hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Collaboration</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Real-time collaboration, communication, and productivity tools
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Collabora Online
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Jitsi Meet
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Matrix/Element
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Etherpad
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-indigo-500/20">
                <span className="text-sm text-indigo-400 font-medium">8 services</span>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-gradient-to-br from-slate-500/10 to-zinc-500/10 rounded-2xl p-6 border border-slate-500/20 group hover:border-slate-500/40 transition-all">
              <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center text-2xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Infrastructure</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Container orchestration, storage, networking, and observability
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>K3s Kubernetes
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>ArgoCD
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Prometheus
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Ceph CSI
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-500/20">
                <span className="text-sm text-slate-400 font-medium">8 services</span>
              </div>
            </div>

            {/* Security */}
            <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-2xl p-6 border border-rose-500/20 group hover:border-rose-500/40 transition-all">
              <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center text-2xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Security</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Protection, compliance, and governance for digital sovereignty
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>ClamAV
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>cert-manager
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Kubescape
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Pentest Reports
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-rose-500/20">
                <span className="text-sm text-rose-400 font-medium">4 services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Landscape */}
      <section id="explore" className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Interactive Service Map
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click on any service card to view details, filter by category, or search for specific services
            </p>
          </div>
          
          <LandscapeVisualization />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Why Use the Landscape?
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            More than just a visual map &mdash; it&apos;s a powerful tool for understanding and working with the platform
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background-secondary rounded-2xl p-8 border border-border/30 hover:border-purple-500/30 transition-all group">
              <div className="w-14 h-14 bg-purple-600/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-600 transition-colors">
                <span className="text-purple-600 group-hover:text-white">👁️</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Complete Visibility</h3>
              <p className="text-muted-foreground">
                See every service, its status, and how it integrates with the rest of the platform. 
                No more guessing about what&apos;s available or what&apos;s coming soon.
              </p>
            </div>
            
            <div className="bg-background-secondary rounded-2xl p-8 border border-border/30 hover:border-purple-500/30 transition-all group">
              <div className="w-14 h-14 bg-purple-600/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-600 transition-colors">
                <span className="text-purple-600 group-hover:text-white">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Informed Decisions</h3>
              <p className="text-muted-foreground">
                Evaluate the platform&apos;s capabilities at a glance. Understand which services fit your 
                institution&apos;s needs and plan your deployment strategy accordingly.
              </p>
            </div>
            
            <div className="bg-background-secondary rounded-2xl p-8 border border-border/30 hover:border-purple-500/30 transition-all group">
              <div className="w-14 h-14 bg-purple-600/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-600 transition-colors">
                <span className="text-purple-600 group-hover:text-white">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Efficient Operations</h3>
              <p className="text-muted-foreground">
                Onboard team members faster, plan integrations more effectively, and communicate the 
                platform&apos;s scope to stakeholders with a shared visual language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-purple-500/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            By The Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-background-secondary rounded-2xl p-6 border border-border/30 text-center">
              <div className="text-5xl font-bold text-purple-400 mb-2">38</div>
              <div className="text-lg font-semibold text-foreground">Total Services</div>
              <div className="text-sm text-muted-foreground mt-2">
                Across all domains and categories
              </div>
            </div>
            <div className="bg-background-secondary rounded-2xl p-6 border border-border/30 text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">28</div>
              <div className="text-lg font-semibold text-foreground">Production Ready</div>
              <div className="text-sm text-muted-foreground mt-2">
                Services stable and production-tested
              </div>
            </div>
            <div className="bg-background-secondary rounded-2xl p-6 border border-border/30 text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">10</div>
              <div className="text-lg font-semibold text-foreground">Beta Services</div>
              <div className="text-sm text-muted-foreground mt-2">
                Actively being stabilized
              </div>
            </div>
            <div className="bg-background-secondary rounded-2xl p-6 border border-border/30 text-center">
              <div className="text-5xl font-bold text-purple-400 mb-2">5+</div>
              <div className="text-lg font-semibold text-foreground">Categories</div>
              <div className="text-sm text-muted-foreground mt-2">
                Organized by function and use case
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl p-12 border border-purple-600/20 text-center">
            <div className="inline-block px-4 py-1 mb-6 bg-purple-600/20 border border-purple-600/30 rounded-full">
              <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">
                Next Steps
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Digital Infrastructure?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore the complete openDesk Edu ecosystem. All services are open-source, 
              fully integrated, and ready for production deployment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <span>📚 Get Started</span>
              </Link>
              <Link
                href="/docs/deployment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-purple-600/30 text-purple-400 rounded-xl font-semibold hover:bg-purple-600/10 transition-all"
              >
                <span>⚙️ Deploy Now</span>
              </Link>
              <a
                href="https://github.com/tobias-weiss-ai-xr/opendesk-edu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-purple-600/30 text-purple-400 rounded-xl font-semibold hover:bg-purple-600/10 transition-all"
              >
                <span>⭐ View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
