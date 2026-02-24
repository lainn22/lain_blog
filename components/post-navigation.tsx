import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostMeta } from "@/lib/types";

export function PostNavigation({
  prev,
  next,
}: {
  prev: PostMeta | null;
  next: PostMeta | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      className="mt-10 grid gap-4 sm:grid-cols-2"
      aria-label="글 네비게이션"
    >
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <ChevronLeft className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="text-xs text-muted-foreground">{"이전 글"}</span>
            <span className="truncate text-sm font-medium text-foreground">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group flex items-center justify-end gap-3 rounded-xl border border-border p-4 text-right transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="text-xs text-muted-foreground">{"다음 글"}</span>
            <span className="truncate text-sm font-medium text-foreground">
              {next.title}
            </span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
