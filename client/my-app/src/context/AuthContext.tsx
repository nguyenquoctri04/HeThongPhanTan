import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, getUserById } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra user trong localStorage khi component mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Refresh user data from server
        refreshUserData(parsedUser.id);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUserData = async (userId: number) => {
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await loginApi({ username, password });
    if (response.success && response.data) {
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } else {
      throw new Error(response.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (user) {
      await refreshUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
