export type RawMedia = Record<string, unknown>;

export type MediaItem = {
  id: string | number | null;
  title: string;
  description: string;
  poster: string;
  year: string | number | null;
  rating: number | null;
  type: string | null;
  genre: string[];
  runtime: number | null;
  progress: number | null;
  duration: number | null;
  episode: string | null;
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const asIdentifier = (value: unknown): string | number | null =>
  typeof value === "string" || typeof value === "number" ? value : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asGenres = (value: unknown): string[] => {
  if (typeof value === "string" && value.trim()) return [value];
  if (!Array.isArray(value)) return [];
  return value.filter((genre): genre is string => typeof genre === "string");
};

export const normalizeMovie = (movie: RawMedia): MediaItem => {
  const releaseDate = asString(movie.release_date);
  const rawYear = movie.year ?? movie.releaseYear;
  const year =
    typeof rawYear === "string" || typeof rawYear === "number"
      ? rawYear
      : releaseDate?.slice(0, 4) ?? null;
  const rawGenre = movie.genre ?? movie.categories;

  return {
    id: asIdentifier(movie.id) ?? asIdentifier(movie._id),
    title: asString(movie.title) ?? asString(movie.name) ?? "",
    description:
      asString(movie.description) ??
      asString(movie.synopsis) ??
      asString(movie.summary) ??
      "",
    poster:
      asString(movie.images) ??
      asString(movie.poster) ??
      asString(movie.poster_path) ??
      "",
    year,
    rating: asNumber(movie.rating ?? movie.vote_average),
    type: asString(movie.type),
    genre: asGenres(rawGenre),
    runtime: asNumber(movie.runtime ?? movie.duration),
    progress: asNumber(movie.progress),
    duration: asNumber(movie.duration ?? movie.runtime),
    episode: asString(movie.episode) ?? asString(movie.episodeTitle),
  };
};

export const normalizeContinueWatching = (movie: RawMedia): MediaItem =>
  normalizeMovie(movie);
