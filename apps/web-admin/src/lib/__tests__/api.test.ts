import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, apiRequest, api, authApi, clearTokens, setTokens } from "../api";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  const mockOrigin = "http://localhost:3000";
  let _href = "";
  const mockLocation = {
    get href() { return _href; },
    set href(v: string) { _href = v; },
    get origin() { return mockOrigin; },
    protocol: "http:",
    host: "localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  };
  Object.defineProperty(window, "location", { value: mockLocation, writable: true });
});

function mockFetchResponse(data: unknown, status = 200, ok = true) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    statusText: status === 204 ? "No Content" : "OK",
    type: "basic" as ResponseType,
    url: "",
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
  } as unknown as Response;
}

describe("ApiError", () => {
  it("creates error with status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
  });

  it("creates error with body", () => {
    const body = { message: "Validation failed", errors: [] };
    const err = new ApiError(400, "Bad Request", body);
    expect(err.body).toEqual(body);
  });
});

describe("apiRequest", () => {
  it("makes a GET request and returns parsed JSON", async () => {
    const mockData = { id: 1, nama: "Test" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse(mockData));
    const result = await apiRequest<typeof mockData>("/test");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/test"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("encodes query params", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    await apiRequest("/test", { params: { page: 1, limit: 10 } });
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("limit=10");
  });

  it("skips undefined params", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    await apiRequest("/test", { params: { page: 1, limit: undefined } });
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).not.toContain("limit");
  });

  it("sends JSON body for POST requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    const body = { name: "Test" };
    await apiRequest("/test", { method: "POST", body });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      }),
    );
  });

  it("sends FormData without Content-Type header", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    const formData = new FormData();
    formData.append("file", "test");
    await apiRequest("/upload", { method: "POST", body: formData });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST", headers: {} }),
    );
  });

  it("includes auth header when token exists", async () => {
    localStorage.setItem("accessToken", "test-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    await apiRequest("/test");
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      }),
    );
  });

  it("skips auth header when skipAuth is true", async () => {
    localStorage.setItem("accessToken", "test-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    await apiRequest("/test", { skipAuth: true });
    const callHeaders = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBeUndefined();
  });

  it("throws ApiError on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockFetchResponse({ message: "Bad request" }, 400, false),
    );
    const err = await apiRequest("/test").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe("Bad request");
  });

  it("throws ApiError with fallback message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}, 500, false));
    await expect(apiRequest("/test")).rejects.toThrow("Request failed with status 500");
  });

  it("returns empty object for 204 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockFetchResponse(undefined, 204, true),
    );
    const result = await apiRequest("/test");
    expect(result).toEqual({});
  });

  it("auto-refreshes token on 401 and retries", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "valid-refresh");

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockFetchResponse({ message: "Unauthorized" }, 401, false))
      .mockResolvedValueOnce(mockFetchResponse({ accessToken: "new-token", refreshToken: "new-refresh" }))
      .mockResolvedValueOnce(mockFetchResponse({ data: "success" }));

    const result = await apiRequest("/test");
    expect(result).toEqual({ data: "success" });
    expect(localStorage.getItem("accessToken")).toBe("new-token");
  });

  it("redirects to login when refresh fails on 401", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "invalid-refresh");

    Object.defineProperty(window, "location", {
      value: { href: "http://localhost", origin: "http://localhost", protocol: "http:", host: "localhost:3000", pathname: "/", search: "", hash: "", assign: vi.fn(), replace: vi.fn(), reload: vi.fn() },
      writable: true,
    });

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockFetchResponse({ message: "Unauthorized" }, 401, false))
      .mockResolvedValueOnce(mockFetchResponse({}, 401, false));

    await expect(apiRequest("/test")).rejects.toThrow("Session expired");
    expect(window.location.href).toBe("/login");
  });
});

describe("api convenience methods", () => {
  it("api.get calls with GET", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({ data: "ok" }));
    const result = await api.get("/test", { limit: 10 });
    expect(result).toEqual({ data: "ok" });
  });

  it("api.post calls with POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({ id: 1 }));
    const result = await api.post("/test", { name: "test" });
    expect(result).toEqual({ id: 1 });
  });

  it("api.post with skipAuth", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({ token: "abc" }));
    const result = await api.post("/login", { user: "admin", pass: "123" }, true);
    expect(result).toEqual({ token: "abc" });
  });

  it("api.put calls with PUT", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({ updated: true }));
    const result = await api.put("/test/1", { name: "updated" });
    expect(result).toEqual({ updated: true });
  });

  it("api.delete calls with DELETE", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({ deleted: true }));
    const result = await api.delete("/test/1");
    expect(result).toEqual({ deleted: true });
  });
});

describe("authApi", () => {
  it("login sends correct payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockFetchResponse({ accessToken: "a", refreshToken: "b", user: { id: 1 } }),
    );
    await authApi.login("admin", "password123");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ identifier: "admin", password: "password123" }),
      }),
    );
  });

  it("refresh sends refresh token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockFetchResponse({ accessToken: "new", refreshToken: "new-r" }),
    );
    await authApi.refresh("my-refresh-token");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: "my-refresh-token" }),
      }),
    );
  });

  it("logout calls POST /auth/logout", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockFetchResponse({}));
    await authApi.logout();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("getMe calls GET /anggota/me", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockFetchResponse({ id: 1, username: "admin" }),
    );
    await authApi.getMe();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/anggota/me"),
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("token management", () => {
  it("setTokens stores access and refresh tokens", () => {
    setTokens("access-123", "refresh-456");
    expect(localStorage.getItem("accessToken")).toBe("access-123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-456");
  });

  it("clearTokens removes all auth data", () => {
    localStorage.setItem("accessToken", "a");
    localStorage.setItem("refreshToken", "r");
    localStorage.setItem("user", '{"id":1}');
    clearTokens();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
