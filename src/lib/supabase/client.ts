// 1. IMPORTS
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase'; // Nous allons créer ce type ensuite

// 2. CONFIGURATION
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 3. CLIENT SUPABASE
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 4. FONCTIONS UTILITAIRES
export async function addLikeToArticle(articleId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .insert({ article_id: articleId, user_id: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error);
    return null;
  }
}

export async function addCommentToArticle(
  articleId: string, 
  userId: string, 
  content: string
) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ 
        article_id: articleId, 
        user_id: userId, 
        content 
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return null;
  }
}

export async function fetchArticleInteractions(articleId: string) {
  try {
    const likesQuery = await supabase
      .from('likes')
      .select('*')
      .eq('article_id', articleId);

    const commentsQuery = await supabase
      .from('comments')
      .select('*, users(username, profile_picture)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    return {
      likes: likesQuery.data?.length || 0,
      comments: commentsQuery.data || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des interactions:', error);
    return { likes: 0, comments: [] };
  }
}