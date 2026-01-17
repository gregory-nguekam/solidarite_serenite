import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "./roles";

type User = { id: string; email: string; fullName: string; role: Role };
type AuthState = { user: User | null; token: string | null };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : { user: null, token: null };
  });

  const persist = (next: AuthState) => {
    setState(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  const login = async (email: string, _password: string) => {
    // MOCK: pour la démo, password ignoré.
    // Tu peux mapper certains emails à des rôles pour montrer les permissions.
    const role: Role =
      email.includes("admin") ? "ADMIN" : email.includes("member") ? "MEMBER" : "VISITOR";

    const user: User = {
      id: crypto.randomUUID(),
      email,
      fullName: role === "ADMIN" ? "Admin Démo" : role === "MEMBER" ? "Membre Démo" : "Visiteur Démo",
      role,
    };

    persist({ user, token: "mock-jwt-token" });
  };

  const logout = () => persist({ user: null, token: null });

  const value = useMemo(() => ({ ...state, login, logout }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
