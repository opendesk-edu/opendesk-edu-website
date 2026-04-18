import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/content";
import { routing } from "@/i18n/routing";

export interface SearchEntry {
  title: string;
  slug: string;
  section: string;
  description?: string;
  categories?: string[];
  tags?: string[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") ?? routing.defaultLocale;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const posts = await getAllPosts(locale);

  const entries: SearchEntry[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    section: post.section,
    description: post.description,
    categories: post.categories,
    tags: post.tags,
  }));

  return NextResponse.json(entries);
}
