import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  userId: number | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Инициализация из localStorage при старте
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Загрузка данных пользователя при наличии токена
  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const response = await api.get('/v1/auth/me');
      setUser(response.data);
    } catch (err: any) {
      // Токен невалиден — выходим
      console.warn('Token invalid, logging out');
      logout();
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, userData?: User) => {
    // 1. Сохраняем токен в localStorage
    localStorage.setItem('token', newToken);

    // 2. Обновляем состояние
    setToken(newToken);

    // 3. Если данные пользователя переданы — сохраняем сразу
    if (userData) {
      setUser(userData);
    }

    // 4. Немедленно обновляем заголовок axios (гарантия для текущих запросов)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    console.log('✓ Auth: login successful, token saved');
  };

  const logout = () => {
    // 1. Очищаем localStorage
    localStorage.removeItem('token');

    // 2. Сбрасываем состояние
    setToken(null);
    setUser(null);

    // 3. Удаляем заголовок из axios
    delete api.defaults.headers.common['Authorization'];

    // 4. Перенаправляем на логин
    if (navigate) {
      navigate('/login');
    }

    console.log('✓ Auth: logout complete');
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
        isLoading,
        refreshUser
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
