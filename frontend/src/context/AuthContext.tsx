import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Извлечение userId из токена или API
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Попытка получить данные пользователя через API
        const response = await api.get('/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err: any) {
        // Если API недоступно, пробуем декодировать JWT
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.sub || payload.user_id,
            email: payload.email || 'user@example.com',
            is_active: true
          });
        } catch {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userId: user?.id || null,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
