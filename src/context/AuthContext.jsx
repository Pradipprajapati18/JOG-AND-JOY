import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("Session expired or invalid, clearing stale credentials:", sessionError.message);
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch {}
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Error initializing auth:', error);
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {}
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && !session) {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch {}
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // Fetch the custom user profile from public.users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUser(data);
        return data;
      } else {
        // For OAuth users (e.g. Google), ensure profile exists in public.users
        let authUser = null;
        try {
          const { data: userData } = await supabase.auth.getUser();
          authUser = userData?.user;
        } catch (_) {}

        const name = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Customer';
        const email = authUser?.email || '';

        try {
          const { data: created } = await supabase
            .from('users')
            .upsert({
              id: userId,
              name,
              email,
              role: 'CUSTOMER'
            }, { onConflict: 'id' })
            .select()
            .single();

          if (created) {
            setUser(created);
            return created;
          }
        } catch (insertErr) {
          console.warn('Could not auto-create users row for OAuth user:', insertErr);
        }

        const fallback = { id: userId, name, email, role: 'CUSTOMER' };
        setUser(fallback);
        return fallback;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        console.error('Google OAuth error:', error.message);
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Google OAuth exception:', err);
      return { success: false, message: err.message || 'Failed to initiate Google sign in.' };
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
      }
      
      let profile = null;
      if (data?.user?.id) {
        profile = await fetchUserProfile(data.user.id);
      }

      return { success: true, user: profile || data?.user };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const register = async (name, email, password, role = 'CUSTOMER', phone = '', address = '', addresses = null) => {
    try {
      console.log('Starting registration for:', email);
      // Security: Strictly enforce 'CUSTOMER' role on self-registration to prevent privilege escalation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'CUSTOMER' }
        }
      });

      console.log('Supabase signup response:', { data, error });

      if (error) {
        console.error('Registration error from Supabase:', error.message);
        return { success: false, message: error.message };
      }

      if (data?.user) {
        console.log('User created successfully:', data.user.id);
        if (phone || address || addresses) {
           console.log('Updating profile with extra fields...');
           const { error: updateErr } = await supabase.from('users').update({ phone, address, addresses }).eq('id', data.user.id);
           if (updateErr) console.error('Failed to update profile fields:', updateErr);
        }
        
        // Add to customers CRM table so admins can see them as prospects
        const { error: custErr } = await supabase.from('customers').insert([{
          id: data.user.id,
          name: name || '',
          email: email,
          phone: phone || '',
          address: address || '',
          totalOrders: 0,
          totalSpent: 0,
          isGuest: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
        if (custErr) console.error('Failed to add to CRM customers:', custErr);

        let profile = null;
        try {
          profile = await fetchUserProfile(data.user.id);
        } catch (fErr) {
          console.warn('Could not immediately fetch profile after signup:', fErr);
        }

        return { success: true, user: profile || data.user };
      }
      
      console.warn('Signup returned no error but no user either?');
      return { success: false };
    } catch (err) {
      console.error('Registration exception:', err);
      return { success: false, message: 'Unexpected error' };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    setUser(null);
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Password reset email sent.' };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred.' };
    }
  };

  const updateUser = async (updates) => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error || !data) {
        console.error('Update user error:', error?.message);
        return false;
      }

      setUser(data);
      return true;
    } catch (err) {
       console.error('Update user exception:', err);
       return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
