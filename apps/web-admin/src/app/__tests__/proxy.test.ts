import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── Hoisted mocks (runs before vi.mock is hoisted) ──

const { mockRedirectFn, mockNextResponse } = vi.hoisted(() => {
  const mockNextResponse = { next: true } as unknown as NextResponse;
  const mockRedirectFn = vi.fn((url: URL) => {
    // Create a fresh object each time and update shared reference
    const resp = { redirected: true, url: url.toString() } as unknown as NextResponse;
    Object.assign(sharedRedirectResponse, resp);
    return sharedRedirectResponse;
  });
  // Shared object that the mock mutates in place so reference stays the same
  const sharedRedirectResponse = { redirected: false } as unknown as NextResponse;
  return { mockRedirectFn, mockNextResponse };
});

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => mockNextResponse),
    redirect: mockRedirectFn,
  },
}));

import { proxy } from "../../proxy";

function createRequest(pathname: string, hasToken = false): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  return {
    nextUrl: { pathname, searchParams: new URLSearchParams() },
    cookies: {
      get: vi.fn((name: string) =>
        name === "accessToken" && hasToken ? { value: "valid-token" } : undefined,
      ),
    },
    url,
  } as unknown as NextRequest;
}

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow public paths without token", () => {
    const req = createRequest("/login", false);
    const result = proxy(req);

    expect(result).toBe(mockNextResponse);
    expect(NextResponse.next).toHaveBeenCalledTimes(1);
  });

  it("should allow authenticated requests on protected paths", () => {
    const req = createRequest("/anggota", true);
    const result = proxy(req);

    expect(result).toBe(mockNextResponse);
    expect(NextResponse.next).toHaveBeenCalledTimes(1);
  });

  it("should redirect to login when no token on protected path", () => {
    const req = createRequest("/anggota", false);
    const result = proxy(req);

    expect((result as any).redirected).toBe(true);
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);

    const redirectUrl = mockRedirectFn.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("redirect")).toBe("/anggota");
  });

  it("should redirect to login with redirect param for nested paths", () => {
    const req = createRequest("/pendadaran/5/edit", false);
    const result = proxy(req);

    expect((result as any).redirected).toBe(true);
    const redirectUrl = mockRedirectFn.mock.calls[0][0] as URL;
    expect(redirectUrl.searchParams.get("redirect")).toBe("/pendadaran/5/edit");
  });

  it("should allow access to root path with token", () => {
    const req = createRequest("/", true);
    const result = proxy(req);

    expect(result).toBe(mockNextResponse);
    expect(NextResponse.next).toHaveBeenCalledTimes(1);
  });
});
