import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  isSupabaseConfigured,
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signOut as supabaseSignOut,
  getSession,
} from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobhub_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (explicitToken) => {
    try {
      const headers = explicitToken ? { Authorization: `Bearer ${explicitToken}` } : {};
      const res = await api.get('/auth/me', { headers });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Session verification or user fetch notice:', err);
      // Only clear tokens if this wasn't an offline/network error
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let authListener = null;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const session = await getSession();
          if (session?.access_token) {
            localStorage.setItem('jobhub_token', session.access_token);
            setToken(session.access_token);
            await fetchCurrentUser(session.access_token);
          } else if (token) {
            await fetchCurrentUser(token);
          } else {
            setLoading(false);
          }
        } catch (e) {
          console.warn('Error reading Supabase session:', e);
          if (token) {
            await fetchCurrentUser(token);
          } else {
            setLoading(false);
          }
        }

        // Listen for Supabase session changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
              localStorage.setItem('jobhub_token', session.access_token);
              setToken(session.access_token);
              await fetchCurrentUser(session.access_token);
            }
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('jobhub_token');
            localStorage.removeItem('jobhub_mock_user');
            setToken(null);
            setUser(null);
            setLoading(false);
          }
        });
        authListener = data?.subscription;
      } else {
        // Local token fallback
        if (token) {
          fetchCurrentUser(token);
        } else {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { session, user: sbUser } = await signInWithEmail(email, password);
        if (session?.access_token) {
          localStorage.setItem('jobhub_token', session.access_token);
          setToken(session.access_token);
          const currentUser = await fetchCurrentUser(session.access_token);
          return {
            access_token: session.access_token,
            user: currentUser || sbUser,
          };
        }
      } catch (err) {
        // If unconfirmed email, propagate distinct error message
        if (err.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Your email address has not been verified yet. Please check your inbox or resend the verification email.');
        }
        throw err;
      }
    }

    // Backend / Local login fallback
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser(res.data.access_token);
    return res.data;
  };

  const register = async (formData) => {
    if (isSupabaseConfigured) {
      const result = await signUpWithEmail(formData.email, formData.password, {
        full_name: formData.full_name,
        role: formData.role,
        company_name: formData.company_name,
      });

      if (result.requiresEmailVerification) {
        // Email confirmation is required by Supabase
        return {
          requiresVerification: true,
          email: formData.email,
          role: formData.role,
          user: result.user,
        };
      }

      // If email confirmation is disabled or immediate session returned
      if (result.session?.access_token) {
        localStorage.setItem('jobhub_token', result.session.access_token);
        setToken(result.session.access_token);
        const currentUser = await fetchCurrentUser(result.session.access_token);
        return {
          requiresVerification: false,
          access_token: result.session.access_token,
          user: currentUser || result.user,
        };
      }
    }

    // Backend / Local registration fallback
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser(res.data.access_token);
    return {
      requiresVerification: false,
      ...res.data,
    };
  };

  const demoLogin = async (role) => {
    const res = await api.post(`/auth/demo-login/${role}`);
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser(res.data.access_token);
    return res.data;
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabaseSignOut();
    }
    localStorage.removeItem('jobhub_token');
    localStorage.removeItem('jobhub_mock_user');
    setToken(null);
    setUser(null);
  };

  // Immediate synchronous profile completion updater (prevents navigation race conditions or re-login)
  const markProfileCompleted = (profileData = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = {
        ...prev,
        profile_completed: true,
        profile: {
          ...(prev.profile || {}),
          ...profileData,
          profile_completed: true,
        },
      };

      try {
        const mockUserRaw = localStorage.getItem('jobhub_mock_user');
        if (mockUserRaw) {
          const parsed = JSON.parse(mockUserRaw);
          parsed.profile_completed = true;
          if (parsed.profile) {
            parsed.profile.profile_completed = true;
            Object.assign(parsed.profile, profileData);
          }
          localStorage.setItem('jobhub_mock_user', JSON.stringify(parsed));
        }
      } catch (e) {
        // silent ignore
      }

      return updatedUser;
    });
  };

  const updateUserProfile = (profileData = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          ...profileData,
        },
      };
    });
  };

  const isProfileComplete = !user || user.role !== 'JOB_SEEKER'
    ? true
    : Boolean(user.profile?.profile_completed || user.profile_completed);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isProfileComplete,
        login,
        register,
        demoLogin,
        logout,
        markProfileCompleted,
        updateUserProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
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
