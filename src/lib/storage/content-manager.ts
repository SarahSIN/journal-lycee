import { createClient } from '@supabase/supabase-js'

// Types de contenu supportés
export type ContentType = 'article' | 'pdf' | 'podcast' | 'image'

// Interface pour les métadonnées de contenu
export interface ContentMetadata {
  id: string
  type: ContentType
  title: string
  url: string
  uploadedAt: Date
  size?: number
  mimeType?: string
  tags?: string[]
}

export class ContentManager {
  private supabase: any

  constructor() {
    // Initialisation de Supabase avec des variables d'environnement
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Téléverser un contenu
  async uploadContent(
    file: File, 
    type: ContentType, 
    metadata: Partial<ContentMetadata> = {}
  ): Promise<ContentMetadata> {
    const path = `${type}s/${Date.now()}_${file.name}`
    
    // Téléversement du fichier
    const { data, error: uploadError } = await this.supabase.storage
      .from('journal-content')
      .upload(path, file)

    if (uploadError) {
      throw new Error(`Erreur de téléversement : ${uploadError.message}`)
    }

    // Générer l'URL publique
    const { data: { publicUrl }, error: urlError } = this.supabase.storage
      .from('journal-content')
      .getPublicUrl(path)

    if (urlError) {
      throw new Error(`Erreur URL publique : ${urlError.message}`)
    }

    // Créer les métadonnées
    const contentMetadata: ContentMetadata = {
      id: data.path,
      type,
      title: metadata.title || file.name,
      url: publicUrl,
      uploadedAt: new Date(),
      size: file.size,
      mimeType: file.type,
      tags: metadata.tags || []
    }

    // Sauvegarder les métadonnées
    await this.saveContentMetadata(contentMetadata)

    return contentMetadata
  }

  // Sauvegarder les métadonnées du contenu
  private async saveContentMetadata(metadata: ContentMetadata) {
    const { error } = await this.supabase
      .from('content_metadata')
      .upsert(metadata)

    if (error) {
      console.error('Erreur sauvegarde métadonnées', error)
    }
  }

  // Récupérer les contenus par type
  async getContentByType(type: ContentType): Promise<ContentMetadata[]> {
    const { data, error } = await this.supabase
      .from('content_metadata')
      .select('*')
      .eq('type', type)
      .order('uploadedAt', { ascending: false })

    if (error) {
      throw new Error(`Erreur récupération contenu : ${error.message}`)
    }

    return data
  }

  // Supprimer un contenu
  async deleteContent(id: string) {
    // Supprimer le fichier du storage
    const { error: storageError } = await this.supabase.storage
      .from('journal-content')
      .remove([id])

    // Supprimer les métadonnées
    const { error: metadataError } = await this.supabase
      .from('content_metadata')
      .delete()
      .eq('id', id)

    if (storageError || metadataError) {
      throw new Error('Erreur de suppression du contenu')
    }
  }
}

// Singleton pour faciliter l'utilisation
export const contentManager = new ContentManager()