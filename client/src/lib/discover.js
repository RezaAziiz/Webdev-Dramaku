import { hasAnimeGenre, isTvMediaType } from "./media";

export const errorMessage = (error) =>
  error instanceof Error ? error.message : "The request could not be completed.";

export const matchesType = (movie, type) => {
  const itemType = String(movie.type ?? "").trim().toLowerCase();
  if (type === "anime") {
    return itemType === "anime" || hasAnimeGenre(movie.genre);
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

export const buildGenreIds = (selectedGenres, genres) =>
  selectedGenres
    .map(
      (name) =>
        genres.find(
          (genre) => genre.name.toLowerCase() === name.toLowerCase(),
        )?.id,
    )
    .filter((id) => id !== undefined)
    .join("|");

export const FALLBACK_LANGUAGES = [
  "English",
  "Indonesian",
  "Japanese",
  "Korean",
  "Mandarin",
  "Cantonese",
  "Thai",
  "Filipino",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Portuguese",
  "Turkish",
];

export const FALLBACK_COUNTRIES = [
  "Indonesia",
  "Japan",
  "South Korea",
  "United States of America",
  "United Kingdom",
  "China",
  "Hong Kong",
  "Taiwan",
  "Thailand",
  "India",
  "Malaysia",
  "Singapore",
  "Philippines",
  "Spain",
  "France",
  "Germany",
  "Canada",
  "Australia",
];

const mergeLabelOptions = (labels, fallbackLabels) => {
  const values = new Set(labels.filter(Boolean));
  if (!values.size) fallbackLabels.forEach((label) => values.add(label));
  return [...values].sort((a, b) => a.localeCompare(b));
};

export const getFilterOptions = (catalog) => {
  const years = new Set();
  const languages = new Set();
  const countries = new Set();

  catalog.forEach((movie) => {
    const year = rawYear(movie);
    if (year) years.add(year);
    if (movie.language) languages.add(movie.language);
    movie.countries.forEach((country) => countries.add(country));
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
    if (
      (selectedType === "anime" || term || selectedSort === "trending") &&
      !matchesType(movie, selectedType)
    ) {
      return false;
    }
    if (
      selectedGenres.length > 0 &&
      !selectedGenres.some((selectedGenre) =>
        movie.genre.some(
          (genre) => genre.toLowerCase() === selectedGenre.toLowerCase(),
        ),
      )
    ) {
      return false;
    }
    if (appliedFilters.year && rawYear(movie) !== appliedFilters.year) {
      return false;
    }
    if (
      appliedFilters.language &&
      movie.language?.toLowerCase() !== appliedFilters.language.toLowerCase()
    ) {
      return false;
    }
    if (
      appliedFilters.country &&
      !movie.countries.some(
        (country) =>
          country.toLowerCase() === appliedFilters.country.toLowerCase(),
      )
    ) {
      return false;
    }
    if (
      appliedFilters.rating &&
      (movie.rating === null ||
        Number(movie.rating) < Number(appliedFilters.rating))
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
