"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "./api-client";

interface AuthState {
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("token");
    setState({ token: stored, isLoading: false });

    // Sync logout across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        setState({ token: e.newValue, isLoading: false });
        if (!e.newValue) router.push("/login");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      localStorage.setItem("token", res.access_token);
      setState({ token: res.access_token, isLoading: false });
      router.push("/");
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await api.register(email, password, name);
      localStorage.setItem("token", res.access_token);
      setState({ token: res.access_token, isLoading: false });
      router.push("/");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({ token: null, isLoading: false });
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      isAuthenticated: !!state.token,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
