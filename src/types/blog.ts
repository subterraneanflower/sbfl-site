export type Author = {
  name: string;
  avatarUrl: string;
  biography?: string;
  twitter?: string;
  gitHub?: string;
  email?: string;
};

export type BlogData = {
  recentPosts: Pick<ArticleData, 'title' | 'slug' | 'pagePath' | 'publishedAt'>[];
  allCategories: string[];
  allTags: string[];
};

export type ArticleData = {
  title: string;
  slug: string;
  pagePath: string;
  category: string;
  tags: string[];
  author: Author;
  content: string;
  publishedAt: string;
};

export type ArticleSummaryData = Omit<ArticleData, 'content'> & {
  excerpt: string;
};
