# 📦 Configuration Supabase - Journal du Lycée Ozenne

Ce dossier contient les migrations et la configuration de la base de données Supabase.

## 🗂️ Structure

```
supabase/
├── migrations/           # Scripts SQL de migration
│   └── 001_create_interactions_tables.sql
└── README.md            # Ce fichier
```

## 🚀 Installation et Configuration

### 1. Prérequis

- Compte Supabase créé sur [supabase.com](https://supabase.com)
- Supabase CLI installé (optionnel mais recommandé)

```bash
npm install -g supabase
```

### 2. Créer un Projet Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez les informations de connexion :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 4. Exécuter les Migrations

#### Option A : Via l'interface Supabase (Recommandé pour débuter)

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu de [`migrations/001_create_interactions_tables.sql`](migrations/001_create_interactions_tables.sql)
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter la migration

#### Option B : Via Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Lier le projet local au projet Supabase
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push
```

## 📊 Tables Créées

### `users`
Stocke les informations des utilisateurs du site.

**Colonnes :**
- `id` (UUID) - Identifiant unique
- `username` (VARCHAR) - Nom d'utilisateur unique
- `email` (VARCHAR) - Email unique
- `role` (VARCHAR) - Rôle : reader, writer, moderator, admin
- `profile_picture` (TEXT) - URL de la photo de profil
- `bio` (TEXT) - Biographie
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### `article_views`
Enregistre les vues d'articles pour les statistiques.

**Colonnes :**
- `id` (UUID) - Identifiant unique
- `article_id` (VARCHAR) - ID Sanity de l'article
- `user_id` (UUID) - ID de l'utilisateur (nullable)
- `ip_address` (INET) - Adresse IP du visiteur
- `user_agent` (TEXT) - User agent du navigateur
- `viewed_at` (TIMESTAMP) - Date de la vue

### `likes`
Gère les likes sur les articles (un utilisateur = un like par article).

**Colonnes :**
- `id` (UUID) - Identifiant unique
- `article_id` (VARCHAR) - ID Sanity de l'article
- `user_id` (UUID) - ID de l'utilisateur
- `created_at` (TIMESTAMP) - Date du like

**Contrainte :** UNIQUE(article_id, user_id)

### `comments`
Stocke les commentaires avec système de modération.

**Colonnes :**
- `id` (UUID) - Identifiant unique
- `article_id` (VARCHAR) - ID Sanity de l'article
- `user_id` (UUID) - ID de l'utilisateur
- `content` (TEXT) - Contenu du commentaire (1-2000 caractères)
- `is_moderated` (BOOLEAN) - Commentaire modéré ?
- `is_approved` (BOOLEAN) - Commentaire approuvé ?
- `moderated_by` (UUID) - ID du modérateur
- `moderated_at` (TIMESTAMP) - Date de modération
- `moderation_reason` (TEXT) - Raison de la modération
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

## 🔒 Politiques RLS (Row Level Security)

Toutes les tables ont RLS activé avec des politiques spécifiques :

### Users
- ✅ **Lecture** : Tout le monde peut voir les profils
- ✅ **Insertion** : Les utilisateurs peuvent créer leur propre profil
- ✅ **Mise à jour** : Les utilisateurs peuvent modifier leur propre profil
- ✅ **Suppression** : Seuls les admins peuvent supprimer

### Article Views
- ✅ **Lecture** : Tout le monde peut voir les statistiques
- ✅ **Insertion** : Tout le monde peut enregistrer une vue
- ❌ **Mise à jour/Suppression** : Interdit (données analytiques)

### Likes
- ✅ **Lecture** : Tout le monde peut voir les likes
- ✅ **Insertion** : Utilisateurs authentifiés uniquement
- ✅ **Suppression** : Les utilisateurs peuvent retirer leur propre like

### Comments
- ✅ **Lecture** : Commentaires approuvés visibles par tous, propres commentaires visibles, modérateurs voient tout
- ✅ **Insertion** : Utilisateurs authentifiés uniquement
- ✅ **Mise à jour** : Utilisateurs peuvent modifier leurs commentaires non modérés, modérateurs peuvent tout modifier
- ✅ **Suppression** : Utilisateurs peuvent supprimer leurs commentaires, modérateurs peuvent tout supprimer

## 🛠️ Fonctions Utilitaires

La migration crée également des fonctions SQL pratiques :

### `get_article_views_count(article_id)`
Retourne le nombre de vues d'un article.

```sql
SELECT get_article_views_count('article-slug-123');
```

### `get_article_likes_count(article_id)`
Retourne le nombre de likes d'un article.

```sql
SELECT get_article_likes_count('article-slug-123');
```

### `get_article_comments_count(article_id)`
Retourne le nombre de commentaires approuvés d'un article.

```sql
SELECT get_article_comments_count('article-slug-123');
```

### `has_user_liked_article(article_id, user_id)`
Vérifie si un utilisateur a liké un article.

```sql
SELECT has_user_liked_article('article-slug-123', 'user-uuid');
```

## 🧪 Données de Test

La migration crée 3 utilisateurs de test :

1. **Admin** : `admin@ozenne-journal.fr` (role: admin)
2. **Rédacteur** : `redacteur@ozenne-journal.fr` (role: writer)
3. **Lecteur** : `lecteur@ozenne-journal.fr` (role: reader)

⚠️ **Important** : Supprimez ces utilisateurs en production !

## 📝 Utilisation dans le Code

Les types TypeScript sont disponibles dans [`src/types/supabase.ts`](../src/types/supabase.ts).

### Exemple : Récupérer les commentaires d'un article

```typescript
import { supabase } from '@/lib/supabase/client'

const { data: comments, error } = await supabase
  .from('comments')
  .select(`
    *,
    user:users(id, username, profile_picture, role)
  `)
  .eq('article_id', articleId)
  .eq('is_approved', true)
  .order('created_at', { ascending: false })
```

### Exemple : Ajouter un like

```typescript
const { error } = await supabase
  .from('likes')
  .insert({
    article_id: articleId,
    user_id: userId
  })
```

### Exemple : Utiliser les fonctions

```typescript
const { data: viewCount } = await supabase
  .rpc('get_article_views_count', { p_article_id: articleId })
```

## 🔄 Migrations Futures

Pour ajouter de nouvelles migrations :

1. Créez un nouveau fichier : `002_nom_de_la_migration.sql`
2. Numérotez séquentiellement (002, 003, etc.)
3. Documentez les changements dans ce README
4. Exécutez la migration via l'interface Supabase ou CLI

## 🆘 Dépannage

### Erreur : "relation already exists"
La table existe déjà. Utilisez `DROP TABLE IF EXISTS` ou vérifiez les migrations précédentes.

### Erreur : "permission denied for schema public"
Vérifiez que vous avez les droits d'administration sur le projet Supabase.

### RLS bloque mes requêtes
Vérifiez que :
1. L'utilisateur est authentifié si nécessaire
2. Les politiques RLS correspondent à votre cas d'usage
3. Utilisez le service_role_key pour bypasser RLS en développement (⚠️ jamais en production côté client)

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
