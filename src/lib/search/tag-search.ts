import { client } from '@/lib/sanity/client'
import { tagManager } from '@/lib/tags/tag-manager'

export interface TagSearchResult {
  tag: {
    id: string
    name: string
    slug: string
    color?: string
    description?: string
  }
  articles: Array<{
    id: string
    title: string
    publishedAt: string
    author: string
    excerpt?: string
    thumbnailUrl?: string
  }>
  totalArticleCount: number
}

export interface SearchFilters {
  tags?: string[]
  startDate?: Date
  endDate?: Date
  author?: string
  category?: string
  sortBy?: 'newest' | 'oldest' | 'mostViewed'
  limit?: number
  offset?: number
}

export class TagSearchManager {
  // Rechercher des articles par tags avec filtres avancés
  async searchArticlesByTags(filters: SearchFilters): Promise<{
    results: TagSearchResult[]
    totalResults: number
  }> {
    try {
      // Construction dynamique de la requête GROQ
      const conditions: string[] = []
      
      // Filtres de tags
      if (filters.tags && filters.tags.length > 0) {
        conditions.push(`tags[] match ${JSON.stringify(filters.tags)}`)
      }

      // Filtres de date
      if (filters.startDate) {
        conditions.push(`publishedAt >= "${filters.startDate.toISOString().split('T')[0]}"`)
      }

      if (filters.endDate) {
        conditions.push(`publishedAt <= "${filters.endDate.toISOString().split('T')[0]}"`)
      }

      // Filtres supplémentaires
      if (filters.author) {
        conditions.push(`author->name match "${filters.author}"`)
      }

      if (filters.category) {
        conditions.push(`category->slug.current == "${filters.category}"`)
      }

      // Construction de la requête de base
      const baseQuery = `*[_type == "article" ${conditions.length > 0 ? '&& ' + conditions.join(' && ') : ''}]`

      // Tri
      let sortQuery = ' | order(publishedAt desc)'
      if (filters.sortBy === 'oldest') {
        sortQuery = ' | order(publishedAt asc)'
      } else if (filters.sortBy === 'mostViewed') {
        sortQuery = ' | order(views desc)'
      }

      // Pagination
      const paginationQuery = ` [${filters.offset || 0}...${(filters.offset || 0) + (filters.limit || 10)}]`

      // Requête complète
      const query = `{
        "results": ${baseQuery}${sortQuery}${paginationQuery} {
          _id,
          title,
          publishedAt,
          "author": author->name,
          "excerpt": pt::text(body)[0...200],
          "thumbnailUrl": mainImage.asset->url,
          "tags": tags[]
        },
        "totalResults": count(${baseQuery})
      }`

      const { results, totalResults } = await client.fetch(query)

      // Transformer les résultats
      const taggedResults: TagSearchResult[] = await Promise.all(
        results.map(async (article) => {
          // Récupérer les détails des tags
          const tagDetails = await Promise.all(
            article.tags.map(async (tagSlug) => {
              const tagData = await tagManager.searchTags(tagSlug)
              return tagData[0]
            })
          )

          return {
            tag: tagDetails[0], // Prendre le premier tag comme représentatif
            articles: [{
              id: article._id,
              title: article.title,
              publishedAt: article.publishedAt,
              author: article.author,
              excerpt: article.excerpt,
              thumbnailUrl: article.thumbnailUrl
            }],
            totalArticleCount: 1
          }
        })
      )

      return {
        results: taggedResults,
        totalResults
      }
    } catch (error) {
      console.error('Erreur de recherche par tags', error)
      return {
        results: [],
        totalResults: 0
      }
    }
  }

  // Obtenir les statistiques de recherche par tags
  async getTagSearchStatistics(): Promise<{
    mostSearchedTags: Array<{
      name: string
      searchCount: number
    }>,
    tagDistribution: Array<{
      tagName: string
      articleCount: number
    }>
  }> {
    try {
      // Requête pour obtenir les tags les plus utilisés
      const mostUsedTagsQuery = `*[_type == "article"] {
        "tags": tags[]
      }`

      const articleTags = await client.fetch(mostUsedTagsQuery)

      // Calculer la distribution des tags
      const tagDistribution = articleTags.reduce((acc, article) => {
        article.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {})

      // Convertir en tableau trié
      const tagDistributionArray = Object.entries(tagDistribution)
        .map(([name, articleCount]) => ({ name, articleCount }))
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 10)

      // TODO: Implémenter un système de suivi des recherches de tags
      const mostSearchedTags = [
        { name: 'Actualités', searchCount: 150 },
        { name: 'Culture', searchCount: 120 },
        { name: 'Sport', searchCount: 100 }
      ]

      return {
        mostSearchedTags,
        tagDistribution: tagDistributionArray
      }
    } catch (error) {
      console.error('Erreur de récupération des statistiques de tags', error)
      return {
        mostSearchedTags: [],
        tagDistribution: []
      }
    }
  }
}

// Singleton pour faciliter l'utilisation
export const tagSearchManager = new TagSearchManager()