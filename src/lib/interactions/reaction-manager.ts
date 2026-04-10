import { createClient } from '@supabase/supabase-js'
import { client } from '@/lib/sanity/client'

export interface ReactionOptions {
  articleId: string
  userId: string
  reactionType: 'heart' | 'like'
}

export class ReactionManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Ajouter ou retirer une réaction
  async toggleReaction(options: ReactionOptions): Promise<{
    totalReactions: number
    userReacted: boolean
  }> {
    try {
      // Vérifier si l'utilisateur a déjà réagi
      const { data: existingReaction, error: checkError } = await this.supabase
        .from('article_reactions')
        .select('*')
        .eq('article_id', options.articleId)
        .eq('user_id', options.userId)
        .eq('reaction_type', options.reactionType)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingReaction) {
        // Supprimer la réaction existante
        const { error: deleteError } = await this.supabase
          .from('article_reactions')
          .delete()
          .eq('article_id', options.articleId)
          .eq('user_id', options.userId)
          .eq('reaction_type', options.reactionType)

        if (deleteError) {
          throw deleteError
        }
      } else {
        // Ajouter une nouvelle réaction
        const { error: insertError } = await this.supabase
          .from('article_reactions')
          .insert({
            article_id: options.articleId,
            user_id: options.userId,
            reaction_type: options.reactionType,
            reacted_at: new Date().toISOString()
          })

        if (insertError) {
          throw insertError
        }
      }

      // Récupérer le nombre total de réactions
      const { data: reactionsData, error: countError } = await this.supabase
        .from('article_reactions')
        .select('article_id', { count: 'exact' })
        .eq('article_id', options.articleId)
        .eq('reaction_type', options.reactionType)

      if (countError) {
        throw countError
      }

      // Mettre à jour le nombre de réactions dans Sanity
      await client
        .patch(options.articleId)
        .set({ 
          [`${options.reactionType}s`]: reactionsData.length || 0 
        })
        .commit()

      return {
        totalReactions: reactionsData.length || 0,
        userReacted: !existingReaction
      }
    } catch (error) {
      console.error('Erreur de gestion des réactions', error)
      return {
        totalReactions: 0,
        userReacted: false
      }
    }
  }

  // Récupérer les réactions pour un article
  async getArticleReactions(articleId: string): Promise<{
    hearts: number
    likes: number
    userReactions?: {
      heart: boolean
      like: boolean
    }
  }> {
    try {
      // Récupérer le nombre de cœurs
      const { data: heartsData, error: heartsError } = await this.supabase
        .from('article_reactions')
        .select('article_id', { count: 'exact' })
        .eq('article_id', articleId)
        .eq('reaction_type', 'heart')

      if (heartsError) {
        throw heartsError
      }

      // Récupérer le nombre de likes
      const { data: likesData, error: likesError } = await this.supabase
        .from('article_reactions')
        .select('article_id', { count: 'exact' })
        .eq('article_id', articleId)
        .eq('reaction_type', 'like')

      if (likesError) {
        throw likesError
      }

      return {
        hearts: heartsData.length || 0,
        likes: likesData.length || 0
      }
    } catch (error) {
      console.error('Erreur de récupération des réactions', error)
      return {
        hearts: 0,
        likes: 0
      }
    }
  }

  // Obtenir les articles les plus réactifs
  async getMostReactiveArticles(limit: number = 10): Promise<Array<{
    id: string
    title: string
    totalReactions: number
  }>> {
    try {
      const query = `*[_type == "article"] | order(hearts + likes desc)[0...${limit}] {
        _id,
        title,
        "totalReactions": hearts + likes
      }`

      const articles = await client.fetch(query)

      return articles.map(article => ({
        id: article._id,
        title: article.title,
        totalReactions: article.totalReactions || 0
      }))
    } catch (error) {
      console.error('Erreur de récupération des articles les plus réactifs', error)
      return []
    }
  }
}

// Singleton pour faciliter l'utilisation
export const reactionManager = new ReactionManager()