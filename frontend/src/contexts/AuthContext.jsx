import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.token) {
        localStorage.setItem('token', response.token);

        // If the login response includes user data, use it directly
        // Otherwise we might need to fetch it, but typically login returns it
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user)); // Optional backup
        } else {
          // Fallback: fetch user details if not in login response
          const userResponse = await authApi.getCurrentUser();
          setUser(userResponse.data);
        }

        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true };
      } else {
        return { success: false, message: 'No token received' };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(
    async (username, email, phoneNumber, password) => {
      try {
        await authApi.register({
          username,
          email,
          phoneNumber,
          password,
        });
        toast.success('Registration successful! Please login.');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
        return { success: false, message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      toast.success('Logged out');
    }
  }, [queryClient]);

  // Update user state directly (for syncing with React Query mutations)
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  const updateUserInfo = useCallback(async (updatedData) => {
    try {
      const response = await authApi.updateProfile(updatedData);
      if (response.success) {
        setUser(response.user); // Update local state with new data
        toast.success('Profile updated successfully');
        return { success: true };
      }
      return { success: false, message: 'Update failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmNewPassword) => {
      try {
        await authApi.changePassword({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_new_password: confirmNewPassword,
        });
        toast.success('Password changed successfully');
        return { success: true };
      } catch (error) {
        const msg =
          error.response?.data?.message || 'Failed to change password';
        toast.error(msg);
        return { success: false, message: msg };
      }
    },
    []
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      updateUserInfo,
      changePassword,
    }),
    [
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      updateUserInfo,
      changePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
