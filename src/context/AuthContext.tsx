
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a user in localStorage
    const storedUser = localStorage.getItem('stepcoin-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication for now - will be replaced with Supabase
      if (email && password) {
        const mockUser = {
          id: '123456',
          email,
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('stepcoin-user', JSON.stringify(mockUser));
        toast.success('Logged in successfully!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock registration for now - will be replaced with Supabase
      if (email && password) {
        const mockUser = {
          id: '123456',
          email,
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('stepcoin-user', JSON.stringify(mockUser));
        toast.success('Account created successfully!');
      } else {
        throw new Error('Invalid information');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Mock sign out for now - will be replaced with Supabase
      setUser(null);
      localStorage.removeItem('stepcoin-user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
