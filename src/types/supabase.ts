// ============================================================================
// TYPES SUPABASE - Journal du Lycée Ozenne
// ============================================================================
// Description: Types TypeScript générés pour la base de données Supabase
// Correspond à la migration 001_create_interactions_tables.sql
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Type pour les rôles utilisateurs
export type UserRole = 'reader' | 'writer' | 'moderator' | 'admin'

export type Database = {
  public: {
    Tables: {
      // TABLE: users
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: UserRole
          profile_picture: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: UserRole
          profile_picture?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: UserRole
          profile_picture?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // TABLE: article_views
      article_views: {
        Row: {
          id: string
          article_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_views_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // TABLE: likes
      likes: {
        Row: {
          id: string
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // TABLE: comments
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          content: string
          is_moderated: boolean
          is_approved: boolean
          moderated_by: string | null
          moderated_at: string | null
          moderation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          content: string
          is_moderated?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          content?: string
          is_moderated?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_moderated_by_fkey"
            columns: ["moderated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_article_views_count: {
        Args: {
          p_article_id: string
        }
        Returns: number
      }
      get_article_likes_count: {
        Args: {
          p_article_id: string
        }
        Returns: number
      }
      get_article_comments_count: {
        Args: {
          p_article_id: string
        }
        Returns: number
      }
      has_user_liked_article: {
        Args: {
          p_article_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// TYPES HELPERS
// ============================================================================

// Types pour faciliter l'utilisation des tables
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type ArticleView = Database['public']['Tables']['article_views']['Row']
export type ArticleViewInsert = Database['public']['Tables']['article_views']['Insert']

export type Like = Database['public']['Tables']['likes']['Row']
export type LikeInsert = Database['public']['Tables']['likes']['Insert']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Type pour un commentaire avec les informations de l'utilisateur
export type CommentWithUser = Comment & {
  user: Pick<User, 'id' | 'username' | 'profile_picture' | 'role'>
}

// Type pour les statistiques d'un article
export type ArticleStats = {
  views: number
  likes: number
  comments: number
  hasUserLiked?: boolean
}