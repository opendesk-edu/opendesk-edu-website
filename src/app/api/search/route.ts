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
  image?: string;
}

// In-memory cache for search entries (valid for 5 minutes)
// Exported for testing purposes
 export const searchCache = new Map<string, { entries: SearchEntry[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") ?? routing.defaultLocale;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  // Check cache first
  const cached = searchCache.get(locale);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.entries);
  }

  // Cache miss or expired - fetch fresh data
  const posts = await getAllPosts(locale);

  const entries: SearchEntry[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    section: post.section,
    description: post.description,
    categories: post.categories,
    tags: post.tags,
    image: post.image,
  }));

  // Update cache
  searchCache.set(locale, { entries, timestamp: now });

  return NextResponse.json(entries);
}
