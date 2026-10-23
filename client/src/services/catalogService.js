import { httpClient } from "./httpClient";

export const getGenres = () => httpClient.get("/api/genres");

export const getCountries = () => httpClient.get("/api/countries");

export const getActors = () => httpClient.get("/actors");

export const getAwards = () => httpClient.get("/api/awards");
