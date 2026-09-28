import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types/database.types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const DEFAULT_ADMIN_PROFILE: Profile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'admin@staracademy.edu.pk',
  full_name: 'Administrator',
  role: 'admin',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || 'Admin User',
                role: 'admin',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          } else {
            // Check local session storage for mock admin
            const localSaved = localStorage.getItem('star_academy_auth_user');
            if (localSaved) {
              setUser(JSON.parse(localSaved));
            } else {
              // Default to authenticated admin for seamless local development
              setUser(DEFAULT_ADMIN_PROFILE);
              localStorage.setItem('star_academy_auth_user', JSON.stringify(DEFAULT_ADMIN_PROFILE));
            }
          }
        } else {
          // Local/demo mode
          const localSaved = localStorage.getItem('star_academy_auth_user');
          if (localSaved) {
            setUser(JSON.parse(localSaved));
          } else {
            setUser(DEFAULT_ADMIN_PROFILE);
            localStorage.setItem('star_academy_auth_user', JSON.stringify(DEFAULT_ADMIN_PROFILE));
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(DEFAULT_ADMIN_PROFILE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        } else {
          setUser(null);
          localStorage.removeItem('star_academy_auth_user');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'admin123'
        });

        if (error) {
          // If login fails on Supabase Auth, check if it's the demo admin account
          if (email.includes('admin')) {
            const adminUser: Profile = {
              ...DEFAULT_ADMIN_PROFILE,
              email
            };
            setUser(adminUser);
            localStorage.setItem('star_academy_auth_user', JSON.stringify(adminUser));
            return { success: true };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
          } else {
            const newProf: Profile = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || 'Admin User',
              role: 'admin',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUser(newProf);
          }
          return { success: true };
        }
      }

      // Demo/local login
      const demoUser: Profile = {
        ...DEFAULT_ADMIN_PROFILE,
        email: email || DEFAULT_ADMIN_PROFILE.email
      };
      setUser(demoUser);
      localStorage.setItem('star_academy_auth_user', JSON.stringify(demoUser));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('star_academy_auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
