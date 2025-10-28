import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, profileService } from '../lib/_supabase';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [authError, setAuthError] = useState<string | null>(null);

  const createUserFromAuth = useCallback(async (authUser: any): Promise<User> => {
    const basicUser: User = {
      id: authUser.id,
      email: authUser.email || '',
    };

    // Try to get profile data with timeout to prevent hanging
    try {
      const profilePromise = profileService.getUserProfile(authUser.id);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      const profile = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (profile) {
        return {
          ...basicUser,
          full_name: profile.full_name || undefined,
          avatar_url: profile.avatar_url || undefined,
        };
      }
    } catch (error) {
      console.warn('Could not fetch user profile:', error);
      // Return basic user data if profile fetch fails
    }

    return basicUser;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setAuthError(null);
        
        // Add timeout to prevent hanging on getSession
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error.message);
          return;
        }

        if (session?.user && mounted) {
          const userData = await createUserFromAuth(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication timeout - please refresh the page');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        setAuthError(null);

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          profileService.clearCache();
        } else if (session?.user) {
          // Don't set loading true here as it's just a state change
          const userData = await createUserFromAuth(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication error');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [createUserFromAuth]);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear cache and user state
      profileService.clearCache();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthError(errorMessage);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: { full_name?: string; avatar_url?: string }) => {
    if (!user) return;

    try {
      setAuthError(null);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state and cache
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      profileService.clearCache(); // Clear cache to force refresh

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthError(errorMessage);
      throw error;
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}