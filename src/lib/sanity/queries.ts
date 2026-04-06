import { groq } from 'next-sanity'
import { client } from './client'
import { SanityArticle } from '@/types/sanity-article'

// Requête pour récupérer tous les articles avec leurs détails, filtrant ceux sans slug ou image
export const getAllArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && defined(mainImage)] {
    _id,
    title,
    description,
    typeArticle,
    mainImage,
    category,
    "slug": slug.current,
    "editionTitle": edition->title
  } | order(_createdAt desc)
`

export async function getAllArticles(): Promise<SanityArticle[]> {
  return await client.fetch(getAllArticlesQuery)
}

// Requête pour récupérer un article spécifique par son slug
export const ARTICLE_QUERY = groq`
  *[_type == "article" && slug.current == $slug && defined(slug.current)][0] {
    _id,
    title,
    "slug": slug.current,
    typeArticle,
    "mainImage": {
      ...mainImage,
      "url": mainImage.asset->url
    },
    "audioUrl": audioFile.asset->url,
    audioFile,
    excerpt,
    "editionTitle": edition->title,
    embedCode,
    "gallery": gallery[]{
      "url": asset->url
    }
  }
`