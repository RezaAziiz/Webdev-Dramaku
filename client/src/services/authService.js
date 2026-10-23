import { httpClient } from "./httpClient";

export const login = (username, password) =>
  httpClient.post("/login", { username, password });

export const loginWithGoogle = (token) =>
  httpClient.post("/google-login", { token });

export const register = (username, email, password) =>
  httpClient.post("/register", { username, email, password });
