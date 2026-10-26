type MediaMetadata = {
  year?: string | number | null;
  type?: string | null;
  rating?: number | string | null;
  progress?: number | string | null;
  duration?: number | string | null;
};

export const getMetaLine = (movie: MediaMetadata): string =>
  [
    movie.year,
    movie.type,
    movie.rating == null ? null : `TMDB ${Number(movie.rating).toFixed(1)}`,
  ]
    .filter(Boolean)
    .join(" · ");

export const getTimeLeft = (movie: MediaMetadata): number | null => {
  if (movie.progress == null || movie.duration == null) return null;
  return Math.max(
    0,
    Math.round((Number(movie.duration) * (100 - Number(movie.progress))) / 100),
  );
};

type HeroMetadata = MediaMetadata & {
  genre?: string | string[] | null;
  category?: string | null;
  runtime?: number | string | null;
  releaseYear?: string | number | null;
};

export const formatGenre = (movie?: HeroMetadata | null): string => {
  if (!movie) return "Featured";
  if (Array.isArray(movie.genre)) return movie.genre.join(" • ");
  if (movie.genre) return movie.genre;
  if (movie.category) return movie.category;
  return "Featured";
};

export const formatRuntime = (movie?: HeroMetadata | null): string => {
  if (!movie) return "N/A";
  if (movie.runtime) return `${movie.runtime} min`;
  if (movie.duration) return `${movie.duration} min`;
  return "N/A";
};

export const formatMetaLine = (movie?: HeroMetadata | null): string => {
  const year = movie?.year || movie?.releaseYear || "—";
  const runtime = formatRuntime(movie);
  const rating = movie?.rating ? `${Number(movie.rating).toFixed(1)} / 10` : "";

  return [year, runtime, rating].filter(Boolean).join(" • ");
};
