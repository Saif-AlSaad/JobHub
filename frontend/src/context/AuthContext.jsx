import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobhub_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Session expired or invalid:', err);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser();
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser();
    return res.data;
  };

  const demoLogin = async (role) => {
    const res = await api.post(`/auth/demo-login/${role}`);
    localStorage.setItem('jobhub_token', res.data.access_token);
    setToken(res.data.access_token);
    await fetchCurrentUser();
    return res.data;
  };

  const logout = () => {
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
