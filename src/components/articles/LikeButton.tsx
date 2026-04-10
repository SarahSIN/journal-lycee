'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/hooks';

// ============================================
// 1. TYPES
// ============================================

interface LikeButtonProps {
  articleId: string;
  initialLikesCount?: number;
  className?: string;
}

// ============================================
// 2. COMPOSANT PRINCIPAL
// ============================================

export default function LikeButton({ 
  articleId, 
  initialLikesCount = 0,
  className = '' 
}: LikeButtonProps) {
  // 1. ÉTATS (States & Refs)
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // ============================================
  // 3. EFFETS (useEffect)
  // ============================================

  // Vérifier si l'utilisateur a déjà liké l'article
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors de la vérification du like:', error);
          return;
        }

        setIsLiked(!!data);
      } catch (error) {
        console.error('Erreur lors de la vérification du like:', error);
      }
    };

    checkIfLiked();
  }, [user, articleId]);

  // Écouter les changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel(`likes:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${articleId}`,
        },
        async () => {
          // Récupérer le nouveau nombre de likes
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', articleId);

          if (count !== null) {
            setLikesCount(count);
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

  const handleLike = async () => {
    if (!user) {
      alert('Vous devez être connecté pour liker un article');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      if (isLiked) {
        // Retirer le like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('likes')
          .insert({
            article_id: articleId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // ============================================
  // 5. RENDU (JSX)
  // ============================================

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || !user}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200
        ${isLiked 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${className}
      `}
      aria-label={isLiked ? 'Retirer le like' : 'Liker l\'article'}
      title={!user ? 'Connectez-vous pour liker' : undefined}
    >
      {/* Icône cœur */}
      <svg
        className={`w-5 h-5 transition-all duration-200 ${
          isAnimating ? 'animate-bounce' : ''
        }`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      {/* Compteur */}
      <span className="font-medium text-sm">
        {likesCount}
      </span>
    </button>
  );
}
