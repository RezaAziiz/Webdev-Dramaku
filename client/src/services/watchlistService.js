import { httpClient } from "./httpClient";

// All watchlist endpoints are now auth-based: the server derives the user
// from the JWT instead of trusting a username/id passed by the client.
export const getWatchlist = (token, options) =>
  httpClient.get("/api/watchlist", { ...options, token });

export const addToWatchlist = (tmdbId, mediaType, token) =>
  httpClient.post("/api/watchlist", { tmdbId, mediaType }, { token });

export const removeFromWatchlist = (tmdbId, mediaType, token) =>
  httpClient.delete(`/api/watchlist/${mediaType}/${tmdbId}`, { token });
