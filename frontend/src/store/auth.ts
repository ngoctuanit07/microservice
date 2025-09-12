import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { http } from '@api/http'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

type AuthState = {
  token?: string;
  user?: User;
  loading: boolean;
  error?: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem('token') ?? undefined,
      user: undefined,
      loading: false,
      error: undefined,
      isAuthenticated: !!localStorage.getItem('token'),
      
      async login(email, password) {
        set({ loading: true, error: undefined });
        try {
          const { data } = await http.post('/auth/login', { email, password });
          const token = data.access_token;
          
          // Parse user data from token
          const decoded = jwtDecode<JwtPayload>(token);
          const user: User = {
            id: parseInt(decoded.sub),
            email: decoded.email,
            role: decoded.role
          };
          
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true, loading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: message, loading: false, isAuthenticated: false });
          throw new Error(message);
        }
      },
      
      logout() {
        localStorage.removeItem('token');
        set({ token: undefined, user: undefined, isAuthenticated: false });
        window.location.href = '/login';
      },
      
      async refreshToken() {
        const { token } = get();
        if (!token) return false;
        
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          // Check if token is expired or about to expire (within 5 minutes)
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp - currentTime < 300) {
            // Token is about to expire, refresh it
            const { data } = await http.post('/auth/refresh');
            localStorage.setItem('token', data.access_token);
            set({ token: data.access_token });
          }
          return true;
        } catch (error) {
          // Token is invalid, log the user out
          get().logout();
          return false;
        }
      },
      
      clearError() {
        set({ error: undefined });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
