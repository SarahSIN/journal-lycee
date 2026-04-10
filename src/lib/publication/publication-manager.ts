import { client } from '@/lib/sanity/client'
import { contentManager } from '@/lib/storage/content-manager'

export interface PublicationStatus {
  id: string
  title: string
  status: 'draft' | 'pending' | 'published' | 'archived'
  publishedAt?: Date
  author: string
  views: number
  likes: number
}

export class PublicationManager {
  // Créer un nouvel article
  async createArticle(articleData: {
    title: string
    content: string
    author: string
    tags?: string[]
    category?: string
    pdfFile?: File
    podcastFile?: File
  }): Promise<PublicationStatus> {
    try {
      // Créer l'article dans Sanity
      const article = await client.create({
        _type: 'article',
        title: articleData.title,
        body: articleData.content,
        author: { _type: 'reference', _ref: articleData.author },
        tags: articleData.tags || [],
        category: articleData.category ? 
          { _type: 'reference', _ref: articleData.category } : 
          undefined,
        status: 'pending'
      })

      // Gérer les fichiers associés
      if (articleData.pdfFile) {
        await contentManager.uploadContent(
          articleData.pdfFile, 
          'pdf', 
          { title: `PDF - ${articleData.title}` }
        )
      }

      if (articleData.podcastFile) {
        await contentManager.uploadContent(
          articleData.podcastFile, 
          'podcast', 
          { title: `Podcast - ${articleData.title}` }
        )
      }

      return {
        id: article._id,
        title: articleData.title,
        status: 'pending',
        author: articleData.author,
        views: 0,
        likes: 0
      }
    } catch (error) {
      console.error('Erreur de publication', error)
      throw new Error('Impossible de publier l\'article')
    }
  }

  // Publier un article
  async publishArticle(articleId: string): Promise<PublicationStatus> {
    try {
      const updatedArticle = await client
        .patch(articleId)
        .set({ 
          status: 'published', 
          publishedAt: new Date().toISOString() 
        })
        .commit()

      return {
        id: updatedArticle._id,
        title: updatedArticle.title,
        status: 'published',
        publishedAt: new Date(updatedArticle.publishedAt),
        author: updatedArticle.author,
        views: 0,
        likes: 0
      }
    } catch (error) {
      console.error('Erreur de publication', error)
      throw new Error('Impossible de publier l\'article')
    }
  }

  // Archiver un article
  async archiveArticle(articleId: string): Promise<PublicationStatus> {
    try {
      const updatedArticle = await client
        .patch(articleId)
        .set({ status: 'archived' })
        .commit()

      return {
        id: updatedArticle._id,
        title: updatedArticle.title,
        status: 'archived',
        author: updatedArticle.author,
        views: updatedArticle.views || 0,
        likes: updatedArticle.likes || 0
      }
    } catch (error) {
      console.error('Erreur d\'archivage', error)
      throw new Error('Impossible d\'archiver l\'article')
    }
  }

  // Récupérer les articles publiés
  async getPublishedArticles(options?: {
    limit?: number
    offset?: number
    category?: string
    tags?: string[]
  }): Promise<PublicationStatus[]> {
    const query = `*[_type == "article" && status == "published"]${
      options?.category ? ` && category->slug.current == "${options.category}"` : ''
    }${
      options?.tags ? ` && count(tags[in: ${JSON.stringify(options.tags)}]) > 0` : ''
    } | order(publishedAt desc) [${options?.offset || 0}...${
      (options?.offset || 0) + (options?.limit || 10)
    }]`

    const articles = await client.fetch(query)

    return articles.map(article => ({
      id: article._id,
      title: article.title,
      status: 'published',
      publishedAt: new Date(article.publishedAt),
      author: article.author,
      views: article.views || 0,
      likes: article.likes || 0
    }))
  }
}

// Singleton pour faciliter l'utilisation
export const publicationManager = new PublicationManager()