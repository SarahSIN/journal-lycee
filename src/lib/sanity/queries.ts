import { groq } from 'next-sanity'

// Requête pour récupérer tous les articles avec leurs détails, filtrant ceux sans slug ou image
export const getAllArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && defined(mainImage)] {
    _id,
    title,
    typeArticle,
    "imageUrl": mainImage.asset->url,
    category,
    "slug": slug.current,
    "editionTitle": edition->title
  } | order(_createdAt desc)
`

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
    audioFile,
    excerpt,
    "editionTitle": edition->title
  }
`