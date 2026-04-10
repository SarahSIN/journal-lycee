import { client } from '@/lib/sanity/client'
import { createClient } from '@supabase/supabase-js'

export interface WriterPerformanceStats {
  authorId: string
  authorName: string
  totalArticles: number
  totalViews: number
  totalLikes: number
  totalHearts: number
  averageViewsPerArticle: number
  mostViewedArticle?: {
    id: string
    title: string
    views: number
  }
  recentArticles: Array<{
    id: string
    title: string
    publishedAt: string
    views: number
    likes: number
    hearts: number
  }>
}

export interface WriterActivityTrend {
  month: string
  articleCount: number
  totalViews: number
}

export class WriterStatsManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Obtenir les statistiques de performance pour un rédacteur
  async getWriterPerformanceStats(authorId: string): Promise<WriterPerformanceStats | null> {
    try {
      // Requête Sanity pour obtenir les statistiques de l'auteur
      const query = `*[_type == "author" && _id == "${authorId}"][0] {
        _id,
        name,
        "articles": *[_type == "article" && author._ref == "${authorId}"] {
          _id,
          title,
          views,
          likes,
          hearts,
          publishedAt
        }
      }`

      const authorData = await client.fetch(query)

      if (!authorData) {
        return null
      }

      // Calculer les statistiques
      const articles = authorData.articles || []
      const totalArticles = articles.length
      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
      const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0)
      const totalHearts = articles.reduce((sum, article) => sum + (article.hearts || 0), 0)

      // Trier les articles par vues pour trouver le plus consulté
      const mostViewedArticle = articles.length > 0 
        ? articles.reduce((max, article) => 
            (article.views || 0) > (max.views || 0) ? article : max
          )
        : undefined

      // Trier les articles récents
      const recentArticles = articles
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 5)
        .map(article => ({
          id: article._id,
          title: article.title,
          publishedAt: article.publishedAt,
          views: article.views || 0,
          likes: article.likes || 0,
          hearts: article.hearts || 0
        }))

      return {
        authorId: authorData._id,
        authorName: authorData.name,
        totalArticles,
        totalViews,
        totalLikes,
        totalHearts,
        averageViewsPerArticle: totalArticles > 0 ? totalViews / totalArticles : 0,
        mostViewedArticle: mostViewedArticle ? {
          id: mostViewedArticle._id,
          title: mostViewedArticle.title,
          views: mostViewedArticle.views || 0
        } : undefined,
        recentArticles
      }
    } catch (error) {
      console.error('Erreur de récupération des statistiques du rédacteur', error)
      return null
    }
  }

  // Obtenir la tendance d'activité des rédacteurs
  async getWriterActivityTrend(authorId: string, months: number = 6): Promise<WriterActivityTrend[]> {
    try {
      // Requête Sanity pour obtenir l'activité mensuelle
      const query = `*[_type == "article" && author._ref == "${authorId}"] | order(publishedAt desc) {
        publishedAt,
        views
      }`

      const articles = await client.fetch(query)

      // Grouper par mois
      const activityByMonth = articles.reduce((acc, article) => {
        const date = new Date(article.publishedAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!acc[monthKey]) {
          acc[monthKey] = { 
            month: monthKey, 
            articleCount: 0, 
            totalViews: 0 
          }
        }
        
        acc[monthKey].articleCount++
        acc[monthKey].totalViews += article.views || 0
        
        return acc
      }, {})

      // Convertir en tableau et trier
      return Object.values(activityByMonth)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-months)
    } catch (error) {
      console.error('Erreur de récupération de la tendance d\'activité', error)
      return []
    }
  }

  // Comparer les performances entre rédacteurs
  async compareWriterPerformances(limit: number = 10): Promise<Array<{
    authorId: string
    authorName: string
    totalArticles: number
    totalViews: number
    averageViewsPerArticle: number
  }>> {
    try {
      const query = `*[_type == "author"] {
        _id,
        name,
        "articles": *[_type == "article" && author._ref == ^._id] {
          views
        }
      }`

      const authors = await client.fetch(query)

      return authors
        .map(author => ({
          authorId: author._id,
          authorName: author.name,
          totalArticles: author.articles.length,
          totalViews: author.articles.reduce((sum, article) => sum + (article.views || 0), 0),
          averageViewsPerArticle: author.articles.length > 0 
            ? author.articles.reduce((sum, article) => sum + (article.views || 0), 0) / author.articles.length 
            : 0
        }))
        .sort((a, b) => b.averageViewsPerArticle - a.averageViewsPerArticle)
        .slice(0, limit)
    } catch (error) {
      console.error('Erreur de comparaison des performances des rédacteurs', error)
      return []
    }
  }
}

// Singleton pour faciliter l'utilisation
export const writerStatsManager = new WriterStatsManager()