import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { PostMeta, Post } from "./types";

const postsDirectory = path.join(process.cwd(), "content/posts");

function calculateReadingTime(content: string): number {
  // For mixed Korean/English: ~500 chars per minute for Korean, ~200 words per minute for English
  const koreanChars = (content.match(/[\uAC00-\uD7AF]/g) || []).length;
  const englishWords = content
    .replace(/[\uAC00-\uD7AF]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const koreanMinutes = koreanChars / 500;
  const englishMinutes = englishWords / 200;
  const totalMinutes = koreanMinutes + englishMinutes;

  return Math.max(1, Math.ceil(totalMinutes));
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        title: data.title || "Untitled",
        date: data.date || "1970-01-01",
        description: data.description || "",
        tags: data.tags || [],
        cover: data.cover || undefined,
        slug: data.slug || slug,
        readingTime: calculateReadingTime(content),
      } as PostMeta;
    });

  return allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const mdPath = path.join(postsDirectory, `${slug}.md`);
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const fullPath = fs.existsSync(mdPath)
    ? mdPath
    : fs.existsSync(mdxPath)
      ? mdxPath
      : null;

  if (!fullPath) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    title: data.title || "Untitled",
    date: data.date || "1970-01-01",
    description: data.description || "",
    tags: data.tags || [],
    cover: data.cover || undefined,
    slug: data.slug || slug,
    readingTime: calculateReadingTime(content),
    contentHtml,
  };
}

export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  limit: number = 6
): PostMeta[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  const scored = allPosts.map((post) => {
    const overlap = post.tags.filter((tag) => currentTags.includes(tag)).length;
    return { post, overlap };
  });

  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return scored.slice(0, limit).map((s) => s.post);
}

export function getAdjacentPosts(
  currentSlug: string
): { prev: PostMeta | null; next: PostMeta | null } {
  const allPosts = getAllPosts(); // sorted newest first
  const index = allPosts.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < allPosts.length - 1 ? allPosts[index + 1] : null,
    next: index > 0 ? allPosts[index - 1] : null,
  };
}
