import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTokenExpiryMs,
  getUserFromToken,
  type AuthUser,
} from "../lib/jwt";
import {
  clearStoredAuth,
  readStoredToken,
  writeStoredToken,
} from "../lib/tokenStorage";

const MAX_TIMEOUT_MS = 2_147_483_647;

type AuthSession = {
  token: string | null;
  user: AuthUser | null;
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  username: string;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const createSession = (token: string | null): AuthSession => {
  const user = getUserFromToken(token);
  return user ? { token, user } : { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession>(() => {
    const token = readStoredToken();
    const restored = createSession(token);

    if (!restored.user) {
      clearStoredAuth();
    }

    return restored;
  });

  const login = useCallback((token: string): boolean => {
    const next = createSession(token);
    if (!next.user) return false;

    writeStoredToken(token);
    setSession(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setSession({ token: null, user: null });
  }, []);

  useEffect(() => {
    if (!session.token) return;

    const expiresAt = getTokenExpiryMs(session.token);
    if (expiresAt === null) return;

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    if (delay > MAX_TIMEOUT_MS) return;

    const timer = window.setTimeout(logout, delay);
    return () => window.clearTimeout(timer);
  }, [session.token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session.token,
      user: session.user,
      username: session.user?.username ?? "",
      role: session.user?.role ?? null,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
