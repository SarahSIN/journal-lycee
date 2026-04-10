import { Metadata } from 'next'

// Interface pour les métadonnées personnalisées
export interface SiteMetadata {
  title: string
  description: string
  keywords: string[]
  author: string
  ogImage?: string
  canonicalUrl?: string
}

export class MetadataManager {
  // Métadonnées par défaut du site
  private defaultMetadata: SiteMetadata = {
    title: 'Journal du Lycée Ozenne',
    description: 'Le journal en ligne des élèves du Lycée Ozenne à Toulouse',
    keywords: [
      'lycée Ozenne', 
      'journal scolaire', 
      'toulouse', 
      'actualités lycée', 
      'élèves'
    ],
    author: 'Lycée Ozenne',
    ogImage: '/logo-ozennien.jpeg'
  }

  // Générer les métadonnées pour une page
  generatePageMetadata(
    overrides: Partial<SiteMetadata> = {}
  ): Metadata {
    const metadata = { ...this.defaultMetadata, ...overrides }

    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      authors: [{ name: metadata.author }],
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        images: metadata.ogImage ? [{ url: metadata.ogImage }] : [],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.title,
        description: metadata.description,
        images: metadata.ogImage ? [metadata.ogImage] : []
      },
      alternates: {
        canonical: metadata.canonicalUrl || '/'
      }
    }
  }

  // Générer les métadonnées pour un article
  generateArticleMetadata(
    article: {
      title: string
      description: string
      author?: string
      publishedAt?: string
      image?: string
    }
  ): Metadata {
    return this.generatePageMetadata({
      title: `${article.title} - Journal Ozenne`,
      description: article.description,
      author: article.author || this.defaultMetadata.author,
      ogImage: article.image || this.defaultMetadata.ogImage,
      keywords: [
        ...this.defaultMetadata.keywords,
        ...(article.title.split(' ').map(word => word.toLowerCase()))
      ]
    })
  }
}

// Singleton pour faciliter l'utilisation
export const metadataManager = new MetadataManager()