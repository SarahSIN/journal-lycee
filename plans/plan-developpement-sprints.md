# 📋 Plan de Développement - Journal du Lycée Ozenne

## 🎯 Vue d'ensemble du projet

Ce plan détaille le développement complet du site web du journal du lycée Ozenne en 6 sprints structurés. Le projet utilise **Next.js 16**, **Sanity CMS**, **Supabase** et **Tailwind CSS**.

### État actuel du projet

**✅ Fonctionnalités déjà implémentées :**
- Architecture Next.js avec App Router
- Intégration Sanity CMS (schémas: article, author, category, edition, blockContent)
- Configuration Supabase (client + hooks d'authentification)
- Composants UI de base (Button, Logo, GoogleFormEmbed, SeasonalTheme)
- Composants articles (ArticleCard, PdfViewer, PodcastPlayer)
- Layout responsive (Header, Footer, Navbar)
- Page d'accueil avec liste d'articles
- Page détail article avec Portable Text
- Thème saisonnier dynamique
- Managers utilitaires (tags, analytics, notifications, etc.)

**❌ Fonctionnalités manquantes (à développer) :**
- Intégration complète des interactions (likes, commentaires, vues)
- Pages pour podcasts et sondages
- Moteur de recherche d'éditions
- Système de modération des commentaires
- Tableau de bord rédacteur
- Notifications en temps réel
- Archivage et consultation des anciennes éditions
- Tests d'accessibilité WCAG
- Optimisations SEO avancées
- Système de publication programmée

---

## 📅 Sprint 1 : Fondations et Interactions de Base

**Objectif :** Mettre en place les interactions utilisateurs essentielles (vues, likes, commentaires)

### Tâches

#### 1.1 Configuration Supabase - Tables et Politiques RLS ✅ TERMINÉ
- ✅ Créer les tables Supabase :
  - ✅ `article_views` (id, article_id, user_id, viewed_at, ip_address, user_agent)
  - ✅ `likes` (id, article_id, user_id, created_at)
  - ✅ `comments` (id, article_id, user_id, content, created_at, is_moderated, is_approved, moderated_by, moderated_at, moderation_reason, updated_at)
  - ✅ `users` (id, username, email, role, profile_picture, bio, created_at, updated_at)
- ✅ Configurer les politiques RLS (Row Level Security)
- ✅ Créer les index pour optimiser les requêtes
- ✅ Créer les fonctions utilitaires SQL (get_article_views_count, get_article_likes_count, etc.)
- ✅ Créer les types TypeScript correspondants dans [`src/types/supabase.ts`](src/types/supabase.ts)
- ✅ Documentation complète dans [`supabase/README.md`](supabase/README.md)

**Fichiers créés :**
- [`supabase/migrations/001_create_interactions_tables.sql`](supabase/migrations/001_create_interactions_tables.sql)
- [`supabase/README.md`](supabase/README.md)

**Fichiers modifiés :**
- [`src/types/supabase.ts`](src/types/supabase.ts) - Types mis à jour avec toutes les tables et fonctions

#### 1.2 Composants d'Interactions
- Créer [`src/components/articles/LikeButton.tsx`](src/components/articles/LikeButton.tsx)
  - Bouton avec animation de cœur
  - Compteur de likes en temps réel
  - Gestion de l'état "liké/non liké"
- Créer [`src/components/articles/ViewCounter.tsx`](src/components/articles/ViewCounter.tsx)
  - Affichage du nombre de vues
  - Incrémentation automatique à la visite
- Créer [`src/components/articles/CommentSection.tsx`](src/components/articles/CommentSection.tsx)
  - Liste des commentaires approuvés
  - Formulaire d'ajout de commentaire
  - Indication "en attente de modération"

#### 1.3 Intégration dans la Page Article
- Modifier [`src/app/(website)/articles/[slug]/page.tsx`](src/app/(website)/articles/[slug]/page.tsx)
  - Intégrer LikeButton, ViewCounter, CommentSection
  - Récupérer les données d'interactions depuis Supabase
  - Gérer les états de chargement

#### 1.4 Hooks Personnalisés
- Créer [`src/lib/supabase/useArticleInteractions.ts`](src/lib/supabase/useArticleInteractions.ts)
  - Hook pour gérer likes, vues, commentaires
  - Synchronisation en temps réel avec Supabase Realtime

### Livrables Sprint 1
- Tables Supabase configurées et sécurisées
- Composants d'interactions fonctionnels
- Page article avec interactions complètes
- Documentation des hooks

---

## 📅 Sprint 2 : Pages Podcasts et Sondages

**Objectif :** Créer les pages dédiées aux podcasts et sondages Google Forms

### Tâches

#### 2.1 Schéma Sanity pour Podcasts
- Créer [`src/lib/sanity/schemas/podcast.ts`](src/lib/sanity/schemas/podcast.ts)
  - Champs : title, slug, description, audioFile, coverImage, duration, publishedAt, category
- Ajouter le schéma à [`src/lib/sanity/schemas/index.ts`](src/lib/sanity/schemas/index.ts)
- Créer le type TypeScript [`src/types/podcast.ts`](src/types/podcast.ts)

#### 2.2 Page Liste des Podcasts
- Créer [`src/app/(website)/podcasts/page.tsx`](src/app/(website)/podcasts/page.tsx)
  - Grille de cartes podcasts
  - Filtrage par catégorie
  - Player audio intégré dans chaque carte
- Créer [`src/components/articles/PodcastCard.tsx`](src/components/articles/PodcastCard.tsx)
  - Miniature avec durée
  - Bouton play/pause
  - Informations du podcast

#### 2.3 Page Détail Podcast
- Créer [`src/app/(website)/podcasts/[slug]/page.tsx`](src/app/(website)/podcasts/[slug]/page.tsx)
  - Player audio complet (réutiliser PodcastPlayer)
  - Description détaillée
  - Transcription (optionnelle)
  - Section commentaires et likes

#### 2.4 Schéma Sanity pour Sondages
- Créer [`src/lib/sanity/schemas/survey.ts`](src/lib/sanity/schemas/survey.ts)
  - Champs : title, slug, description, googleFormUrl, isActive, publishedAt, closedAt
- Créer le type TypeScript [`src/types/survey.ts`](src/types/survey.ts)

#### 2.5 Page Sondages
- Créer [`src/app/(website)/sondages/page.tsx`](src/app/(website)/sondages/page.tsx)
  - Liste des sondages actifs
  - Intégration GoogleFormEmbed
  - Indication des sondages fermés
  - Statistiques de participation (si disponibles)

### Livrables Sprint 2
- Schémas Sanity podcasts et sondages
- Pages podcasts (liste + détail)
- Page sondages avec Google Forms
- Composants réutilisables

---

## 📅 Sprint 3 : Recherche et Archives

**Objectif :** Implémenter le moteur de recherche et le système d'archivage des éditions

### Tâches

#### 3.1 Composant de Recherche
- Créer [`src/components/ui/SearchBar.tsx`](src/components/ui/SearchBar.tsx)
  - Barre de recherche avec autocomplétion
  - Filtres : date, catégorie, auteur, type de contenu
  - Résultats en temps réel
- Créer [`src/lib/search/article-search.ts`](src/lib/search/article-search.ts)
  - Fonction de recherche full-text
  - Algorithme de pertinence

#### 3.2 Page Résultats de Recherche
- Créer [`src/app/(website)/recherche/page.tsx`](src/app/(website)/recherche/page.tsx)
  - Affichage des résultats paginés
  - Filtres latéraux
  - Tri par pertinence/date
  - Mise en évidence des termes recherchés

#### 3.3 Système d'Archivage
- Améliorer [`src/lib/archives/edition-archiver.ts`](src/lib/archives/edition-archiver.ts)
  - Fonction d'archivage automatique par édition
  - Génération de PDF d'édition complète
  - Métadonnées d'archive
- Créer table Supabase `archived_editions`
  - Champs : id, edition_number, title, published_at, archived_at, pdf_url, article_count

#### 3.4 Page Archives
- Créer [`src/app/(website)/archives/page.tsx`](src/app/(website)/archives/page.tsx)
  - Timeline des éditions passées
  - Filtrage par année/mois
  - Téléchargement PDF
  - Prévisualisation des articles de l'édition
- Créer [`src/components/archives/EditionTimeline.tsx`](src/components/archives/EditionTimeline.tsx)
  - Composant timeline visuel
  - Navigation chronologique

#### 3.5 Intégration dans la Navigation
- Mettre à jour [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx)
  - Ajouter lien "Archives"
  - Intégrer SearchBar dans le header
- Mettre à jour [`src/components/layout/Navbar.tsx`](src/components/layout/Navbar.tsx)
  - Ajouter entrée "Recherche"

### Livrables Sprint 3
- Moteur de recherche fonctionnel
- Page archives avec timeline
- Système d'archivage automatique
- Navigation mise à jour

---

## 📅 Sprint 4 : Administration et Modération

**Objectif :** Créer l'interface d'administration pour la modération et la gestion

### Tâches

#### 4.1 Authentification Admin
- Créer [`src/lib/auth/admin-auth.ts`](src/lib/auth/admin-auth.ts)
  - Vérification du rôle admin
  - Middleware de protection des routes
  - Gestion de session sécurisée
- Créer [`src/app/(admin)/login/page.tsx`](src/app/(admin)/login/page.tsx)
  - Formulaire de connexion
  - Validation et redirection

#### 4.2 Dashboard Admin
- Créer [`src/app/(admin)/dashboard/page.tsx`](src/app/(admin)/dashboard/page.tsx)
  - Vue d'ensemble : statistiques globales
  - Graphiques : vues, likes, commentaires
  - Derniers articles publiés
  - Alertes de modération
- Créer [`src/components/admin/StatCard.tsx`](src/components/admin/StatCard.tsx)
  - Carte de statistique réutilisable

#### 4.3 Modération des Commentaires
- Créer [`src/app/(admin)/moderation/page.tsx`](src/app/(admin)/moderation/page.tsx)
  - Liste des commentaires en attente
  - Actions : approuver, rejeter, supprimer
  - Filtres : article, date, utilisateur
  - Système de signalement
- Créer [`src/components/admin/CommentModerationCard.tsx`](src/components/admin/CommentModerationCard.tsx)
  - Carte de commentaire avec actions
- Améliorer [`src/lib/interactions/comment-manager.ts`](src/lib/interactions/comment-manager.ts)
  - Fonctions de modération

#### 4.4 Gestion des Tags et Catégories
- Créer [`src/app/(admin)/tags/page.tsx`](src/app/(admin)/tags/page.tsx)
  - CRUD complet des tags
  - Fusion de tags
  - Statistiques d'utilisation
- Utiliser et améliorer [`src/lib/admin/tag-admin.ts`](src/lib/admin/tag-admin.ts)

#### 4.5 Gestion des Utilisateurs
- Créer [`src/app/(admin)/users/page.tsx`](src/app/(admin)/users/page.tsx)
  - Liste des utilisateurs
  - Bannissement/débannissement
  - Modification des rôles
  - Historique d'activité

### Livrables Sprint 4
- Interface admin complète
- Système de modération des commentaires
- Gestion des tags et utilisateurs
- Authentification sécurisée

---

## 📅 Sprint 5 : Tableau de Bord Rédacteur et Notifications

**Objectif :** Créer l'espace personnel des rédacteurs avec statistiques et notifications

### Tâches

#### 5.1 Dashboard Rédacteur
- Créer [`src/app/(website)/dashboard/page.tsx`](src/app/(website)/dashboard/page.tsx)
  - Statistiques personnelles (vues, likes, commentaires)
  - Liste des articles du rédacteur
  - Graphiques de performance
  - Objectifs et badges
- Améliorer [`src/lib/dashboard/writer-dashboard.ts`](src/lib/dashboard/writer-dashboard.ts)
  - Calcul des métriques
- Créer [`src/components/dashboard/WriterStats.tsx`](src/components/dashboard/WriterStats.tsx)
  - Composant de statistiques visuelles

#### 5.2 Système de Notifications
- Créer table Supabase `notifications`
  - Champs : id, user_id, type, title, message, link, is_read, created_at
- Améliorer [`src/lib/notifications/article-notifications.ts`](src/lib/notifications/article-notifications.ts)
  - Notifications pour : nouveau commentaire, like, publication, modération
  - Envoi par email (optionnel)
- Créer [`src/components/ui/NotificationBell.tsx`](src/components/ui/NotificationBell.tsx)
  - Icône cloche avec badge
  - Dropdown des notifications
  - Marquage comme lu

#### 5.3 Centre de Notifications
- Créer [`src/app/(website)/notifications/page.tsx`](src/app/(website)/notifications/page.tsx)
  - Liste complète des notifications
  - Filtrage par type
  - Actions groupées (tout marquer comme lu)
- Créer [`src/components/notifications/NotificationCard.tsx`](src/components/notifications/NotificationCard.tsx)

#### 5.4 Système de Badges et Récompenses
- Créer [`src/lib/gamification/badge-system.ts`](src/lib/gamification/badge-system.ts)
  - Définition des badges (premier article, 10 likes, etc.)
  - Attribution automatique
- Créer table Supabase `user_badges`
- Créer [`src/components/dashboard/BadgeDisplay.tsx`](src/components/dashboard/BadgeDisplay.tsx)
  - Affichage des badges obtenus

#### 5.5 Intégration dans le Layout
- Mettre à jour [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx)
  - Ajouter NotificationBell
  - Menu utilisateur avec lien dashboard

### Livrables Sprint 5
- Dashboard rédacteur avec statistiques
- Système de notifications en temps réel
- Centre de notifications
- Système de badges

---

## 📅 Sprint 6 : Optimisations, Accessibilité et Déploiement

**Objectif :** Finaliser le projet avec optimisations, tests d'accessibilité et déploiement

### Tâches

#### 6.1 Optimisations SEO
- Améliorer [`src/lib/seo/metadata.ts`](src/lib/seo/metadata.ts)
  - Métadonnées dynamiques pour toutes les pages
  - Open Graph et Twitter Cards
  - Structured Data (JSON-LD)
- Créer [`src/app/sitemap.ts`](src/app/sitemap.ts)
  - Génération automatique du sitemap
- Créer [`src/app/robots.txt`](src/app/robots.txt)
- Optimiser les images (Next.js Image avec formats modernes)

#### 6.2 Tests d'Accessibilité WCAG
- Améliorer [`src/lib/accessibility/accessibility-checker.ts`](src/lib/accessibility/accessibility-checker.ts)
  - Tests automatisés WCAG 2.1 AA
- Auditer tous les composants :
  - Contraste des couleurs
  - Navigation au clavier
  - Attributs ARIA
  - Textes alternatifs
  - Focus visible
- Créer [`docs/accessibility-report.md`](docs/accessibility-report.md)

#### 6.3 Tests Unitaires et d'Intégration
- Compléter les tests Jest existants
- Créer tests pour :
  - [`src/__tests__/components/LikeButton.test.tsx`](src/__tests__/components/LikeButton.test.tsx)
  - [`src/__tests__/components/CommentSection.test.tsx`](src/__tests__/components/CommentSection.test.tsx)
  - [`src/__tests__/lib/search.test.ts`](src/__tests__/lib/search.test.ts)
  - [`src/__tests__/lib/notifications.test.ts`](src/__tests__/lib/notifications.test.ts)
- Viser 80% de couverture de code

#### 6.4 Performance et Optimisations
- Implémenter le lazy loading pour les composants lourds
- Optimiser les requêtes Sanity (projection, cache)
- Configurer ISR (Incremental Static Regeneration) pour les articles
- Analyser et réduire le bundle JavaScript
- Configurer le cache Supabase
- Créer [`src/lib/performance/monitoring.ts`](src/lib/performance/monitoring.ts)
  - Monitoring des performances (Web Vitals)

#### 6.5 Documentation Finale
- Créer [`docs/guide-utilisateur.md`](docs/guide-utilisateur.md)
  - Guide pour les rédacteurs
  - Guide pour les administrateurs
- Créer [`docs/guide-developpeur.md`](docs/guide-developpeur.md)
  - Architecture du projet
  - Conventions de code
  - Guide de contribution
- Mettre à jour [`README.md`](README.md)
  - Installation et configuration
  - Variables d'environnement
  - Scripts disponibles

#### 6.6 Déploiement
- Configuration Vercel/Netlify
  - Variables d'environnement
  - Domaine personnalisé
  - Certificat SSL
- Configuration Sanity Studio en production
- Configuration Supabase en production
- Tests de déploiement
- Monitoring et alertes

#### 6.7 Fonctionnalités Bonus (si temps disponible)
- Système de brouillons pour les articles
- Mode sombre/clair (en plus du thème saisonnier)
- Export des statistiques en CSV
- Newsletter par email
- Partage sur réseaux sociaux

### Livrables Sprint 6
- Site optimisé et accessible WCAG AA
- Tests complets avec bonne couverture
- Documentation complète
- Site déployé en production
- Monitoring actif

---

## 📊 Récapitulatif des Sprints

| Sprint | Focus | Durée Estimée | Priorité |
|--------|-------|---------------|----------|
| Sprint 1 | Interactions de base | 2 semaines | Critique |
| Sprint 2 | Podcasts et Sondages | 1.5 semaines | Haute |
| Sprint 3 | Recherche et Archives | 2 semaines | Haute |
| Sprint 4 | Administration | 2 semaines | Critique |
| Sprint 5 | Dashboard et Notifications | 1.5 semaines | Moyenne |
| Sprint 6 | Optimisations et Déploiement | 2 semaines | Critique |

**Durée totale estimée : 11 semaines**

---

## 🎯 Critères de Succès

### Fonctionnels
- ✅ Tous les types de contenus publiables (articles, podcasts, sondages, PDF)
- ✅ Interactions utilisateurs complètes (vues, likes, commentaires)
- ✅ Système de modération fonctionnel
- ✅ Recherche et archives accessibles
- ✅ Dashboard rédacteur avec statistiques
- ✅ Notifications en temps réel

### Techniques
- ✅ Performance : score Lighthouse > 90
- ✅ Accessibilité : conformité WCAG 2.1 AA
- ✅ SEO : métadonnées complètes, sitemap
- ✅ Sécurité : RLS Supabase, authentification sécurisée
- ✅ Tests : couverture > 80%

### UX/UI
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Thème saisonnier dynamique
- ✅ Navigation intuitive
- ✅ Temps de chargement < 3s

---

## 🔧 Stack Technique Complète

### Frontend
- **Framework** : Next.js 16 (App Router)
- **UI** : React 19, Tailwind CSS 4
- **Composants** : Composants personnalisés modulaires

### Backend & Services
- **CMS** : Sanity (gestion de contenu)
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Storage** : Supabase Storage (fichiers audio, PDF)

### Outils de Développement
- **Tests** : Jest, Testing Library, Speckit
- **Linting** : ESLint
- **TypeScript** : Typage strict
- **Git** : Gestion de version

### Déploiement
- **Hébergement** : Vercel (recommandé) ou Netlify
- **CDN** : Automatique avec Vercel
- **Monitoring** : Vercel Analytics

---

## 📝 Notes Importantes

### Dépendances entre Sprints
- Sprint 2 peut commencer en parallèle de Sprint 1 (équipes différentes)
- Sprint 4 nécessite Sprint 1 terminé (modération des commentaires)
- Sprint 5 nécessite Sprint 1 et 4 terminés (notifications de modération)
- Sprint 6 nécessite tous les sprints précédents

### Risques Identifiés
1. **Intégration Supabase Realtime** : Peut nécessiter des ajustements de configuration
2. **Performance avec beaucoup de contenus** : Prévoir pagination et lazy loading
3. **Modération manuelle** : Peut devenir chronophage, envisager modération automatique future
4. **Compatibilité Google Forms** : Tester l'embedding sur différents navigateurs

### Évolutions Futures (Post-MVP)
- Traduction multilingue (i18n)
- Application mobile (React Native)
- Système de recommandations d'articles
- Modération automatique par IA
- Analytics avancés avec tableaux de bord personnalisables
- API publique pour développeurs tiers

---

## ✅ Checklist de Validation par Sprint

### Sprint 1
- [x] **1.1** Tables Supabase créées et testées
- [ ] **1.2** Composants d'interactions fonctionnels
- [ ] **1.3** Intégration dans la page article
- [ ] **1.4** Hooks personnalisés et documentation

### Sprint 2
- [ ] Schémas Sanity validés
- [ ] Pages podcasts accessibles
- [ ] Google Forms intégrés
- [ ] Tests de lecture audio

### Sprint 3
- [ ] Recherche retourne des résultats pertinents
- [ ] Archives consultables par année
- [ ] PDF d'éditions générés
- [ ] Navigation mise à jour

### Sprint 4
- [ ] Authentification admin sécurisée
- [ ] Modération des commentaires opérationnelle
- [ ] CRUD tags fonctionnel
- [ ] Tests de sécurité passés

### Sprint 5
- [ ] Dashboard rédacteur affiche les bonnes stats
- [ ] Notifications reçues en temps réel
- [ ] Badges attribués automatiquement
- [ ] Tests d'intégration notifications

### Sprint 6
- [ ] Score Lighthouse > 90
- [ ] Conformité WCAG AA validée
- [ ] Couverture tests > 80%
- [ ] Site déployé en production
- [ ] Documentation complète

---

**Date de création du plan** : 10 avril 2026  
**Version** : 1.0  
**Auteur** : Équipe de développement Journal Ozenne
