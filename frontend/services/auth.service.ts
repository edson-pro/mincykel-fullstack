import { api } from "@/lib/api";
import { AxiosInstance } from "axios";

interface User {
  id: string;
  username: string;
  names: string;
  status: string;
}

class AuthService {
  private api: AxiosInstance;
  private tokenKey: string = "access_token";
  private user: User | null = null;

  constructor() {
    this.api = api;
  }

  async refresh_token() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refreshToken, please login again");

    if (!refreshToken)
      throw new Error("No refresh token found, please login again");
    return this.api
      .post("/auth/refresh-token", {
        refreshToken: refreshToken,
      })
      .then((response) => {
        this.setToken(response.data?.access_token);
        this.setRefreshToken(response.data?.refresh_token);
        this.user = response.data;
        return this.user;
      })
      .catch(async (e) => {
        if (e.response?.status === 401) {
          await this.logout();
        }
        return null;
      });
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async updateProfile(data: { name: string }): Promise<User | null> {
    const token = authService.getToken();
    const response = await this.api.put("/auth/update-profile", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.user = response.data;
    return this.user;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = authService.getToken();
      const response = await this.api.get("/auth/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.user = response.data;
      return this.user;
    } catch (error) {
      return null;
    }
  }

  async googleLogin({
    token,
    platform,
    referralCode,
  }: {
    token: string;
    platform: string;
    referralCode?: string;
  }): Promise<User | null> {
    const response = await this.api.post("/auth/google-login", {
      token,
      platform,
    });

    this.setToken(response.data?.access_token);
    this.user = response.data;
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem("refreshToken", token);
  }

  async logout() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.removeToken();
    this.user = null;
  }

  async signIn(credentials: { email: string; password: string }) {
    const response = await this.api.post("/auth/login", credentials);
    this.setToken(response.data?.access_token);
    this.setRefreshToken(response.data?.refresh_token);
    this.user = response.data;
    return this.user;
  }

  async signUp(credentials: {
    email: string;
    password: string;
    lastName: string;
    firstName: string;
    referralCode;
  }) {
    const response = await this.api.post("/auth/register", credentials);
    this.setToken(response.data?.access_token);
    this.setRefreshToken(response.data?.refresh_token);
    this.user = response.data;
    return this.user;
  }

  async forgotPassword({ email }) {
    const response = await this.api.post("/auth/forgot-password", { email });
    return response;
  }

  async resetPassword({ password, token }) {
    const response = await this.api.post("/auth/reset-password", {
      password,
      token,
    });
    return response;
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("guest_session_id");
  }
}

const authService = new AuthService();

export default authService;
