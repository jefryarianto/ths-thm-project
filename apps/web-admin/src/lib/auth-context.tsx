"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, authApi, clearTokens, setTokens, type ApiError } from "./api";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await authApi.login(identifier, password);
    setTokens(res.accessToken, res.refreshToken);
    const userData = res.user as User;
    localStorage.setItem("user", JSON.stringify(userData));
    // Set cookie so Next.js middleware can read it
    document.cookie = `accessToken=${res.accessToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
    // Store user role info for sidebar permissions
    if (userData.role) {
      localStorage.setItem("userRole", JSON.stringify(userData.role));
    }
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
    // Clear auth cookie
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
