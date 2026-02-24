export interface PostMeta {
  title: string;
  date: string;
  description: string;
  tags: string[];
  cover?: string;
  slug: string;
  readingTime: number;
}

export interface Post extends PostMeta {
  contentHtml: string;
}
