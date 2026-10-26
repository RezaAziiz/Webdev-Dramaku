const TMDB_HOST = "https://image.tmdb.org/t/p";
const TMDB_SIZE_PATTERN =
  /(image\.tmdb\.org\/t\/p\/)(?:w\d+|h\d+|original)(\/)/;

export const TMDB_POSTER_SIZE = "w500";
export const TMDB_BACKDROP_SIZE = "original";

export const TV_TYPE_ALIASES = ["tv", "series", "tv show", "show"] as const;
export const TV_ROUTE_TYPES = [...TV_TYPE_ALIASES, "anime"] as const;

const LIST_KEYS = [
  "results",
  "items",
  "movies",
  "genres",
  "suggestions",
  "data",
] as const;

export type MediaPathItem = {
  id?: string | number | null;
  type?: string | null;
  genre?: string[];
};

export const unwrapList = (response: unknown): unknown[] => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  const record = response as Record<string, unknown>;
  for (const key of LIST_KEYS) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
};

export const unwrapObjectList = (
  response: unknown,
): Record<string, unknown>[] =>
  unwrapList(response).filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object"),
  );

export const normalizedMediaType = (type: unknown): string =>
  String(type ?? "").trim().toLowerCase();

export const hasAnimeGenre = (genre: unknown): boolean =>
  Array.isArray(genre) &&
  genre.some((entry) => String(entry).toLowerCase() === "anime");

export const isTvMediaType = (type: unknown): boolean =>
  (TV_TYPE_ALIASES as readonly string[]).includes(normalizedMediaType(type));

export const isTvRouteItem = (item: MediaPathItem): boolean => {
  const type = normalizedMediaType(item.type);
  return (
    (TV_ROUTE_TYPES as readonly string[]).includes(type) ||
    hasAnimeGenre(item.genre)
  );
};

export const mediaDetailType = (
  item: MediaPathItem | string | null | undefined,
): "tv" | "movie" => {
  if (item == null) return "movie";
  if (typeof item === "string") {
    return isTvMediaType(item) ? "tv" : "movie";
  }
  return isTvRouteItem(item) ? "tv" : "movie";
};

export const mediaTypeLabel = (item: MediaPathItem): "Anime" | "TV" | "Movie" => {
  if (hasAnimeGenre(item.genre) || normalizedMediaType(item.type) === "anime") {
    return "Anime";
  }
  return normalizedMediaType(item.type) === "tv" ? "TV" : "Movie";
};

export const buildMediaDetailPath = (item: MediaPathItem): string | null => {
  if (item.id === null || item.id === undefined || item.id === "") return null;
  return `/movies/${mediaDetailType(item)}/${encodeURIComponent(String(item.id))}`;
};

export const tmdbImageUrl = (
  path: unknown,
  size: string = TMDB_POSTER_SIZE,
): string => {
  if (typeof path !== "string" || !path.trim()) return "";
  const image = path.trim();

  if (/^https?:\/\//i.test(image)) {
    return size === TMDB_BACKDROP_SIZE
      ? image.replace(TMDB_SIZE_PATTERN, `$1${TMDB_BACKDROP_SIZE}$2`)
      : image;
  }

  if (image.startsWith("/")) {
    return `${TMDB_HOST}/${size}${image}`;
  }

  if (size === TMDB_BACKDROP_SIZE) {
    return image.replace(TMDB_SIZE_PATTERN, `$1${TMDB_BACKDROP_SIZE}$2`);
  }

  return `${TMDB_HOST}/${size}/${image}`;
};
