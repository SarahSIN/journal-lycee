import { PortableTextBlock } from '@portabletext/types';

// 1. IMAGE TYPE
export interface SanityImageAsset {
  _ref: string;
  _type: 'reference';
  url?: string;
}

// 2. SLUG TYPE
export interface SanitySlug {
  current: string;
  _type: 'slug';
}

// 3. ARTICLE TYPE
export interface SanityArticle {
  _id: string;
  _type: 'article';
  title: string;
  slug: SanitySlug;
  mainImage?: {
    asset: SanityImageAsset;
    alt?: string;
  };
  description?: string;
  excerpt?: string;
  body: PortableTextBlock[];
  publishedAt?: string;
  category?: string;
  author?: {
    name: string;
    image?: {
      asset: SanityImageAsset;
    };
  };
}