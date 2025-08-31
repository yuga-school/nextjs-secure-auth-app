"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { LoginRequest } from "@/app/_types/LoginRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import { fetchUserProfile } from "./sessionFetcher";
import toast from "react-hot-toast";

export type AuthContextProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (loginRequest: LoginRequest) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => null,
  logout: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = useCallback(async (loginRequest: LoginRequest): Promise<UserProfile | null> => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginRequest),
    });

    const data = await res.json();
    if (data.success) {
      setUser(data.payload);
      return data.payload;
    } else {
      setUser(null);
      throw new Error(data.message || "ログインに失敗しました。");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    toast.success("ログアウトしました。");
    window.location.href = "/login";
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};