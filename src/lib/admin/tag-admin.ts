import { client } from '@/lib/sanity/client'
import { createClient } from '@supabase/supabase-js'
import { tagManager } from '@/lib/tags/tag-manager'

export interface TagManagementAction {
  type: 'create' | 'update' | 'delete' | 'merge'
  tagData: {
    id?: string
    name?: string
    slug?: string
    description?: string
    color?: string
  }
  mergeTargetId?: string
}

export interface TagAdminLog {
  id: string
  action: TagManagementAction
  timestamp: Date
  adminUserId: string
  status: 'success' | 'failed'
  reason?: string
}

export class TagAdminManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Gérer les actions sur les tags
  async manageTags(
    actions: TagManagementAction[], 
    adminUserId: string
  ): Promise<{
    logs: TagAdminLog[]
    success: boolean
  }> {
    const logs: TagAdminLog[] = []

    for (const action of actions) {
      try {
        let result: any
        let log: TagAdminLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action,
          timestamp: new Date(),
          adminUserId,
          status: 'success'
        }

        switch (action.type) {
          case 'create':
            result = await tagManager.createTag({
              name: action.tagData.name!,
              slug: action.tagData.slug || this.generateSlug(action.tagData.name!),
              description: action.tagData.description,
              color: action.tagData.color
            })
            break

          case 'update':
            if (!action.tagData.id) {
              throw new Error('ID du tag requis pour la mise à jour')
            }
            result = await tagManager.updateTag(action.tagData.id, {
              name: action.tagData.name,
              slug: action.tagData.slug,
              description: action.tagData.description,
              color: action.tagData.color
            })
            break

          case 'delete':
            if (!action.tagData.id) {
              throw new Error('ID du tag requis pour la suppression')
            }
            result = await tagManager.deleteTag(action.tagData.id)
            break

          case 'merge':
            if (!action.tagData.id || !action.mergeTargetId) {
              throw new Error('IDs requis pour fusionner les tags')
            }
            result = await this.mergeTags(action.tagData.id, action.mergeTargetId)
            break

          default:
            throw new Error('Action de tag non reconnue')
        }

        // Enregistrer le log
        logs.push(log)
      } catch (error) {
        // Log des erreurs
        logs.push({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action,
          timestamp: new Date(),
          adminUserId,
          status: 'failed',
          reason: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    // Enregistrer les logs dans Supabase
    await this.saveLogs(logs)

    return {
      logs,
      success: logs.every(log => log.status === 'success')
    }
  }

  // Fusionner deux tags
  private async mergeTags(
    sourceTagId: string, 
    targetTagId: string
  ): Promise<boolean> {
    try {
      // Récupérer les détails des tags
      const sourceTags = await tagManager.searchTags(sourceTagId)
      const targetTags = await tagManager.searchTags(targetTagId)

      if (sourceTags.length === 0 || targetTags.length === 0) {
        throw new Error('Tags introuvables')
      }

      const sourceTag = sourceTags[0]
      const targetTag = targetTags[0]

      // Mettre à jour tous les articles avec le tag source
      const query = `*[_type == "article" && references("${sourceTagId}")]{_id}`
      const articlesToUpdate = await client.fetch(query)

      // Mettre à jour chaque article
      const updatePromises = articlesToUpdate.map(async (article) => {
        await client
          .patch(article._id)
          .unset([`tags[_ref=="${sourceTagId}"]`])
          .append('tags', [{ _type: 'reference', _ref: targetTagId }])
          .commit()
      })

      await Promise.all(updatePromises)

      // Supprimer le tag source
      await tagManager.deleteTag(sourceTagId)

      return true
    } catch (error) {
      console.error('Erreur de fusion de tags', error)
      return false
    }
  }

  // Générer un slug à partir du nom
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Sauvegarder les logs d'administration
  private async saveLogs(logs: TagAdminLog[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('admin_tag_logs')
        .insert(logs.map(log => ({
          id: log.id,
          action_type: log.action.type,
          tag_data: JSON.stringify(log.action.tagData),
          timestamp: log.timestamp.toISOString(),
          admin_user_id: log.adminUserId,
          status: log.status,
          reason: log.reason
        })))

      if (error) {
        console.error('Erreur de sauvegarde des logs', error)
      }
    } catch (error) {
      console.error('Erreur de sauvegarde des logs', error)
    }
  }

  // Récupérer l'historique des actions sur les tags
  async getTagManagementHistory(options?: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  }): Promise<TagAdminLog[]> {
    try {
      let query = this.supabase
        .from('admin_tag_logs')
        .select('*')

      if (options?.startDate) {
        query = query.gte('timestamp', options.startDate.toISOString())
      }

      if (options?.endDate) {
        query = query.lte('timestamp', options.endDate.toISOString())
      }

      query = query
        .order('timestamp', { ascending: false })
        .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 10))

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data.map(log => ({
        id: log.id,
        action: {
          type: log.action_type,
          tagData: JSON.parse(log.tag_data),
          mergeTargetId: log.merge_target_id
        },
        timestamp: new Date(log.timestamp),
        adminUserId: log.admin_user_id,
        status: log.status,
        reason: log.reason
      }))
    } catch (error) {
      console.error('Erreur de récupération de l\'historique des tags', error)
      return []
    }
  }
}

// Singleton pour faciliter l'utilisation
export const tagAdminManager = new TagAdminManager()