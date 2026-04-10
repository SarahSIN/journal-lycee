import { createClient } from '@supabase/supabase-js'
import { client } from '@/lib/sanity/client'

export interface NotificationPreferences {
  userId: string
  email: string
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  interestedCategories: string[]
}

export interface ArticleNotification {
  id: string
  articleId: string
  title: string
  summary: string
  category: string
  publishedAt: Date
  authorName: string
  thumbnailUrl?: string
}

export class ArticleNotificationManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Enregistrer les préférences de notification d'un utilisateur
  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: preferences.userId,
          email: preferences.email,
          enable_email_notifications: preferences.enableEmailNotifications,
          enable_push_notifications: preferences.enablePushNotifications,
          interested_categories: preferences.interestedCategories
        })

      return !error
    } catch (error) {
      console.error('Erreur de mise à jour des préférences', error)
      return false
    }
  }

  // Récupérer les préférences de notification d'un utilisateur
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        throw error
      }

      return {
        userId: data.user_id,
        email: data.email,
        enableEmailNotifications: data.enable_email_notifications,
        enablePushNotifications: data.enable_push_notifications,
        interestedCategories: data.interested_categories || []
      }
    } catch (error) {
      console.error('Erreur de récupération des préférences', error)
      return null
    }
  }

  // Créer une notification pour un nouvel article
  async createArticleNotification(articleId: string): Promise<ArticleNotification | null> {
    try {
      // Récupérer les détails de l'article depuis Sanity
      const query = `*[_type == "article" && _id == "${articleId}"][0] {
        _id,
        title,
        "summary": pt::text(body),
        "category": category->title,
        publishedAt,
        "authorName": author->name,
        "thumbnailUrl": mainImage.asset->url
      }`

      const articleData = await client.fetch(query)

      if (!articleData) {
        return null
      }

      const notification: ArticleNotification = {
        id: `notification_${articleId}`,
        articleId: articleData._id,
        title: articleData.title,
        summary: articleData.summary.slice(0, 200) + '...',
        category: articleData.category,
        publishedAt: new Date(articleData.publishedAt),
        authorName: articleData.authorName,
        thumbnailUrl: articleData.thumbnailUrl
      }

      // Trouver les utilisateurs intéressés par cette catégorie
      const { data: interestedUsers, error } = await this.supabase
        .from('user_notification_preferences')
        .select('*')
        .contains('interested_categories', [notification.category])

      if (error) {
        throw error
      }

      // Envoyer des notifications
      await Promise.all(interestedUsers.map(async (user) => {
        // Notification par email
        if (user.enable_email_notifications) {
          await this.sendEmailNotification(user.email, notification)
        }

        // Notification push (à implémenter selon votre système de push)
        if (user.enable_push_notifications) {
          await this.sendPushNotification(user.user_id, notification)
        }

        // Enregistrer la notification
        await this.storeNotification(user.user_id, notification)
      }))

      return notification
    } catch (error) {
      console.error('Erreur de création de notification', error)
      return null
    }
  }

  // Envoyer une notification par email
  private async sendEmailNotification(
    email: string, 
    notification: ArticleNotification
  ): Promise<boolean> {
    try {
      // TODO: Intégrer un service d'envoi d'emails comme SendGrid ou Mailgun
      console.log(`Email envoyé à ${email}:`, notification)
      return true
    } catch (error) {
      console.error('Erreur d\'envoi d\'email', error)
      return false
    }
  }

  // Envoyer une notification push
  private async sendPushNotification(
    userId: string, 
    notification: ArticleNotification
  ): Promise<boolean> {
    try {
      // TODO: Intégrer un service de notifications push comme Firebase Cloud Messaging
      console.log(`Notification push envoyée à ${userId}:`, notification)
      return true
    } catch (error) {
      console.error('Erreur d\'envoi de notification push', error)
      return false
    }
  }

  // Stocker la notification pour l'utilisateur
  private async storeNotification(
    userId: string, 
    notification: ArticleNotification
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          article_id: notification.articleId,
          title: notification.title,
          summary: notification.summary,
          category: notification.category,
          created_at: new Date().toISOString(),
          is_read: false
        })

      return !error
    } catch (error) {
      console.error('Erreur de stockage de notification', error)
      return false
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  async getUserUnreadNotifications(
    userId: string
  ): Promise<ArticleNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data.map(notification => ({
        id: notification.id,
        articleId: notification.article_id,
        title: notification.title,
        summary: notification.summary,
        category: notification.category,
        publishedAt: new Date(notification.created_at),
        authorName: '', // Ces informations ne sont pas stockées dans cette table
        thumbnailUrl: '' // Ces informations ne sont pas stockées dans cette table
      }))
    } catch (error) {
      console.error('Erreur de récupération des notifications', error)
      return []
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(
    notificationId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('Erreur de marquage de notification', error)
      return false
    }
  }
}

// Singleton pour faciliter l'utilisation
export const articleNotificationManager = new ArticleNotificationManager()