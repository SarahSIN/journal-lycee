import { client } from '@/lib/sanity/client'
import { createClient } from '@supabase/supabase-js'
import { writerStatsManager } from '@/lib/analytics/writer-stats'
import { viewCounter } from '@/lib/analytics/view-counter'
import { reactionManager } from '@/lib/interactions/reaction-manager'
import { commentManager } from '@/lib/interactions/comment-manager'

export interface WriterDashboardInsights {
  authorId: string
  authorName: string
  totalArticles: number
  totalViews: number
  totalLikes: number
  totalHearts: number
  averageViewsPerArticle: number
  mostPopularArticle?: {
    id: string
    title: string
    views: number
    likes: number
    hearts: number
  }
  recentArticles: Array<{
    id: string
    title: string
    publishedAt: string
    views: number
    likes: number
    hearts: number
    comments: number
  }>
  monthlyActivityTrend: Array<{
    month: string
    articleCount: number
    totalViews: number
  }>
  topCategories: Array<{
    name: string
    articleCount: number
  }>
}

export class WriterDashboardManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Obtenir les insights complets pour un rédacteur
  async getWriterDashboardInsights(
    authorId: string
  ): Promise<WriterDashboardInsights | null> {
    try {
      // Récupérer les statistiques de base
      const performanceStats = await writerStatsManager.getWriterPerformanceStats(authorId)
      
      if (!performanceStats) {
        return null
      }

      // Récupérer la tendance d'activité mensuelle
      const monthlyTrend = await writerStatsManager.getWriterActivityTrend(authorId)

      // Récupérer les articles récents avec des détails supplémentaires
      const recentArticlesQuery = `*[_type == "article" && author._ref == "${authorId}"] | order(publishedAt desc)[0...5] {
        _id,
        title,
        publishedAt,
        "views": views,
        "likes": likes,
        "hearts": hearts,
        "comments": count(*[_type == "comment" && article._ref == ^._id])
      }`

      const recentArticles = await client.fetch(recentArticlesQuery)

      // Récupérer les catégories les plus utilisées
      const topCategoriesQuery = `*[_type == "article" && author._ref == "${authorId}"] {
        "category": category->title
      }`

      const articleCategories = await client.fetch(topCategoriesQuery)
      const categoryCount = articleCategories.reduce((acc, article) => {
        const category = article.category || 'Sans catégorie'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      const topCategories = Object.entries(categoryCount)
        .map(([name, articleCount]) => ({ name, articleCount }))
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 3)

      // Trouver l'article le plus populaire
      const mostPopularArticle = recentArticles.reduce((max, article) => 
        (article.views || 0) > (max.views || 0) ? article : max
      )

      return {
        authorId: performanceStats.authorId,
        authorName: performanceStats.authorName,
        totalArticles: performanceStats.totalArticles,
        totalViews: performanceStats.totalViews,
        totalLikes: performanceStats.totalLikes,
        totalHearts: performanceStats.totalHearts,
        averageViewsPerArticle: performanceStats.averageViewsPerArticle,
        mostPopularArticle: mostPopularArticle ? {
          id: mostPopularArticle._id,
          title: mostPopularArticle.title,
          views: mostPopularArticle.views || 0,
          likes: mostPopularArticle.likes || 0,
          hearts: mostPopularArticle.hearts || 0
        } : undefined,
        recentArticles: recentArticles.map(article => ({
          id: article._id,
          title: article.title,
          publishedAt: article.publishedAt,
          views: article.views || 0,
          likes: article.likes || 0,
          hearts: article.hearts || 0,
          comments: article.comments || 0
        })),
        monthlyActivityTrend: monthlyTrend,
        topCategories: topCategories
      }
    } catch (error) {
      console.error('Erreur de récupération des insights du rédacteur', error)
      return null
    }
  }

  // Générer un rapport détaillé pour un article spécifique
  async getArticleDetailedReport(
    articleId: string
  ): Promise<{
    title: string
    views: number
    likes: number
    hearts: number
    comments: number
    commentStats: {
      total: number
      pending: number
      approved: number
    }
    viewTrend: Array<{
      date: string
      views: number
    }>
  } | null> {
    try {
      // Récupérer les détails de base de l'article
      const articleQuery = `*[_type == "article" && _id == "${articleId}"][0] {
        title,
        views,
        likes,
        hearts
      }`

      const articleData = await client.fetch(articleQuery)

      if (!articleData) {
        return null
      }

      // Récupérer les statistiques de commentaires
      const commentStats = await commentManager.getCommentStatistics(articleId)

      // Récupérer la tendance des vues (à implémenter selon votre système de tracking)
      // Ceci est un placeholder - vous devrez adapter selon votre système de tracking des vues
      const viewTrend = [
        { date: '2023-01-01', views: 10 },
        { date: '2023-01-02', views: 15 },
        { date: '2023-01-03', views: 20 }
      ]

      return {
        title: articleData.title,
        views: articleData.views || 0,
        likes: articleData.likes || 0,
        hearts: articleData.hearts || 0,
        comments: commentStats.totalComments,
        commentStats: {
          total: commentStats.totalComments,
          pending: commentStats.pendingComments,
          approved: commentStats.approvedComments
        },
        viewTrend
      }
    } catch (error) {
      console.error('Erreur de récupération du rapport détaillé', error)
      return null
    }
  }

  // Comparer les performances entre rédacteurs
  async getWriterPerformanceComparison(): Promise<Array<{
    authorId: string
    authorName: string
    totalArticles: number
    totalViews: number
    averageViewsPerArticle: number
  }>> {
    return await writerStatsManager.compareWriterPerformances()
  }
}

// Singleton pour faciliter l'utilisation
export const writerDashboardManager = new WriterDashboardManager()