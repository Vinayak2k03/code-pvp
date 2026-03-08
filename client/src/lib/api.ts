const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  // ─── Auth ───────────────────────────────────────────────────

  async signup(username: string, email: string, password: string) {
    return this.request<{
      status: string;
      data: { user: any; token: string };
    }>("/api/auth/signup", {
      method: "POST",
      body: { username, email, password },
    });
  }

  async login(email: string, password: string) {
    return this.request<{
      status: string;
      data: { user: any; token: string };
    }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }

  async getMe() {
    return this.request<{ status: string; data: any }>("/api/auth/me");
  }

  // ─── Users ──────────────────────────────────────────────────

  async getUserStats(userId: string) {
    return this.request<{ status: string; data: any }>(
      `/api/users/${userId}/stats`
    );
  }

  // ─── Problems ───────────────────────────────────────────────

  async getProblems(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    tag?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.search) searchParams.set("search", params.search);

    return this.request<{ status: string; data: any }>(
      `/api/problems?${searchParams.toString()}`
    );
  }

  async getProblem(idOrSlug: string) {
    return this.request<{ status: string; data: any }>(
      `/api/problems/${idOrSlug}`
    );
  }

  // ─── Matches ────────────────────────────────────────────────

  async getMatches(page = 1, limit = 20) {
    return this.request<{ status: string; data: any }>(
      `/api/matches?page=${page}&limit=${limit}`
    );
  }

  async getMatch(matchId: string) {
    return this.request<{ status: string; data: any }>(
      `/api/matches/${matchId}`
    );
  }

  async getLiveMatches() {
    return this.request<{ status: string; data: any }>("/api/matches/live");
  }

  // ─── Leaderboard ────────────────────────────────────────────

  async getLeaderboard(page = 1, limit = 50) {
    return this.request<{ status: string; data: any }>(
      `/api/leaderboard?page=${page}&limit=${limit}`
    );
  }

  // ─── Submissions ────────────────────────────────────────────

  async getSubmissions(matchId: string) {
    return this.request<{ status: string; data: any }>(
      `/api/submissions/${matchId}`
    );
  }
}

export const api = new ApiClient(API_URL);
