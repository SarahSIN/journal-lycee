import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

// Créer un constructeur d'URL d'image pour Sanity
const builder = imageUrlBuilder(client)

// Fonction utilitaire pour générer des URL d'image
export function urlForImage(source: { asset?: { _ref: string } } | undefined) {
  if (!source || !source.asset) {
    return {
      url: () => '',
      width: () => 0,
      height: () => 0
    }
  }

  return builder.image(source)
}