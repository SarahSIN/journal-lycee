import axe from 'axe-core'

export interface AccessibilityIssue {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  helpUrl: string
  element?: Element
}

export class AccessibilityChecker {
  // Vérifier l'accessibilité de la page courante
  async checkCurrentPage(): Promise<AccessibilityIssue[]> {
    return new Promise((resolve) => {
      axe.run((err, results) => {
        if (err) {
          console.error('Erreur lors du test d\'accessibilité', err)
          resolve([])
          return
        }

        const issues: AccessibilityIssue[] = results.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact as AccessibilityIssue['impact'],
          description: violation.description,
          helpUrl: violation.helpUrl,
          element: violation.nodes[0]?.target ? 
            document.querySelector(violation.nodes[0].target[0]) : 
            undefined
        }))

        resolve(issues)
      })
    })
  }

  // Générer un rapport d'accessibilité
  async generateAccessibilityReport(): Promise<{
    totalIssues: number
    criticalIssues: number
    issues: AccessibilityIssue[]
  }> {
    const issues = await this.checkCurrentPage()

    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(issue => issue.impact === 'critical').length,
      issues
    }
  }

  // Corriger automatiquement certains problèmes simples
  autoFixAccessibility() {
    // Ajouter des attributs aria manquants
    this.addMissingAriaAttributes()

    // Améliorer le contraste des couleurs
    this.improveColorContrast()
  }

  private addMissingAriaAttributes() {
    // Exemple : Ajouter des labels aux formulaires
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
      const label = input.closest('label')
      if (label) {
        input.setAttribute('aria-label', label.textContent || '')
      }
    })

    // Ajouter des rôles ARIA aux composants personnalisés
    document.querySelectorAll('[role=""]').forEach(el => {
      if (el.tagName === 'BUTTON') {
        el.setAttribute('role', 'button')
      }
    })
  }

  private improveColorContrast() {
    // Vérifier et ajuster le contraste des couleurs
    const elements = document.body.getElementsByTagName('*')
    
    for (const el of elements) {
      const style = window.getComputedStyle(el)
      const backgroundColor = style.backgroundColor
      const color = style.color

      // TODO: Implémenter un algorithme de vérification du contraste
      // Si le contraste est insuffisant, ajuster les couleurs
    }
  }

  // Générer des recommandations d'amélioration
  getAccessibilityRecommendations(): string[] {
    return [
      'Ajouter des descriptions alternatives pour les images',
      'Assurer une navigation au clavier pour tous les éléments interactifs',
      'Utiliser des titres de section hiérarchiques',
      'Fournir des transcriptions pour les contenus audio/vidéo',
      'Tester avec des lecteurs d\'écran'
    ]
  }
}

// Singleton pour faciliter l'utilisation
export const accessibilityChecker = new AccessibilityChecker()