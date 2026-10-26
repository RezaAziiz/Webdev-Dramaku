import { httpClient } from "./httpClient";

// Movie + TV genres merged into one deduped list ({ id, name }).
export const getGenres = (options) => httpClient.get("/api/genres", options);
