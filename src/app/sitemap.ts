import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/config";
import { SECTION_INFO } from "@/lib/content";
import { routing } from "@/i18n/routing";

function getLocalizedPath(pathname: string, locale: string): string {
  const pathnameConfig = routing.pathnames[pathname as keyof typeof routing.pathnames];
  if (typeof pathnameConfig === 'string') {
    return `${SITE_URL}/${locale}${pathnameConfig}`;
  }
  if (typeof pathnameConfig === 'object' && pathnameConfig) {
    const localized = pathnameConfig[locale as keyof typeof pathnameConfig];
    return `${SITE_URL}/${locale}${localized ?? pathname}`;
  }
  return `${SITE_URL}/${locale}${pathname}`;
}

function buildAlternates(pathname: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const l of routing.locales) {
    alternates[l] = getLocalizedPath(pathname, l);
  }
  return alternates;
}

function buildPostAlternates(
  section: string,
  slug: string,
  existingLocales: Set<string>
): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const l of existingLocales) {
    alternates[l] = `${SITE_URL}/${l}/${section}/${slug}`;
  }
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  const slugLocales = new Map<string, Set<string>>();
  for (const locale of routing.locales) {
    const posts = await getAllPosts(locale);
    for (const post of posts) {
      const key = `${post.section}/${post.slug}`;
      if (!slugLocales.has(key)) {
        slugLocales.set(key, new Set());
      }
      slugLocales.get(key)!.add(locale);
    }
  }

  for (const locale of routing.locales) {
    entries.push(
      {
        url: `${SITE_URL}/${locale}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 1.0,
        alternates: { languages: buildAlternates('/') },
      },
      {
        url: getLocalizedPath('/about', locale),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildAlternates('/about') },
      },
      ...SECTION_INFO.map((s) => ({
        url: `${SITE_URL}/${locale}/${s.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: { languages: buildAlternates(`/${s.slug}`) },
      })),
      {
        url: getLocalizedPath('/imprint', locale),
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.3,
        alternates: { languages: buildAlternates('/imprint') },
      },
      {
        url: getLocalizedPath('/privacy', locale),
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.3,
        alternates: { languages: buildAlternates('/privacy') },
      }
    );

    const posts = await getAllPosts(locale);
    for (const post of posts) {
      const postAlternates = buildPostAlternates(
        post.section,
        post.slug,
        slugLocales.get(`${post.section}/${post.slug}`) ?? new Set([locale])
      );
      entries.push({
        url: `${SITE_URL}/${locale}/${post.section}/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: { languages: postAlternates },
      });
    }
  }

  return entries;
}
