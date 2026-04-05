// Types pour les articles du journal de lycée

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface ArticlePreview {
  id: string;
  title: string;
  author: string;
  publishedAt: Date;
  category: string;
  thumbnailUrl?: string;
}