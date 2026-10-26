import { httpClient } from "./httpClient";

const toQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const string = query.toString();
  return string ? `?${string}` : "";
};

// Curated/normalized endpoints (see docs/BACKEND_TODO.md): each item is
// shaped as { id, title, images, description, year, rating, type, genre }.
export const getTrending = (params, options) =>
  httpClient.get(`/api/trending${toQuery(params)}`, options);

export const getFeaturedMovies = (options) => getTrending(undefined, options);

export const getJustAdded = (mediaType = "movie", options) =>
  httpClient.get(`/api/just-added${toQuery({ mediaType })}`, options);

export const discover = (mediaType, params, options) =>
  httpClient.get(`/api/discover/${mediaType}${toQuery(params)}`, options);

export const searchMovies = (term, params, options) =>
  httpClient.get(`/api/search${toQuery({ term, ...params })}`, options);

// Raw TMDB passthrough (richer payload: credits, videos, recommendations).
export const getMovieDetails = (mediaType, id, options) =>
  httpClient.get(`/api/tmdb/${mediaType}/${id}`, options);

export const getSeasonDetails = (id, seasonNumber, options) =>
  httpClient.get(`/api/tmdb/tv/${id}/season/${seasonNumber}`, options);
