// Root not-found boundary. When `dynamicParams=false` rejects an unknown
// section/slug/tag it renders here (NOT inside the [locale] tree).
//
// This page must be fully STATIC: if it reads a dynamic API (cookies(),
// headers(), next-intl getTranslations outside a [locale] context, …) Next
// either fails to prerender it or streams the 404 as a 200 soft-404. The root
// boundary has no [locale] segment, so we cannot know the request locale here
// and render with the default (English) copy. Links are absolute /en/… hrefs.
import Link from "next/link";
import { getPostsBySection } from "@/lib/content";
import pagesEn from "../../messages/en.json";

type Href = React.ComponentProps<typeof Link>["href"];

const t = pagesEn.notFound as Record<string, string>;

export default async function NotFound() {
  const latestPosts = await Promise.all(
    (["blog", "architecture"] as const).map((s) => getPostsBySection(s, "en"))
  ).then((groups) =>
    groups
      .flat()
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 4)
  );

  return (
    <html lang="en">
      <head>
        <title>{`${t.title} | openDesk Edu`}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        {/* Root 404 is self-contained and must not rely on the app CSS build. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/static/404.css" />
      </head>
      <body>
        <main className="nf-wrap">
          <p className="nf-code">{t.title}</p>
          <h1 className="nf-heading">{t.heading}</h1>
          <p className="nf-message">{t.message}</p>

          <nav className="nf-actions">
            <Link href="/" className="nf-btn">
              {t.homepage}
            </Link>
            <Link href="/en/blog" className="nf-link">
              Blog
            </Link>
            <Link href="/en/architecture" className="nf-link">
              Architecture
            </Link>
          </nav>

          {latestPosts.length > 0 && (
            <section className="nf-articles">
              <h2>{t.latestArticles}</h2>
              <div className="nf-grid">
                {latestPosts.map((post) => (
                  <Link
                    key={`${post.section}/${post.slug}`}
                    href={`/en/${post.section}/${post.slug}` as unknown as Href}
                    className="nf-card"
                  >
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </body>
    </html>
  );
}
