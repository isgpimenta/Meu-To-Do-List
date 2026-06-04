import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AuthUser, AuthState } from '../types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        setState({
          user: user ? {
            id: user.id,
            email: user.email!,
            created_at: user.created_at!,
          } : null,
          loading: false,
          isAuthenticated: !!user,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Escutar mudanças de auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;
        setState({
          user: user ? {
            id: user.id,
            email: user.email!,
            created_at: user.created_at!,
          } : null,
          loading: false,
          isAuthenticated: !!user,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
}