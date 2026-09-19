import { createContext, useContext, useMemo, useState } from "react";
import { request } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "banteay-auth-user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

function clearClientAuthState() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const persist = (nextUser) => {
    setUser(nextUser);
    clearClientAuthState();
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    signIn: async (credentials) => {
      const { user: nextUser } = await request("/v1/auth/login", { method: "post", data: credentials });
      persist(nextUser);
      return nextUser;
    },
    signUp: async (details) => {
      const { user: nextUser } = await request("/v1/auth/register", { method: "post", data: details });
      persist(nextUser);
      return nextUser;
    },
    refreshUser: async () => {
      const { user: nextUser } = await request("/v1/auth/me");
      persist(nextUser);
      return nextUser;
    },
    updateProfile: async (details) => {
      const { user: nextUser } = await request("/v1/auth/me", { method: "patch", data: details });
      persist(nextUser);
      return nextUser;
    },
    logout: async () => {
      try { await request("/v1/auth/logout", { method: "post" }); } finally { persist(null); }
    },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
