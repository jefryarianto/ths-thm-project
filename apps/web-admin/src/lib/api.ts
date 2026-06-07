"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  skipAuth?: boolean;
};

function getTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export { setTokens };

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken: rt } = getTokens();
  if (!rt) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, skipAuth = false } = options;
  const { accessToken } = getTokens();

  // Build URL — support both absolute and relative API_BASE
  const origin = (window.location.origin === "null" || !window.location.origin) ? "http://localhost:3000" : window.location.origin;
  const baseUrl = API_BASE.startsWith("/") ? `${origin}${API_BASE}` : API_BASE;
  const url = new URL(`${baseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Make request
  let res = await fetch(url.toString(), {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url.toString(), {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      });
    } else {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }
  }

  // Parse response
  if (res.status === 204) return {} as T;

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.message || data.error || `Request failed with status ${res.status}`,
      data,
    );
  }

  return data as T;
}

// ── Convenience methods ──
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(endpoint, { params }),

  post: <T>(endpoint: string, body?: unknown, skipAuth?: boolean) =>
    apiRequest<T>(endpoint, { method: "POST", body, skipAuth }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body }),
};

// ── Auth API ──
export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: unknown }>(
      "/auth/login",
      { identifier, password },
      true,
    ),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken },
      true,
    ),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get<unknown>("/anggota/me"),
};
