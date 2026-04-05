// 1. IMPORTS
import { useState, useEffect } from 'react';
import { supabase } from './client';
import { User } from '@supabase/supabase-js';

// 2. HOOKS
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Nettoyer l'abonnement
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Méthodes d'authentification
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: 'student' // Rôle par défaut
        }
      }
    });
    setLoading(false);
    return { error, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut 
  };
}

// 3. FONCTIONS UTILITAIRES
export async function updateUserProfile(
  userId: string, 
  updates: { username?: string, profile_picture?: string }
) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return null;
  }
}