import { apiClient } from "./index";

export interface LoginData {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}
export interface UserData {
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
  isPro?: boolean;
}

export const authApi = {
  login: async (data: LoginData) => {
    const res = await apiClient.post("/api/auth/login", data);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post("/api/auth/logout");
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get("/api/auth/me");
    return res.data;
  },

  register: async (data: RegisterData) => {
    const res = await apiClient.post("/api/auth/register", data);
    return res.data;
  },

  updateUser: async (data: Partial<UserData>) => {
    const res = await apiClient.put("/api/auth/me", data);
    return res.data;
  },
};
