"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authFetch } from "../lib/api";
import type { UserLike as User } from "../types/user";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ redirectTo?: string } | void>;
  register: (
    email: string,
    username: string,
    password: string,
    remember?: boolean
  ) => Promise<{ redirectTo?: string } | void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const rehydrate = () => {
    try {
      const storedToken =
        localStorage.getItem("jwt_token") ??
        sessionStorage.getItem("jwt_token");
      const storedUser =
        localStorage.getItem("user") ?? sessionStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser as string);
        const normalized: User = {
          id: parsed.id ?? parsed._id ?? parsed.email ?? "",
          name: parsed.name ?? parsed.username ?? parsed.email ?? "",
          email: parsed.email ?? undefined,
          role: parsed.role ?? undefined,
          avatarUrl: parsed.avatarUrl ?? undefined,
        };
        setUser(normalized);
      } else {
        setUser(null);
        setToken(null);
      }
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    rehydrate();
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authFetch<{ token: string; user?: any }>(
        "/api/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      const token = data.token;
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
      if (remember) {
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(normalized));
      } else {
        sessionStorage.setItem("jwt_token", token);
        sessionStorage.setItem("user", JSON.stringify(normalized));
      }
      queryClient.clear();
      const roleStr = (normalized.role ?? "").toString().toLowerCase();
      if (roleStr === "superadmin" || roleStr === "employee")
        return { redirectTo: "/employee-portal" };
      return { redirectTo: undefined };
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    remember = true
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authFetch<{ token: string; user?: any }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      const token = data.token;
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
      if (remember) {
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(normalized));
      } else {
        sessionStorage.setItem("jwt_token", token);
        sessionStorage.setItem("user", JSON.stringify(normalized));
      }
      queryClient.clear();
      const roleStr = (normalized.role ?? "").toString().toLowerCase();
      if (roleStr === "superadmin" || roleStr === "employee")
        return { redirectTo: "/employee-portal" };
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
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user");
    queryClient.clear();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        login,
        register,
        logout,
        rehydrate,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
