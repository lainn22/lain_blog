import type { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostList } from "@/components/post-list";

export const metadata: Metadata = {
  title: "전체 글",
  description: "블로그의 모든 글을 확인하세요.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const allTags = getAllTags();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {"전체 글"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {"총 "}{posts.length}{"개의 글이 있습니다."}
        </p>
      </div>
      <PostList posts={posts} allTags={allTags} />
    </div>
  );
}
