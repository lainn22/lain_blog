"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Search, ArrowUpDown } from "lucide-react";
import type { PostMeta } from "@/lib/types";

const POSTS_PER_PAGE = 6;

export function PostList({
  posts,
  allTags,
}: {
  posts: PostMeta[];
  allTags: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [posts, search, selectedTags, sortOrder]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="글 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          aria-label="글 검색"
        />
      </div>

      {/* Tags + Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {"태그"}
          </span>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)} type="button">
              <Badge
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs transition-colors"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setSortOrder((prev) =>
              prev === "newest" ? "oldest" : "newest"
            )
          }
          className="shrink-0 gap-1.5 text-muted-foreground"
        >
          <ArrowUpDown className="size-3.5" />
          {sortOrder === "newest" ? "최신순" : "오래된순"}
        </Button>
      </div>

      {/* Posts Grid */}
      {paginatedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">
            {"조건에 맞는 글이 없어요."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2"
          aria-label="페이지 네비게이션"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {"이전"}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="min-w-9"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            {"다음"}
          </Button>
        </nav>
      )}
    </div>
  );
}
