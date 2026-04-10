import { client } from '@/lib/sanity/client'
import { createClient } from '@supabase/supabase-js'

export interface ViewCounterOptions {
  articleId: string
  userId?: string
}

export class ViewCounter {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Incrémenter le nombre de vues pour un article
  async incrementViewCount(options: ViewCounterOptions): Promise<number> {
    try {
      // Vérifier si l'utilisateur a déjà vu l'article
      const { data: existingView, error: viewCheckError } = await this.supabase
        .from('article_views')
        .select('*')
        .eq('article_id', options.articleId)
        .eq('user_id', options.userId)
        .single()

      if (viewCheckError && viewCheckError.code !== 'PGRST116') {
        throw viewCheckError
      }

      // Si l'utilisateur n'a pas déjà vu l'article, incrémenter
      if (!existingView) {
        // Enregistrer la vue dans Supabase
        const { error: insertError } = await this.supabase
          .from('article_views')
          .insert({
            article_id: options.articleId,
            user_id: options.userId,
            viewed_at: new Date().toISOString()
          })

        if (insertError) {
          throw insertError
        }

        // Mettre à jour le nombre de vues dans Sanity
        await client
          .patch(options.articleId)
          .inc({ views: 1 })
          .commit()
      }

      // Récupérer le nombre total de vues
      const { data: viewsData, error: fetchError } = await this.supabase
        .from('article_views')
        .select('article_id', { count: 'exact' })
        .eq('article_id', options.articleId)

      if (fetchError) {
        throw fetchError
      }

      return viewsData.length || 0
    } catch (error) {
      console.error('Erreur de comptage de vues', error)
      return 0
    }
  }

  // Récupérer le nombre total de vues pour un article
  async getViewCount(articleId: string): Promise<number> {
    try {
      const { data: viewsData, error } = await this.supabase
        .from('article_views')
        .select('article_id', { count: 'exact' })
        .eq('article_id', articleId)

      if (error) {
        throw error
      }

      return viewsData.length || 0
    } catch (error) {
      console.error('Erreur de récupération des vues', error)
      return 0
    }
  }

  // Obtenir les articles les plus vus
  async getMostViewedArticles(limit: number = 10): Promise<Array<{
    id: string
    title: string
    viewCount: number
  }>> {
    try {
      const query = `*[_type == "article"] | order(views desc)[0...${limit}] {
        _id,
        title,
        views
      }`

      const articles = await client.fetch(query)

      return articles.map(article => ({
        id: article._id,
        title: article.title,
        viewCount: article.views || 0
      }))
    } catch (error) {
      console.error('Erreur de récupération des articles les plus vus', error)
      return []
    }
  }
}

// Singleton pour faciliter l'utilisation
export const viewCounter = new ViewCounter()