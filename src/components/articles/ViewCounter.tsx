'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/hooks';

// ============================================
// 1. TYPES
// ============================================

interface ViewCounterProps {
  articleId: string;
  initialViewsCount?: number;
  className?: string;
}

// ============================================
// 2. COMPOSANT PRINCIPAL
// ============================================

export default function ViewCounter({ 
  articleId, 
  initialViewsCount = 0,
  className = '' 
}: ViewCounterProps) {
  // 1. ÉTATS (States & Refs)
  const { user } = useAuth();
  const [viewsCount, setViewsCount] = useState(initialViewsCount);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // ============================================
  // 3. EFFETS (useEffect)
  // ============================================

  // Enregistrer la vue de l'article
  useEffect(() => {
    const recordView = async () => {
      if (hasRecordedView) return;

      try {
        // Récupérer les informations du navigateur
        const userAgent = navigator.userAgent;
        const ipAddress = null; // L'IP sera gérée côté serveur si nécessaire

        // Insérer la vue
        const { error } = await supabase
          .from('article_views')
          .insert({
            article_id: articleId,
            user_id: user?.id || null,
            ip_address: ipAddress,
            user_agent: userAgent,
          });

        if (error) {
          console.error('Erreur lors de l\'enregistrement de la vue:', error);
          return;
        }

        setHasRecordedView(true);

        // Récupérer le nouveau nombre de vues
        const { count } = await supabase
          .from('article_views')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', articleId);

        if (count !== null) {
          setViewsCount(count);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error);
      }
    };

    // Enregistrer la vue après un délai de 2 secondes (pour éviter les vues accidentelles)
    const timer = setTimeout(() => {
      recordView();
    }, 2000);

    return () => clearTimeout(timer);
  }, [articleId, user, hasRecordedView]);

  // Écouter les changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel(`views:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'article_views',
          filter: `article_id=eq.${articleId}`,
        },
        async () => {
          // Récupérer le nouveau nombre de vues
          const { count } = await supabase
            .from('article_views')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', articleId);

          if (count !== null) {
            setViewsCount(count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId]);

  // ============================================
  // 4. VARIABLES CALCULÉES
  // ============================================

  // Formater le nombre de vues (ex: 1000 -> 1k)
  const formattedViews = viewsCount >= 1000 
    ? `${(viewsCount / 1000).toFixed(1)}k` 
    : viewsCount.toString();

  // ============================================
  // 5. RENDU (JSX)
  // ============================================

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-gray-100 text-gray-600
        ${className}
      `}
      aria-label={`${viewsCount} vue${viewsCount > 1 ? 's' : ''}`}
    >
      {/* Icône œil */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>

      {/* Compteur */}
      <span className="font-medium text-sm">
        {formattedViews}
      </span>
    </div>
  );
}
