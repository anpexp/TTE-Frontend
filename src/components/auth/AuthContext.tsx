import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authFetch } from "../lib/api";
import type { UserLike as User } from "../types/user";


export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<{ redirectTo?: string } | void>;
  register: (email: string, username: string, password: string, remember?: boolean) => Promise<{ redirectTo?: string } | void>;
  logout: () => Promise<void>;
  rehydrate: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const rehydrate = () => {
    // Try localStorage first (remember me). If not present, fall back to sessionStorage.
    const storedToken = localStorage.getItem("jwt_token") ?? sessionStorage.getItem("jwt_token");
    const storedUser = localStorage.getItem("user") ?? sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser as string);
        // normalize stored user shape
        const normalized = {
          id: parsed.id ?? parsed._id ?? parsed.email ?? "",
          name: parsed.name ?? parsed.username ?? parsed.email ?? "",
          email: parsed.email ?? undefined,
          role: parsed.role ?? undefined,
          avatarUrl: parsed.avatarUrl ?? undefined,
        };
        setUser(normalized);
      } catch {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    rehydrate();
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authFetch<{ token: string; user?: any }>("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // received response from backend
      const token = data.token;
      // backend may return user info either as `data.user` or flattened at top-level
      const src = (data && (data.user ?? data)) ?? {};
      const normalized: User = {
        id: src.id ?? src._id ?? src.email ?? src.username ?? "",
        name: src.name ?? src.username ?? src.email ?? "",
        email: src.email ?? undefined,
        role: src.role ?? undefined,
        avatarUrl: src.avatarUrl ?? undefined,
      };
      setToken(token);
      setUser(normalized);
    // do not expose debug handles in production
      // store token/user according to remember flag
      if (remember) {
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(normalized));
          // stored to localStorage
      } else {
        sessionStorage.setItem("jwt_token", token);
        sessionStorage.setItem("user", JSON.stringify(normalized));
          // stored to sessionStorage
      }
      queryClient.clear();

      // determine redirect: roles 'SuperAdmin' or 'Employee' go to employee portal
      const roleStr = (normalized.role ?? "").toString().toLowerCase();
      if (roleStr === "superadmin".toLowerCase() || roleStr === "employee".toLowerCase()) {
        return { redirectTo: "/employee-portal" };
      }
      // otherwise undefined -> caller may navigate to previous 'from' or homepage
      return { redirectTo: undefined };
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, remember = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authFetch<{ token: string; user?: any }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      const token = data.token;
      // backend may return user info either as `data.user` or flattened at top-level
      const src = (data && (data.user ?? data)) ?? {};
      const normalized: User = {
        id: src.id ?? src._id ?? src.email ?? src.username ?? "",
        name: src.name ?? src.username ?? src.email ?? "",
        email: src.email ?? undefined,
        role: src.role ?? undefined,
        avatarUrl: src.avatarUrl ?? undefined,
      };
      setToken(token);
      setUser(normalized);
      // registration keeps the user remembered by default (same behavior as before)
      if (remember) {
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(normalized));
      } else {
        sessionStorage.setItem("jwt_token", token);
        sessionStorage.setItem("user", JSON.stringify(normalized));
      }
      queryClient.clear();

      // determine redirect: roles 'SuperAdmin' or 'Employee' go to employee portal
      const roleStr = (normalized.role ?? "").toString().toLowerCase();
      if (roleStr === "superadmin".toLowerCase() || roleStr === "employee".toLowerCase()) {
        return { redirectTo: "/employee-portal" };
      }
      return { redirectTo: undefined };
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authFetch("/api/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
    // clear both storages to be safe
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user");
    queryClient.clear();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, rehydrate, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
