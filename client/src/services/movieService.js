import { httpClient } from "./httpClient";

export const getAllMovies = () => httpClient.get("/movies");

export const getFeaturedMovies = () => httpClient.get("/movies/featured");

export const getMovieById = (id) => httpClient.get(`/movies/${id}`);

export const searchMovies = (term) =>
  httpClient.get(`/api/search?term=${encodeURIComponent(term)}`);

export const getSuggestions = (term) =>
  httpClient.get(`/suggestions?term=${encodeURIComponent(term)}`);

export const createMovie = (formData) =>
  httpClient.post("/api/movies", formData, { isFormData: true });
