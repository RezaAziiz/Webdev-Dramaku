import { httpClient } from "./httpClient";

export const getComments = (mediaType, tmdbId, options) =>
  httpClient.get(`/api/comments/${mediaType}/${tmdbId}`, options);

export const addComment = (tmdbId, mediaType, { commentText, rate }, token) =>
  httpClient.post("/api/comments", { tmdbId, mediaType, commentText, rate }, { token });
