import { getAllPosts } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { escapeXml } from "@/lib/xml";
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
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description ?? "")}</description>
      ${post.htmlContent ? `<content:encoded><![CDATA[${post.htmlContent}]]></content:encoded>` : ""}
      <category>${escapeXml(post.section)}</category>
      ${post.image ? `<media:content url="${escapeXml(`${SITE_URL}${post.image}`)}" medium="image" width="1200" height="630" />` : ""}
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(`${SITE_URL}/${locale}`)}</link>
    <atom:link href="${escapeXml(`${SITE_URL}/${locale}/rss`)}" rel="self" type="application/rss+xml"/>
    <language>${escapeXml(locale)}</language>
    <description>Latest posts from ${escapeXml(SITE_NAME)}</description>
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