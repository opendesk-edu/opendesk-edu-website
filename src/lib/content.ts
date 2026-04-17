import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { SECTIONS } from "@/lib/config";


export interface PostMeta {
  title: string;
  date: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  slug?: string;
  image?: string;
  draft?: boolean;
}

export interface Post {
  title: string;
  date: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  image?: string;
  htmlContent: string;
  slug: string;
  section: string;
}

function buildPost(data: PostMeta, htmlContent: string, slug: string, section: string): Post {
  return {
    title: data.title,
    date: data.date,
    description: data.description,
    categories: data.categories,
    tags: data.tags,
    image: data.image,
    htmlContent,
    slug,
    section,
  };
}

function isValidPostMeta(data: unknown): data is PostMeta {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.title !== "string" || d.title.length === 0) return false;
  if (d.date instanceof Date) return true;
  if (typeof d.date === "string" && !isNaN(Date.parse(d.date))) return true;
  return false;
}

async function readFile(filePath: string): Promise<{ data: PostMeta; content: string }> {
  const raw = await fs.promises.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  // gray-matter may auto-parse date into a Date object — normalize to string before validation
  const rawMeta = data as Record<string, unknown>;
  if (rawMeta.date instanceof Date) {
    rawMeta.date = rawMeta.date.toISOString().slice(0, 10);
  }

  if (!isValidPostMeta(data)) {
    throw new Error(`Invalid frontmatter in ${filePath}: missing required "title" or "date" fields`);
  }
  return { data, content };
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}

function getSlugFromFilename(filename: string, frontmatter: PostMeta): string {
  if (frontmatter.slug) return frontmatter.slug;
  return filename.replace(/\.md$/, "");
}

function isValidContentFile(filename: string): boolean {
  if (filename === "_index.md") return false;
  if (filename.endsWith(".backup")) return false;
  if (filename.endsWith("_")) return false;
  if (!filename.endsWith(".md")) return false;
  return true;
}

function getContentDirectory(locale: string): string {
  return path.join(process.cwd(), "content", locale);
}

export async function getPostBySlug(
  section: string,
  slug: string,
  locale: string = 'en'
): Promise<Post | null> {
  const sectionDir = path.join(getContentDirectory(locale), section);
  if (!fs.existsSync(sectionDir)) return null;

  // Fast path: try direct filename match first (covers the common case)
  const candidatePath = path.join(sectionDir, `${slug}.md`);
  if (fs.existsSync(candidatePath)) {
    try {
      const { data, content } = await readFile(candidatePath);
      if (getSlugFromFilename(`${slug}.md`, data) === slug) {
        const htmlContent = await markdownToHtml(content);
        return buildPost(data, htmlContent, slug, section);
      }
    } catch {
      // Fall through to full scan
    }
  }

  // Fallback: scan all files (handles custom slug overrides in frontmatter)
  const files = fs.readdirSync(sectionDir);
  for (const file of files) {
    if (!isValidContentFile(file)) continue;
    const { data, content } = await readFile(path.join(sectionDir, file));
    const fileSlug = getSlugFromFilename(file, data);
    if (fileSlug === slug) {
      const htmlContent = await markdownToHtml(content);
      return buildPost(data, htmlContent, fileSlug, section);
    }
  }
  return null;
}

export async function getPostsBySection(section: string, locale: string = 'en'): Promise<Post[]> {
  const sectionDir = path.join(getContentDirectory(locale), section);
  if (!fs.existsSync(sectionDir)) return [];

  const files = fs.readdirSync(sectionDir).filter(isValidContentFile);

  const posts = await Promise.all(
    files.map(async (file): Promise<Post | null> => {
      try {
        const { data, content } = await readFile(path.join(sectionDir, file));
        if (data.draft === true) return null;
        const slug = getSlugFromFilename(file, data);
        const htmlContent = await markdownToHtml(content);
        return buildPost(data, htmlContent, slug, section);
      } catch (err) {
        console.error(`Failed to process ${path.join(sectionDir, file)}:`, err);
        return null;
      }
    })
  );

  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllPosts(locale: string = 'en'): Promise<Post[]> {
  const allPosts = await Promise.all(
    SECTIONS.map((s) => getPostsBySection(s, locale))
  );
  return allPosts.flat().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export interface SectionInfo {
  name: string;
  slug: string;
  title: string;
  description?: string;
}

const SECTION_METADATA: Record<string, Omit<SectionInfo, 'slug'>> = {
  components: { name: "Components", title: "Components", description: "The 15 integrated openDesk CE services — from learning management (Moodle, ILIAS) to collaboration (BigBlueButton, Etherpad) and productivity (Nextcloud, Grommunio)." },
  architecture: { name: "Architecture", title: "Architecture", description: "System design, SAML federation, deployment patterns, and infrastructure architecture for educational digital transformation." },
  'get-started': { name: "Get Started", title: "Get Started", description: "Step-by-step guides for deploying openDesk Edu, onboarding universities, and integrating with existing campus infrastructure." },
  blog: { name: "Blog", title: "Blog", description: "News, announcements, community stories, and insights on open-source digital infrastructure in higher education." },
};

export const SECTION_INFO: SectionInfo[] = SECTIONS.map((slug) => ({
  slug,
  ...SECTION_METADATA[slug],
}));

const SECTION_SLUGS = new Set<string>(SECTIONS);

export function getSectionBySlug(slug: string): SectionInfo | undefined {
  return SECTION_INFO.find((s) => s.slug === slug);
}

export function isValidSection(slug: string): boolean {
  return SECTION_SLUGS.has(slug);
}

export async function getStaticPathsForSection(section: string, locale: string = 'en'): Promise<string[]> {
  const posts = await getPostsBySection(section, locale);
  return posts.map((p) => p.slug);
}
