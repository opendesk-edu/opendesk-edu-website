import { getAllPosts } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  const posts = await getAllPosts(locale);

  const recentPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ).slice(0, 20);

  const feedItems = recentPosts.map((post) => {
    const url = `${SITE_URL}/${locale}/${post.section}/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();

    return `
    <item>
      <title>${post.title}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${post.description || ""}</description>
      ${post.htmlContent ? `<content:encoded><![CDATA[${post.htmlContent}]]></content:encoded>` : ""}
      <category>${post.section}</category>
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/${locale}</link>
    <atom:link href="${SITE_URL}/${locale}/rss" rel="self" type="application/rss+xml"/>
    <language>${locale}</language>
    <description>Latest posts from ${SITE_NAME}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}