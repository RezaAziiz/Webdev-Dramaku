import { httpClient } from "./httpClient";

export const getGenres = (options) => httpClient.get("/api/genres", options);

export const getCountries = () => httpClient.get("/api/countries");

export const getActors = () => httpClient.get("/actors");

export const getAwards = () => httpClient.get("/api/awards");
