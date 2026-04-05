import { groq } from 'next-sanity'

// Requête pour récupérer tous les articles avec leurs détails
export const getAllArticlesQuery = groq`
  *[_type == "article"] {
    _id,
    title,
    "imageUrl": mainImage.asset->url,
    category,
    "editionTitle": edition->title
  } | order(_createdAt desc)
`