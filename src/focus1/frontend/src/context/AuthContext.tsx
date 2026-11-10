import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, UserData, LoginData, RegisterData } from "../services/api/auth";

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 从localStorage获取token
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  // 在组件挂载时检查用户是否已登录
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          // 调用后端API获取当前用户信息
          const userData = await authApi.getCurrentUser(token);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          // 清除无效的token
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  // 登录函数，调用后端API
  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      // 调用后端登录API
      const response = await authApi.login(data);
      const { access_token, user: userData } = response;
      // 存储token和用户ID到localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", userData.id);
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数，调用后端API
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // 调用后端注册API
      const response = await authApi.register(data);
      // 注册成功后自动登录
      const loginResponse = await authApi.login(data);
      const { access_token, user: userData } = loginResponse;
      // 存储token和用户ID到localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", userData.id);
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 退出函数，清除token和用户信息
  const logout = () => {
    // 清除localStorage中的token和用户ID
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setToken(null);
    setUser(null);
  };

  // 更新用户信息函数
  const updateUser = (userData: UserData) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
