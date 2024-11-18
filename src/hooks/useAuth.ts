import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useStore((state) => state.setUser);

  const handleAuthError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    if (message.includes('network')) {
      setError('Network connection error. Please check your internet connection and try again.');
    } else if (message.includes('invalid-credentials')) {
      setError('Invalid email or password. Please try again.');
    } else if (message.includes('not-found')) {
      setError('No account found with this email address.');
    } else if (message.includes('too-many-requests')) {
      setError('Too many attempts. Please try again later.');
    } else {
      setError(message);
    }
    throw err;
  };

  const login = useMemoizedCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.user) {
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;
        setUser(userData);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const loginWithGoogle = useMemoizedCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useMemoizedCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email,
            name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            ki_points: 1000
          }]);

        if (profileError) throw profileError;
        setUser(data.user);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useMemoizedCallback(async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      handleAuthError(err);
    }
  }, [setUser]);

  const resetPassword = useMemoizedCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    loading,
    error
  };
}