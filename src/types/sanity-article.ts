// Type pour les articles récupérés depuis Sanity
export type SanityArticle = {
  _id: string;
  title: string;
  imageUrl?: string;
  category?: string;
  editionTitle?: string;
};