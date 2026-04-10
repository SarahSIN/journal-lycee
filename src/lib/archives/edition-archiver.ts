import { client } from '@/lib/sanity/client'
import { contentManager } from '@/lib/storage/content-manager'

export interface ArchivedEdition {
  id: string
  title: string
  publishDate: string
  coverImageUrl?: string
  pdfUrl?: string
  articleCount: number
  tags: string[]
  description?: string
}

export class EditionArchiver {
  // Archiver une édition complète
  async archiveEdition(editionId: string): Promise<ArchivedEdition | null> {
    try {
      // Récupérer les détails complets de l'édition
      const query = `*[_type == "edition" && _id == "${editionId}"][0] {
        _id,
        title,
        publishDate,
        "coverImageUrl": coverImage.asset->url,
        "pdfUrl": pdfVersion.asset->url,
        "articles": articles[]->{
          title,
          tags
        }
      }`

      const edition = await client.fetch(query)

      if (!edition) {
        console.error('Édition non trouvée')
        return null
      }

      // Préparer les données d'archivage
      const archivedEdition: ArchivedEdition = {
        id: edition._id,
        title: edition.title,
        publishDate: edition.publishDate,
        coverImageUrl: edition.coverImageUrl,
        pdfUrl: edition.pdfUrl,
        articleCount: edition.articles.length,
        tags: Array.from(new Set(
          edition.articles.flatMap(article => article.tags || [])
        )),
        description: `Archive de l'édition ${edition.title} publiée le ${edition.publishDate}`
      }

      // Stocker dans un stockage permanent (Supabase)
      const { data, error } = await contentManager.supabase
        .from('permanent_archives')
        .upsert(archivedEdition)
        .select()
        .single()

      if (error) {
        console.error('Erreur d\'archivage', error)
        return null
      }

      // Marquer l'édition comme archivée dans Sanity
      await client
        .patch(editionId)
        .set({ 
          status: 'archived', 
          archivedAt: new Date().toISOString() 
        })
        .commit()

      return archivedEdition
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'édition', error)
      return null
    }
  }

  // Récupérer les éditions archivées
  async getArchivedEditions(options?: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
    tags?: string[]
  }): Promise<ArchivedEdition[]> {
    try {
      let query = this.supabase
        .from('permanent_archives')
        .select('*')

      if (options?.startDate) {
        query = query.gte('publishDate', options.startDate.toISOString())
      }

      if (options?.endDate) {
        query = query.lte('publishDate', options.endDate.toISOString())
      }

      if (options?.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags)
      }

      query = query
        .order('publishDate', { ascending: false })
        .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 10))

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erreur de récupération des archives', error)
      return []
    }
  }

  // Obtenir des statistiques sur les archives
  async getArchiveStatistics(): Promise<{
    totalArchivedEditions: number
    oldestArchive?: string
    newestArchive?: string
    tagDistribution: Record<string, number>
  }> {
    try {
      const { count, error: countError } = await this.supabase
        .from('permanent_archives')
        .select('*', { count: 'exact' })

      if (countError) {
        throw countError
      }

      const { data: oldestArchive, error: oldestError } = await this.supabase
        .from('permanent_archives')
        .select('publishDate')
        .order('publishDate', { ascending: true })
        .limit(1)

      if (oldestError) {
        throw oldestError
      }

      const { data: newestArchive, error: newestError } = await this.supabase
        .from('permanent_archives')
        .select('publishDate')
        .order('publishDate', { ascending: false })
        .limit(1)

      if (newestError) {
        throw newestError
      }

      // Calculer la distribution des tags
      const { data: tagData, error: tagError } = await this.supabase
        .from('permanent_archives')
        .select('tags')

      if (tagError) {
        throw tagError
      }

      const tagDistribution = tagData.reduce((acc, item) => {
        item.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {})

      return {
        totalArchivedEditions: count,
        oldestArchive: oldestArchive[0]?.publishDate,
        newestArchive: newestArchive[0]?.publishDate,
        tagDistribution
      }
    } catch (error) {
      console.error('Erreur de récupération des statistiques d\'archives', error)
      return {
        totalArchivedEditions: 0,
        tagDistribution: {}
      }
    }
  }

  // Restaurer une édition archivée
  async restoreArchivedEdition(archivedEditionId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('permanent_archives')
        .select('*')
        .eq('id', archivedEditionId)
        .single()

      if (error) {
        throw error
      }

      // Recréer l'édition dans Sanity
      const restoredEdition = await client.create({
        _type: 'edition',
        title: data.title,
        publishDate: data.publishDate,
        coverImage: { 
          _type: 'image', 
          asset: { _ref: data.coverImageUrl } 
        },
        pdfVersion: { 
          _type: 'file', 
          asset: { _ref: data.pdfUrl } 
        },
        status: 'published'
      })

      return !!restoredEdition
    } catch (error) {
      console.error('Erreur de restauration de l\'archive', error)
      return false
    }
  }
}

// Singleton pour faciliter l'utilisation
export const editionArchiver = new EditionArchiver()