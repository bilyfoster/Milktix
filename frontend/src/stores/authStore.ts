import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../utils/api';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }
        
        try {
          set({ isLoading: true });
          const response = await authApi.me();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          localStorage.removeItem('token');
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);