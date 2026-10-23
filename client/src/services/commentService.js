import { httpClient } from "./httpClient";

export const addComment = (movieId, { commentText, rating }, token) =>
  httpClient.post(
    `/movies/${movieId}/comments`,
    { commentText, rating },
    { token },
  );
