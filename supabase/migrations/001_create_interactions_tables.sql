-- ============================================================================
-- Migration 001: Tables d'interactions pour le Journal du Lycée Ozenne
-- ============================================================================
-- Description: Création des tables pour gérer les vues, likes, commentaires
--              et utilisateurs avec politiques RLS (Row Level Security)
-- Date: 2026-04-10
-- ============================================================================

-- 1. EXTENSION UUID (si pas déjà activée)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE USERS
-- ============================================================================
-- Stocke les informations des utilisateurs du site
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'moderator', 'admin')),
    profile_picture TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches par email et username
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. TABLE ARTICLE_VIEWS
-- ============================================================================
-- Enregistre les vues d'articles (avec déduplication par IP/user)
CREATE TABLE IF NOT EXISTS public.article_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id VARCHAR(255) NOT NULL, -- ID Sanity de l'article
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les comptages et requêtes
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON public.article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_ip_article ON public.article_views(ip_address, article_id);

-- 4. TABLE LIKES
-- ============================================================================
-- Gère les likes sur les articles (un utilisateur = un like par article)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id) -- Contrainte: un seul like par user/article
);

-- Index pour optimiser les comptages et vérifications
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON public.likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- 5. TABLE COMMENTS
-- ============================================================================
-- Stocke les commentaires avec système de modération
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 2000),
    is_moderated BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes de modération et affichage
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON public.comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_is_moderated ON public.comments(is_moderated);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLITIQUES USERS
-- ----------------------------------------------------------------------------

-- Lecture: Tout le monde peut voir les profils publics
CREATE POLICY "Users are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

-- Insertion: Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Mise à jour: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Suppression: Seuls les admins peuvent supprimer des utilisateurs
CREATE POLICY "Only admins can delete users"
    ON public.users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- POLITIQUES ARTICLE_VIEWS
-- ----------------------------------------------------------------------------

-- Lecture: Tout le monde peut voir les statistiques de vues
CREATE POLICY "Article views are viewable by everyone"
    ON public.article_views FOR SELECT
    USING (true);

-- Insertion: Tout le monde peut enregistrer une vue
CREATE POLICY "Anyone can insert article views"
    ON public.article_views FOR INSERT
    WITH CHECK (true);

-- Pas de mise à jour ni suppression pour les vues (données analytiques)

-- ----------------------------------------------------------------------------
-- POLITIQUES LIKES
-- ----------------------------------------------------------------------------

-- Lecture: Tout le monde peut voir les likes
CREATE POLICY "Likes are viewable by everyone"
    ON public.likes FOR SELECT
    USING (true);

-- Insertion: Les utilisateurs authentifiés peuvent liker
CREATE POLICY "Authenticated users can insert likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Suppression: Les utilisateurs peuvent retirer leur propre like
CREATE POLICY "Users can delete their own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- POLITIQUES COMMENTS
-- ----------------------------------------------------------------------------

-- Lecture: Tout le monde peut voir les commentaires approuvés
-- Les utilisateurs voient leurs propres commentaires (même non approuvés)
-- Les modérateurs/admins voient tous les commentaires
CREATE POLICY "Comments are viewable based on role"
    ON public.comments FOR SELECT
    USING (
        is_approved = true
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- Insertion: Les utilisateurs authentifiés peuvent commenter
CREATE POLICY "Authenticated users can insert comments"
    ON public.comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND is_moderated = false
        AND is_approved = false
    );

-- Mise à jour: Les utilisateurs peuvent modifier leurs propres commentaires non modérés
-- Les modérateurs/admins peuvent modérer tous les commentaires
CREATE POLICY "Users can update their own comments or moderators can moderate"
    ON public.comments FOR UPDATE
    USING (
        (auth.uid() = user_id AND is_moderated = false)
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    )
    WITH CHECK (
        (auth.uid() = user_id AND is_moderated = false)
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- Suppression: Les utilisateurs peuvent supprimer leurs propres commentaires
-- Les modérateurs/admins peuvent supprimer n'importe quel commentaire
CREATE POLICY "Users can delete their own comments or moderators can delete any"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour compter les vues d'un article
CREATE OR REPLACE FUNCTION get_article_views_count(p_article_id VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.article_views
        WHERE article_id = p_article_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour compter les likes d'un article
CREATE OR REPLACE FUNCTION get_article_likes_count(p_article_id VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.likes
        WHERE article_id = p_article_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour compter les commentaires approuvés d'un article
CREATE OR REPLACE FUNCTION get_article_comments_count(p_article_id VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.comments
        WHERE article_id = p_article_id AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour vérifier si un utilisateur a liké un article
CREATE OR REPLACE FUNCTION has_user_liked_article(p_article_id VARCHAR, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.likes
        WHERE article_id = p_article_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- DONNÉES DE TEST (OPTIONNEL - À SUPPRIMER EN PRODUCTION)
-- ============================================================================

-- Créer un utilisateur admin de test
INSERT INTO public.users (id, username, email, role, bio)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin_test',
    'admin@ozenne-journal.fr',
    'admin',
    'Administrateur de test'
) ON CONFLICT (email) DO NOTHING;

-- Créer un utilisateur rédacteur de test
INSERT INTO public.users (id, username, email, role, bio)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'redacteur_test',
    'redacteur@ozenne-journal.fr',
    'writer',
    'Rédacteur de test'
) ON CONFLICT (email) DO NOTHING;

-- Créer un utilisateur lecteur de test
INSERT INTO public.users (id, username, email, role, bio)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'lecteur_test',
    'lecteur@ozenne-journal.fr',
    'reader',
    'Lecteur de test'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 terminée avec succès!';
    RAISE NOTICE 'Tables créées: users, article_views, likes, comments';
    RAISE NOTICE 'Politiques RLS activées sur toutes les tables';
    RAISE NOTICE 'Fonctions utilitaires créées';
END $$;
