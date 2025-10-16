import api from "./api";

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export const authService = {
  async register(data: RegisterPayload) {
    // POST /api/auth/register
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },

  async login(data: LoginPayload) {
    // POST /api/auth/login
    const res = await api.post<AuthResponse>("/api/auth/login", data);
    return res.data;
  },

  async getProfile() {
    // GET /api/auth/profile (requires Authorization)
    const res = await api.get<UserProfile>("/api/auth/profile");
    return res.data;
  },
};
