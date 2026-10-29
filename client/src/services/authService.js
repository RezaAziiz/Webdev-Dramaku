import { httpClient } from "./httpClient";

export const login = (username, password) =>
  httpClient.post("/api/login", { username, password });

export const loginWithGoogle = (token) =>
  httpClient.post("/api/google-login", { token });

export const register = (username, email, password) =>
  httpClient.post("/api/register", { username, email, password });
