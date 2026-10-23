import { httpClient } from "./httpClient";

export const getAllMovies = (options) => httpClient.get("/movies", options);

export const getFeaturedMovies = () => httpClient.get("/movies/featured");

export const getMovieById = (id) => httpClient.get(`/movies/${id}`);

export const searchMovies = (term, options) =>
  httpClient.get(`/api/search?term=${encodeURIComponent(term)}`, options);

export const getSuggestions = (term, options) =>
  httpClient.get(`/suggestions?term=${encodeURIComponent(term)}`, options);

export const createMovie = (formData) =>
  httpClient.post("/api/movies", formData, { isFormData: true });
