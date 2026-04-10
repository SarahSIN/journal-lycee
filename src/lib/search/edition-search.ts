import { client } from '@/lib/sanity/client'

export interface EditionSearchResult {
  id: string
  title: string
  publishDate: string
  coverImageUrl?: string
  articleCount: number
  tags: string[]
}

export class EditionSearchManager {
  // Rechercher des éditions par différents critères
  async searchEditions(options: {
    query?: string
    startDate?: Date
    endDate?: Date
    tags?: string[]
    limit?: number
    offset?: number
  }): Promise<EditionSearchResult[]> {
    // Construction dynamique de la requête GROQ
    const conditions: string[] = ['_type == "edition"']

    if (options.query) {
      conditions.push(`title match "${options.query}"`)
    }

    if (options.startDate) {
      conditions.push(`publishDate >= "${options.startDate.toISOString().split('T')[0]}"`)
    }

    if (options.endDate) {
      conditions.push(`publishDate <= "${options.endDate.toISOString().split('T')[0]}"`)
    }

    if (options.tags && options.tags.length > 0) {
      conditions.push(`count(articles[].tags[in: ${JSON.stringify(options.tags)}]) > 0`)
    }

    const query = `*[${conditions.join(' && ')}] | order(publishDate desc) [${options.offset || 0}...${(options.offset || 0) + (options.limit || 10)}] {
      _id,
      title,
      publishDate,
      "coverImageUrl": coverImage.asset->url,
      "articleCount": count(articles),
      "tags": articles[].tags[]
    }`

    try {
      const results = await client.fetch(query)

      return results.map(edition => ({
        id: edition._id,
        title: edition.title,
        publishDate: edition.publishDate,
        coverImageUrl: edition.coverImageUrl,
        articleCount: edition.articleCount,
        tags: [...new Set(edition.tags)] // Éliminer les doublons
      }))
    } catch (error) {
      console.error('Erreur de recherche des éditions', error)
      return []
    }
  }

  // Récupérer les statistiques des éditions
  async getEditionStatistics(): Promise<{
    totalEditions: number
    editionsByYear: Record<string, number>
    mostPublishedYear: string
  }> {
    const query = `{
      "totalEditions": count(*[_type == "edition"]),
      "editionsByYear": *[_type == "edition"] | order(publishDate desc) {
        year: publishDate[0..3]
      } | count(year),
      "mostPublishedYear": *[_type == "edition"] | order(publishDate desc) {
        year: publishDate[0..3]
      } | count(year) | [0]
    }`

    try {
      const stats = await client.fetch(query)
      return {
        totalEditions: stats.totalEditions,
        editionsByYear: stats.editionsByYear,
        mostPublishedYear: stats.mostPublishedYear
      }
    } catch (error) {
      console.error('Erreur de récupération des statistiques', error)
      return {
        totalEditions: 0,
        editionsByYear: {},
        mostPublishedYear: ''
      }
    }
  }

  // Récupérer une édition spécifique avec tous ses articles
  async getEditionDetails(editionId: string): Promise<{
    id: string
    title: string
    publishDate: string
    coverImageUrl?: string
    articles: Array<{
      id: string
      title: string
      author: string
      tags: string[]
    }>
  } | null> {
    const query = `*[_type == "edition" && _id == "${editionId}"][0] {
      _id,
      title,
      publishDate,
      "coverImageUrl": coverImage.asset->url,
      "articles": articles[]->{
        _id,
        title,
        "author": author->name,
        tags
      }
    }`

    try {
      const edition = await client.fetch(query)
      
      if (!edition) return null

      return {
        id: edition._id,
        title: edition.title,
        publishDate: edition.publishDate,
        coverImageUrl: edition.coverImageUrl,
        articles: edition.articles.map(article => ({
          id: article._id,
          title: article.title,
          author: article.author,
          tags: article.tags
        }))
      }
    } catch (error) {
      console.error('Erreur de récupération des détails de l\'édition', error)
      return null
    }
  }
}

// Singleton pour faciliter l'utilisation
export const editionSearchManager = new EditionSearchManager()