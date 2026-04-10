import { client } from '@/lib/sanity/client'
import { createClient } from '@supabase/supabase-js'

export interface TagData {
  id?: string
  name: string
  slug: string
  description?: string
  articleCount?: number
  color?: string
}

export class TagManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Créer un nouveau tag
  async createTag(tagData: TagData): Promise<TagData | null> {
    try {
      // Créer le tag dans Sanity
      const tag = await client.create({
        _type: 'tag',
        name: tagData.name,
        slug: {
          _type: 'slug',
          current: tagData.slug
        },
        description: tagData.description,
        color: tagData.color
      })

      return {
        id: tag._id,
        name: tag.name,
        slug: tag.slug.current,
        description: tag.description,
        color: tag.color
      }
    } catch (error) {
      console.error('Erreur de création de tag', error)
      return null
    }
  }

  // Mettre à jour un tag existant
  async updateTag(tagId: string, updateData: Partial<TagData>): Promise<TagData | null> {
    try {
      const updatedTag = await client
        .patch(tagId)
        .set({
          name: updateData.name,
          'slug.current': updateData.slug,
          description: updateData.description,
          color: updateData.color
        })
        .commit()

      return {
        id: updatedTag._id,
        name: updatedTag.name,
        slug: updatedTag.slug.current,
        description: updatedTag.description,
        color: updatedTag.color
      }
    } catch (error) {
      console.error('Erreur de mise à jour du tag', error)
      return null
    }
  }

  // Supprimer un tag
  async deleteTag(tagId: string): Promise<boolean> {
    try {
      await client.delete(tagId)
      return true
    } catch (error) {
      console.error('Erreur de suppression du tag', error)
      return false
    }
  }

  // Récupérer tous les tags
  async getAllTags(options?: {
    limit?: number
    offset?: number
  }): Promise<TagData[]> {
    try {
      const query = `*[_type == "tag"] | order(name asc) [${options?.offset || 0}...${(options?.offset || 0) + (options?.limit || 50)}] {
        _id,
        name,
        "slug": slug.current,
        description,
        color,
        "articleCount": count(*[_type == "article" && references(^._id)])
      }`

      const tags = await client.fetch(query)

      return tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        articleCount: tag.articleCount
      }))
    } catch (error) {
      console.error('Erreur de récupération des tags', error)
      return []
    }
  }

  // Rechercher des tags
  async searchTags(query: string): Promise<TagData[]> {
    try {
      const searchQuery = `*[_type == "tag" && (name match "${query}*" || description match "${query}*")] {
        _id,
        name,
        "slug": slug.current,
        description,
        color,
        "articleCount": count(*[_type == "article" && references(^._id)])
      }`

      const tags = await client.fetch(searchQuery)

      return tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        articleCount: tag.articleCount
      }))
    } catch (error) {
      console.error('Erreur de recherche de tags', error)
      return []
    }
  }

  // Obtenir les articles associés à un tag
  async getArticlesByTag(tagSlug: string, options?: {
    limit?: number
    offset?: number
  }): Promise<Array<{
    id: string
    title: string
    publishedAt: string
    author: string
  }>> {
    try {
      const query = `*[_type == "article" && references(*[_type == "tag" && slug.current == "${tagSlug}"]._id)] | order(publishedAt desc) [${options?.offset || 0}...${(options?.offset || 0) + (options?.limit || 10)}] {
        _id,
        title,
        publishedAt,
        "author": author->name
      }`

      const articles = await client.fetch(query)

      return articles.map(article => ({
        id: article._id,
        title: article.title,
        publishedAt: article.publishedAt,
        author: article.author
      }))
    } catch (error) {
      console.error('Erreur de récupération des articles par tag', error)
      return []
    }
  }

  // Obtenir les tags les plus utilisés
  async getMostUsedTags(limit: number = 10): Promise<TagData[]> {
    try {
      const query = `*[_type == "tag"] | order(count(*[_type == "article" && references(^._id)]) desc) [0...${limit}] {
        _id,
        name,
        "slug": slug.current,
        description,
        color,
        "articleCount": count(*[_type == "article" && references(^._id)])
      }`

      const tags = await client.fetch(query)

      return tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        articleCount: tag.articleCount
      }))
    } catch (error) {
      console.error('Erreur de récupération des tags les plus utilisés', error)
      return []
    }
  }
}

// Singleton pour faciliter l'utilisation
export const tagManager = new TagManager()