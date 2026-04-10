import React from 'react'

interface GoogleFormEmbedProps {
  formUrl: string
  title?: string
  width?: number | string
  height?: number | string
  className?: string
}

export const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({
  formUrl,
  title = 'Sondage',
  width = '100%',
  height = '500px',
  className = ''
}) => {
  // Validation de l'URL du formulaire Google
  const isValidGoogleFormUrl = (url: string) => {
    return url.includes('docs.google.com/forms')
  }

  if (!isValidGoogleFormUrl(formUrl)) {
    return (
      <div className="error-message">
        URL de formulaire Google invalide. Veuillez fournir un lien valide.
      </div>
    )
  }

  return (
    <div className={`google-form-container ${className}`}>
      <h2>{title}</h2>
      <iframe
        src={formUrl}
        width={width}
        height={height}
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title={title}
        allowFullScreen
        style={{
          border: 'none',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        Chargement du formulaire...
      </iframe>
    </div>
  )
}

// Hook personnalisé pour gérer les sondages
export const useSurveyManager = () => {
  const createSurvey = async (surveyData: {
    title: string
    questions: string[]
  }) => {
    // Logique future pour créer des sondages dynamiquement
    console.log('Création de sondage:', surveyData)
    // TODO: Implémenter la création de sondages via l'API Google Forms
  }

  return { createSurvey }
}