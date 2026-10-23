import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getUserFromToken = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decodedPayload = window.atob(paddedBase64);
    const jsonPayload = decodeURIComponent(
      Array.from(
        decodedPayload,
        (character) =>
          `%${character.codePointAt(0).toString(16).padStart(2, "0")}`,
      ).join(""),
    );
    const user = JSON.parse(jsonPayload);

    if (user.exp && user.exp * 1000 <= Date.now()) return null;
    return user;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const user = getUserFromToken(token);

    if (!user) {
      localStorage.removeItem("token");
      return { token: null, user: null };
    }

    return { token, user };
  });

  const value = useMemo(() => {
    const login = (token) => {
      const user = getUserFromToken(token);
      if (!user) return false;

      localStorage.setItem("token", token);
      setSession({ token, user });
      return true;
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("id_user");
      localStorage.removeItem("role");
      setSession({ token: null, user: null });
    };

    return {
      token: session.token,
      user: session.user,
      username: session.user?.username || "",
      role: session.user?.role || null,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
