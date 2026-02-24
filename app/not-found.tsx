import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-foreground">{"404"}</h1>
      <p className="mt-4 text-muted-foreground">
        {"찾으시는 페이지가 존재하지 않습니다."}
      </p>
      <Link
        href="/posts"
        className="mt-6 text-sm font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        {"전체 글 보기"}
      </Link>
    </div>
  );
}
