import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "banteay-demo-auth-user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const persist = (nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_KEY);
  };
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    // Temporary local-session actions. Replace these with /api/v1/auth calls
    // and /me session restoration when backend integration is enabled.
    signIn: ({ email, phoneNumber }) => persist({ id: "frontend-demo-user", name: "Sreynich Chan", email: email || null, phoneNumber: phoneNumber || null, role: "USER" }),
    signUp: ({ name, email, phoneNumber }) => persist({ id: "frontend-demo-user", name: name || "Community member", email: email || null, phoneNumber: phoneNumber || null, role: "USER" }),
    logout: () => persist(null),
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
