export type RawMedia = Record<string, unknown>;

export type MediaItem = {
  id: string | number | null;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  year: string | number | null;
  rating: number | null;
  type: string | null;
  genre: string[];
  palette: MediaPalette | null;
  language: string | null;
  countries: string[];
  runtime: number | null;
  progress: number | null;
  duration: number | null;
  episode: string | null;
};

export type GenreItem = {
  id: string | number;
  name: string;
};

export type MediaPalette = {
  dominant: string | null;
  tint: string | null;
  accent: string | null;
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

const asLabel = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return (
    asString(record.name) ??
    asString(record.english_name) ??
    asString(record.label) ??
    asString(record.iso_639_1) ??
    asString(record.iso_3166_1)
  );
};

const asLabels = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values
    .map(asLabel)
    .filter((label): label is string => label !== null);
};

const asPalette = (value: unknown): MediaPalette | null => {
  if (!value || typeof value !== "object") return null;
  const palette = value as Record<string, unknown>;
  return {
    dominant: asString(palette.dominant),
    tint: asString(palette.tint),
    accent: asString(palette.accent),
  };
};

export const normalizeMovie = (movie: RawMedia): MediaItem => {
  const releaseDate = asString(movie.release_date);
  const rawYear = movie.year ?? movie.releaseYear;
  const year =
    typeof rawYear === "string" || typeof rawYear === "number"
      ? rawYear
      : releaseDate?.slice(0, 4) ?? null;
  const rawGenre = movie.genre ?? movie.categories;
  const rawCountries =
    movie.countries ??
    movie.country ??
    movie.origin_country ??
    movie.production_countries;

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
    backdrop:
      asString(movie.backdrop) ??
      asString(movie.backdrop_path) ??
      asString(movie.backdropImage) ??
      "",
    year,
    rating: asNumber(movie.rating ?? movie.vote_average),
    type: asString(movie.type) ?? asString(movie.media_type),
    genre: asGenres(rawGenre),
    palette: asPalette(movie.palette),
    language: asLabel(
      movie.language ?? movie.original_language ?? movie.originalLanguage,
    ),
    countries: asLabels(rawCountries),
    runtime: asNumber(movie.runtime ?? movie.duration),
    progress: asNumber(movie.progress),
    duration: asNumber(movie.duration ?? movie.runtime),
    episode: asString(movie.episode) ?? asString(movie.episodeTitle),
  };
};

export const normalizeContinueWatching = (movie: RawMedia): MediaItem =>
  normalizeMovie(movie);

export const normalizeGenre = (genre: RawMedia): GenreItem | null => {
  const id = asIdentifier(genre.id) ?? asIdentifier(genre._id);
  const name = asString(genre.name) ?? asString(genre.label);
  if (id === null || name === null) return null;
  return { id, name };
};
