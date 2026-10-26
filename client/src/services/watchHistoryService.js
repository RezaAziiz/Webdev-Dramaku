import { httpClient } from "./httpClient";

// Cross-device "Continue Watching". Pair this with the vidrock player's
// PLAYER_EVENT postMessage listener (play/pause/seeked/ended/timeupdate) to
// call saveProgress whenever playback position changes meaningfully.
export const getContinueWatching = (token, options) =>
  httpClient.get("/api/watch-history", { ...options, token });

export const saveProgress = (
  { tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds },
  token,
) =>
  httpClient.put(
    "/api/watch-history",
    { tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds },
    { token },
  );

export const removeFromHistory = (mediaType, tmdbId, token) =>
  httpClient.delete(`/api/watch-history/${mediaType}/${tmdbId}`, { token });
