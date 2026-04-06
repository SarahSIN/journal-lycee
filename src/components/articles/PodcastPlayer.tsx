// 1. IMPORTS
import React from 'react'

// 2. TYPES
type PodcastPlayerProps = {
  audioFile: {
    asset: {
      url: string
    }
  }
}

// 3. COMPOSANT
/**
 * Composant pour afficher un lecteur audio HTML5 standard avec un fichier audio Sanity
 */
export default function PodcastPlayer({ audioFile }: PodcastPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <audio
        controls
        className="w-full"
        preload="metadata"
        src={audioFile.asset.url}
      >
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </div>
  )
}
