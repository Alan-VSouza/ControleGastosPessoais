import axios, { AxiosInstance } from "axios";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserDto;
  expiresAt?: string;
}

interface UserDto {
  id: number;
  email: string;
  fullName: string;
}

class AuthService {
  private api: AxiosInstance;
  private readonly BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5148";

  constructor() {
    this.api = axios.create({
      baseURL: `${this.BASE_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao fazer login",
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post("/auth/logout");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      this.clearAuth();
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.api.get("/auth/validate");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private setUser(user: UserDto | undefined): void {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  getUser(): UserDto | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  private clearAuth(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();
