// Type pour les articles récupérés depuis Sanity
export type SanityArticle = {
  _id: string;
  title: string;
  slug?: { current: string };
  typeArticle: 'visuel' | 'podcast';
  mainImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    url?: string;
  };
  audioFile?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    url?: string;
  };
  imageUrl?: string;
  category?: string;
  editionTitle?: string;
  author?: string;
};