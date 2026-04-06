// 1. IMPORTS
import React from 'react'

// 2. TYPES
type PodcastPlayerProps = {
  audioUrl: string
}

// 3. COMPOSANT
/**
 * Composant simple pour afficher un lecteur audio HTML5 standard
 */
export default function PodcastPlayer({ audioUrl }: PodcastPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <audio
        controls
        className="w-full"
        preload="metadata"
      >
        <source src={audioUrl} type="audio/mpeg" />
        <source src={audioUrl} type="audio/wav" />
        <source src={audioUrl} type="audio/mp4" />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </div>
  )
}
