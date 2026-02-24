import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/types";

export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        {"연관 포스팅"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/80 text-balance">
                {post.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {post.description}
              </p>
              <time
                dateTime={post.date}
                className="mt-auto text-xs text-muted-foreground"
              >
                {new Date(post.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
