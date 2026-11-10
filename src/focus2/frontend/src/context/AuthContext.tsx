import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, LoginData, RegisterData } from "../services/auth";

interface UserData {
  id: string;
  accountID: string;
  username: string;
  displayName?: string;
  email: string;
  avatar?: string;
  user_photo?: string;
  bio?: string;
  birthDate?: string;
  is_pro?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authApi.getCurrentUser();
        setUser(u);
        localStorage.setItem("is_logged_in", "true");
      } catch (err) {
        localStorage.removeItem("is_logged_in");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("user_id", response.user?.id || response.id);
      setUser(response.user || response);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("user_id", response.user?.id || response.id);
      setUser(response.user || response);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("is_logged_in");
    localStorage.removeItem("user_id");
    setUser(null);
  };

  const updateUser = (data: Partial<UserData>) =>
    setUser((prev) => (prev ? { ...prev, ...data } : prev));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
