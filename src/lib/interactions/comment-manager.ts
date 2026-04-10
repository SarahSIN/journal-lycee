import { createClient } from '@supabase/supabase-js'
import { client } from '@/lib/sanity/client'

export interface CommentData {
  id?: string
  articleId: string
  userId: string
  content: string
  userName?: string
  userAvatar?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: Date
}

export class CommentManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Ajouter un commentaire
  async addComment(comment: CommentData): Promise<CommentData> {
    try {
      const { data, error } = await this.supabase
        .from('article_comments')
        .insert({
          article_id: comment.articleId,
          user_id: comment.userId,
          content: comment.content,
          user_name: comment.userName,
          user_avatar: comment.userAvatar,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id,
        articleId: data.article_id,
        userId: data.user_id,
        content: data.content,
        userName: data.user_name,
        userAvatar: data.user_avatar,
        status: data.status,
        createdAt: new Date(data.created_at)
      }
    } catch (error) {
      console.error('Erreur d\'ajout de commentaire', error)
      throw error
    }
  }

  // Modérer un commentaire (admin)
  async moderateComment(
    commentId: string, 
    action: 'approve' | 'reject'
  ): Promise<CommentData> {
    try {
      const { data, error } = await this.supabase
        .from('article_comments')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          moderated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id,
        articleId: data.article_id,
        userId: data.user_id,
        content: data.content,
        userName: data.user_name,
        userAvatar: data.user_avatar,
        status: data.status,
        createdAt: new Date(data.created_at)
      }
    } catch (error) {
      console.error('Erreur de modération de commentaire', error)
      throw error
    }
  }

  // Récupérer les commentaires pour un article
  async getArticleComments(
    articleId: string, 
    options?: {
      status?: 'pending' | 'approved' | 'rejected'
      limit?: number
      offset?: number
    }
  ): Promise<CommentData[]> {
    try {
      let query = this.supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 10))

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data.map(comment => ({
        id: comment.id,
        articleId: comment.article_id,
        userId: comment.user_id,
        content: comment.content,
        userName: comment.user_name,
        userAvatar: comment.user_avatar,
        status: comment.status,
        createdAt: new Date(comment.created_at)
      }))
    } catch (error) {
      console.error('Erreur de récupération des commentaires', error)
      return []
    }
  }

  // Obtenir les statistiques de commentaires
  async getCommentStatistics(articleId: string): Promise<{
    totalComments: number
    pendingComments: number
    approvedComments: number
  }> {
    try {
      const { count: totalComments, error: totalError } = await this.supabase
        .from('article_comments')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId)

      if (totalError) {
        throw totalError
      }

      const { count: pendingComments, error: pendingError } = await this.supabase
        .from('article_comments')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId)
        .eq('status', 'pending')

      if (pendingError) {
        throw pendingError
      }

      const { count: approvedComments, error: approvedError } = await this.supabase
        .from('article_comments')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId)
        .eq('status', 'approved')

      if (approvedError) {
        throw approvedError
      }

      return {
        totalComments,
        pendingComments,
        approvedComments
      }
    } catch (error) {
      console.error('Erreur de récupération des statistiques de commentaires', error)
      return {
        totalComments: 0,
        pendingComments: 0,
        approvedComments: 0
      }
    }
  }

  // Supprimer un commentaire
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Erreur de suppression de commentaire', error)
      return false
    }
  }
}

// Singleton pour faciliter l'utilisation
export const commentManager = new CommentManager()