import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/types";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
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
          <h2 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/80 text-balance">
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span aria-hidden="true">{"·"}</span>
            <span>{post.readingTime}{"분 소요"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
