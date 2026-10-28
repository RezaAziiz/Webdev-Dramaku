import { hasAnimeGenre, isTvMediaType } from "./media";

export const errorMessage = (error) =>
  error instanceof Error ? error.message : "The request could not be completed.";

export const matchesType = (movie, type) => {
  const itemType = String(movie.type ?? "").trim().toLowerCase();
  if (type === "anime") {
    return (
      itemType === "anime" ||
      hasAnimeGenre(movie.genre) ||
      (Array.isArray(movie.genre) &&
        movie.genre.some((genre) => genre.toLowerCase() === "animation"))
    );
  }
  if (type === "tv") {
    return isTvMediaType(itemType);
  }
  return !itemType || ["movie", "film"].includes(itemType);
};

export const rawYear = (movie) => {
  const year = movie.year == null ? "" : String(movie.year);
  return /^\d{4}/.test(year) ? year.slice(0, 4) : "";
};

export const buildGenreIds = (selectedGenres, genres, mediaType = "movie") =>
  selectedGenres
    .map((name) => {
      const genre = genres.find(
        (entry) => entry.name.toLowerCase() === name.toLowerCase(),
      );
      const typeId = mediaType === "tv" ? genre?.tvId : genre?.movieId;
      if (typeId != null) return typeId;

      if (mediaType === "tv" && name.toLowerCase() === "action") {
        return genres.find(
          (entry) => entry.name.toLowerCase() === "action & adventure",
        )?.tvId;
      }

      if (genre?.movieId !== undefined || genre?.tvId !== undefined) {
        return undefined;
      }

      return genre?.id;
    })
    .filter((id) => id !== undefined)
    .join("|");

export const FALLBACK_LANGUAGES = [
  "Arabic",
  "Cantonese",
  "English",
  "Filipino",
  "French",
  "German",
  "Hindi",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Malay",
  "Mandarin",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Turkish",
];

export const FALLBACK_COUNTRIES = [
  "Australia",
  "Canada",
  "China",
  "France",
  "Germany",
  "Hong Kong",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Malaysia",
  "Philippines",
  "Russia",
  "Singapore",
  "South Korea",
  "Spain",
  "Taiwan",
  "Thailand",
  "United Kingdom",
  "United States of America",
];

const mergeLabelOptions = (labels, fallbackLabels) => {
  const values = new Set([...fallbackLabels, ...(labels || []).filter(Boolean)]);
  return [...values].sort((a, b) => a.localeCompare(b));
};

export const getFilterOptions = (catalog = []) => {
  const currentYear = new Date().getFullYear();
  // Generate list of years from currentYear down to 1970 (e.g. 2026 down to 1970)
  const defaultYears = Array.from({ length: currentYear - 1969 }, (_, i) => String(currentYear - i));
  const years = new Set(defaultYears);
  const languages = new Set();
  const countries = new Set();

  (catalog || []).forEach((movie) => {
    if (!movie) return;
    const year = rawYear(movie);
    if (year) years.add(year);
    if (movie.language) languages.add(movie.language);
    (movie.countries || []).forEach((country) => countries.add(country));
  });

  return {
    years: [...years].sort((a, b) => Number(b) - Number(a)),
    languages: mergeLabelOptions(
      [...languages],
      FALLBACK_LANGUAGES,
    ),
    countries: mergeLabelOptions(
      [...countries],
      FALLBACK_COUNTRIES,
    ),
  };
};

export const filterAndSortMedia = ({
  source,
  selectedType,
  selectedGenres,
  appliedFilters,
  selectedSort,
  term,
}) => {
  const result = source.filter((movie) => {
    if (!movie) return false;

    if (
      (selectedType === "anime" || term || selectedSort === "trending") &&
      !matchesType(movie, selectedType)
    ) {
      return false;
    }
    
    // When using the Discover API with filters, we trust the API response.
    // We only apply local filters for attributes that are NOT sent to the API.
    // Since we ARE sending year, language, country, and rating to the API in SearchResult.jsx,
    // we can skip local filtering for these to prevent format mismatch errors.

    if (
      selectedGenres.length > 0 &&
      (!movie.genre || !selectedGenres.some((selectedGenre) =>
        movie.genre.some(
          (genre) => genre?.toLowerCase() === selectedGenre.toLowerCase(),
        ),
      ))
    ) {
      return false;
    }
    
    return true;
  });

  if (selectedSort === "year") {
    result.sort((a, b) => Number(rawYear(b) || 0) - Number(rawYear(a) || 0));
  } else if (selectedSort === "rating") {
    result.sort((a, b) => Number(b.rating ?? -1) - Number(a.rating ?? -1));
  } else if (selectedSort === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
};

export const buildActiveFilters = (selectedGenres, appliedFilters) =>
  [
    ...selectedGenres.map((genre) => ["genre", genre]),
    appliedFilters.year && ["year", appliedFilters.year],
    appliedFilters.language && ["language", appliedFilters.language],
    appliedFilters.rating && ["rating", `TMDB ${appliedFilters.rating}+`],
    appliedFilters.country && ["country", appliedFilters.country],
  ].filter(Boolean);
