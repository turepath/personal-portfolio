import axios from "axios";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface UserData {
  id: string;
  username: string;
  accountID: string;
  name: string;
  avatar: string;
  isPro: boolean;
  points: number;
  bio?: string;
  birthDate?: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserData;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post("/api/auth/login", data);
    return response.data;
  },

  register: async (
    data: RegisterData,
  ): Promise<{ message: string; user: UserData }> => {
    const response = await axios.post("/api/auth/register", data);
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<UserData> => {
    const response = await axios.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateUser: async (
    token: string,
    data: Partial<UserData>,
  ): Promise<UserData> => {
    const response = await axios.put("/api/auth/me", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

// 添加getToken函数，用于从localStorage获取token
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
