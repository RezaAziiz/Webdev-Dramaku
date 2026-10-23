import { httpClient } from "./httpClient";

export const getWatchlist = (username) =>
  httpClient.get(`/api/watchlist/${username}`);

export const addToWatchlist = (username, movieId) =>
  httpClient.post("/api/watchlist", { username, movieId });

export const removeFromWatchlist = (username, movieId) =>
  httpClient.delete(`/api/watchlist/${username}/${movieId}`);
