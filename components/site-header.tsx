import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link
          href="/posts"
          className="text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {"lainWRLD"}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/posts"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {"전체 글"}
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {"소개"}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
