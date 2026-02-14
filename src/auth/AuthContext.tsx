import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "./roles";
import { login as apiLogin, me as apiMe } from "../api/auth";

type User = {
  id: string;
  email: string;
  fullName: string;
  nom?: string;
  prenom?: string;
  role: Role;
};
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

  const normalizeUser = (
    payload: Partial<User> & {
      name?: string;
      _id?: string;
      firstName?: string;
      lastName?: string;
    }
  ) => {
    const role = payload.role ?? "VISITOR";
    const nom = payload.nom ?? payload.lastName;
    const prenom = payload.prenom ?? payload.firstName;
    const computedFullName = [prenom, nom].filter(Boolean).join(" ").trim();
    return {
      id: payload.id ?? payload._id ?? crypto.randomUUID(),
      email: payload.email ?? "",
      fullName: (computedFullName || payload.email) ?? "Utilisateur",
      nom,
      prenom,
      role,
    } satisfies User;
  };

  const login = async (email: string, password: string) => {
    const token = await apiLogin(email, password);
    const mePayload = (await apiMe(token)) as Partial<User> & {
      name?: string;
      _id?: string;
      firstName?: string;
      lastName?: string;
    };
    const user = normalizeUser(mePayload);
    persist({ user, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    persist({ user: null, token: null });
  };

  const value = useMemo(() => ({ ...state, login, logout }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
