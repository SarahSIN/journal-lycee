'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/hooks';

// ============================================
// 1. TYPES
// ============================================

interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_moderated: boolean;
  is_approved: boolean;
  updated_at: string;
  user?: {
    username: string;
    profile_picture?: string;
  };
}

interface CommentSectionProps {
  articleId: string;
  className?: string;
}

// ============================================
// 2. COMPOSANT PRINCIPAL
// ============================================

export default function CommentSection({ 
  articleId,
  className = '' 
}: CommentSectionProps) {
  // 1. ÉTATS (States & Refs)
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  // ============================================
  // 3. EFFETS (useEffect)
  // ============================================

  // Charger les commentaires approuvés
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select('*')
          .eq('article_id', articleId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Récupérer les infos utilisateurs séparément
        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(c => c.user_id))];
          const { data: usersData } = await supabase
            .from('users')
            .select('id, username, profile_picture')
            .in('id', userIds);

          const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

          const commentsWithUsers = commentsData.map(comment => ({
            ...comment,
            user: usersMap.get(comment.user_id),
          }));

          setComments(commentsWithUsers as Comment[]);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId]);

  // Écouter les nouveaux commentaires en temps réel
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`,
        },
        async (payload) => {
          // Vérifier si le commentaire est approuvé
          if (payload.new.is_approved) {
            // Récupérer les infos utilisateur
            const { data: userData } = await supabase
              .from('users')
              .select('username, profile_picture')
              .eq('id', payload.new.user_id)
              .single();

            const newCommentData = {
              ...payload.new,
              user: userData,
            } as Comment;

            setComments((prev) => [newCommentData, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`,
        },
        async (payload) => {
          // Si un commentaire est approuvé, l'ajouter à la liste
          if (payload.new.is_approved && !payload.old.is_approved) {
            const { data: userData } = await supabase
              .from('users')
              .select('username, profile_picture')
              .eq('id', payload.new.user_id)
              .single();

            const updatedComment = {
              ...payload.new,
              user: userData,
            } as Comment;

            setComments((prev) => [updatedComment, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId]);

  // ============================================
  // 4. HANDLERS
  // ============================================

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    if (newComment.length > 1000) {
      alert('Le commentaire ne peut pas dépasser 1000 caractères');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: newComment.trim(),
          is_moderated: false,
          is_approved: false,
        });

      if (error) throw error;

      // Réinitialiser le formulaire
      setNewComment('');
      setShowPendingMessage(true);

      // Masquer le message après 5 secondes
      setTimeout(() => {
        setShowPendingMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // 5. FONCTIONS UTILITAIRES
  // ============================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ============================================
  // 6. RENDU (JSX)
  // ============================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Commentaires ({comments.length})
        </h2>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <div className="bg-gray-50 rounded-lg p-4">
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre avis sur cet article..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {newComment.length}/1000 caractères
              </span>
              
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi...' : 'Publier'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600 text-center py-4">
            Vous devez être connecté pour commenter
          </p>
        )}

        {/* Message de confirmation */}
        {showPendingMessage && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ✓ Votre commentaire a été envoyé et est en attente de modération.
            </p>
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des commentaires...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Aucun commentaire pour le moment. Soyez le premier à commenter !
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* En-tête du commentaire */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user?.profile_picture ? (
                    <img
                      src={comment.user.profile_picture}
                      alt={comment.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {comment.user?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {comment.user?.username || 'Utilisateur inconnu'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
