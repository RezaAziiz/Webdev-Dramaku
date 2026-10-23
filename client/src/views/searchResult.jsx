import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { normalizeGenre, normalizeMovie } from "../adapters/mediaAdapter";
import { getGenres } from "../services/catalogService";
import {
  getAllMovies,
  getSuggestions,
  searchMovies,
} from "../services/movieService";

const PAGE_SIZE = 18;
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevant" },
  { value: "year", label: "Release year" },
  { value: "rating", label: "TMDB rating" },
  { value: "title", label: "Title A–Z" },
];
const TYPE_OPTIONS = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "anime", label: "Anime" },
];

const responseItems = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of ["items", "movies", "genres", "suggestions", "results", "data"]) {
    if (Array.isArray(response[key])) return response[key];
  }
  return [];
};

const errorMessage = (error) =>
  error instanceof Error ? error.message : "The request could not be completed.";

const normalizedType = (movie) => movie.type?.trim().toLowerCase() ?? "";

const matchesType = (movie, type) => {
  const itemType = normalizedType(movie);
  if (type === "anime") {
    return (
      itemType === "anime" ||
      movie.genre.some((genre) => genre.toLowerCase() === "anime")
    );
  }
  if (type === "tv") {
    return ["tv", "series", "tv show", "show"].includes(itemType);
  }
  return !itemType || ["movie", "film"].includes(itemType);
};

const rawYear = (movie) => {
  const year = movie.year == null ? "" : String(movie.year);
  return /^\d{4}/.test(year) ? year.slice(0, 4) : "";
};

const getMovieHref = (movie) =>
  movie.id === null ? null : `/movies/${encodeURIComponent(movie.id)}`;

const FilterFields = ({ values, options, onChange }) => (
  <div className="discover-filter-fields">
    <label>
      <span>Year</span>
      <select
        value={values.year}
        disabled={!options.years.length}
        onChange={(event) => onChange("year", event.target.value)}
      >
        <option value="">Any year</option>
        {options.years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
        {!options.years.length && <option value="">Not provided by catalog</option>}
      </select>
    </label>
    <label>
      <span>Language</span>
      <select
        value={values.language}
        disabled={!options.languages.length}
        onChange={(event) => onChange("language", event.target.value)}
      >
        <option value="">Any language</option>
        {options.languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
        {!options.languages.length && (
          <option value="">Not provided by catalog</option>
        )}
      </select>
    </label>
    <label>
      <span>Minimum rating</span>
      <select
        value={values.rating}
        onChange={(event) => onChange("rating", event.target.value)}
      >
        <option value="">Any rating</option>
        {[5, 7, 8, 9].map((rating) => (
          <option key={rating} value={rating}>
            TMDB {rating}+
          </option>
        ))}
      </select>
    </label>
    <label>
      <span>Country</span>
      <select
        value={values.country}
        disabled={!options.countries.length}
        onChange={(event) => onChange("country", event.target.value)}
      >
        <option value="">Any country</option>
        {options.countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
        {!options.countries.length && (
          <option value="">Not provided by catalog</option>
        )}
      </select>
    </label>
  </div>
);

const MediaCard = ({ movie, featured = false }) => {
  const href = getMovieHref(movie);
  const content = (
    <>
      <div className="discover-card-art">
        {movie.poster ? (
          <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
      <div className="discover-card-copy">
        <div className="discover-card-meta">
          {movie.type && <span>{movie.type}</span>}
          {movie.year && <span>{movie.year}</span>}
          {movie.rating !== null && (
            <span>TMDB {Number(movie.rating).toFixed(1)}</span>
          )}
        </div>
        <h3>{movie.title}</h3>
        {featured && movie.description && <p>{movie.description}</p>}
        {!featured && movie.genre.length > 0 && (
          <span className="discover-card-genres">{movie.genre.join(" · ")}</span>
        )}
      </div>
    </>
  );

  if (!href) {
    return (
      <article className={`discover-card${featured ? " is-featured" : ""}`}>
        {content}
      </article>
    );
  }
  return (
    <Link
      className={`discover-card${featured ? " is-featured" : ""}`}
      to={href}
      aria-label={`View ${movie.title} details`}
    >
      {content}
    </Link>
  );
};

const SearchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchFieldRef = useRef(null);
  const sheetTriggerRef = useRef(null);
  const filterSheetRef = useRef(null);
  const wasSheetOpen = useRef(false);
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const term = query.get("term")?.trim() ?? "";
  const selectedType = TYPE_OPTIONS.some(
    (option) => option.value === query.get("type"),
  )
    ? query.get("type")
    : "movie";
  const selectedSort = SORT_OPTIONS.some(
    (option) => option.value === query.get("sort"),
  )
    ? query.get("sort")
    : "relevance";
  const appliedFilters = {
    genre: query.get("genre") ?? "",
    year: query.get("year") ?? "",
    language: query.get("language") ?? "",
    rating: query.get("rating") ?? "",
    country: query.get("country") ?? "",
  };

  const [catalog, setCatalog] = useState([]);
  const [genres, setGenres] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalogUnavailable, setCatalogUnavailable] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [searchItems, setSearchItems] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchUnavailable, setSearchUnavailable] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [inputValue, setInputValue] = useState(term);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [suggestionAttempt, setSuggestionAttempt] = useState(0);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setInputValue(term);
    setSuggestions([]);
    setSuggestionIndex(-1);
  }, [term]);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setCatalogLoading(true);
    setCatalogError("");
    setCatalogUnavailable(false);

    Promise.allSettled([
      getAllMovies({ signal: controller.signal }),
      getGenres({ signal: controller.signal }),
    ]).then((results) => {
      if (!current) return;
      const [moviesResult, genresResult] = results;
      const errors = [];
      if (moviesResult.status === "fulfilled") {
        setCatalog(responseItems(moviesResult.value));
      } else if (!controller.signal.aborted) {
        setCatalogUnavailable(true);
        errors.push(`Catalog unavailable: ${errorMessage(moviesResult.reason)}`);
      }
      if (genresResult.status === "fulfilled") {
        setGenres(
          responseItems(genresResult.value)
            .filter((genre) => genre && typeof genre === "object")
            .map(normalizeGenre)
            .filter((genre) => genre !== null),
        );
      } else if (!controller.signal.aborted) {
        errors.push(`Genres unavailable: ${errorMessage(genresResult.reason)}`);
      }
      setCatalogError(errors.join(" "));
      setCatalogLoading(false);
    });

    return () => {
      current = false;
      controller.abort();
    };
  }, [catalogAttempt]);

  useEffect(() => {
    if (!term) {
      setSearchItems([]);
      setSearchError("");
      setSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let current = true;
    setSearchLoading(true);
    setSearchError("");
    setSearchUnavailable(false);

    searchMovies(term, { signal: controller.signal })
      .then((response) => {
        if (current) setSearchItems(responseItems(response));
      })
      .catch((error) => {
        if (!current || controller.signal.aborted) return;
        setSearchUnavailable(true);
        setSearchError(`Search failed: ${errorMessage(error)}`);
      })
      .finally(() => {
        if (current) setSearchLoading(false);
      });

    return () => {
      current = false;
      controller.abort();
    };
  }, [term, searchAttempt]);

  useEffect(() => {
    const value = inputValue.trim();
    if (value.length < 2 || value === term) {
      setSuggestions([]);
      setSuggestionsError("");
      setSuggestionsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setSuggestionsLoading(true);
      setSuggestionsError("");
      getSuggestions(value, { signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return;
          setSuggestions(
            responseItems(response)
              .filter((item) => item && typeof item === "object")
              .map(normalizeMovie)
              .filter((item) => item.title),
          );
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setSuggestionsError(
            `Suggestions unavailable: ${errorMessage(error)}`,
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setSuggestionsLoading(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [inputValue, suggestionAttempt, term]);

  useEffect(() => {
    if (filterSheetOpen) {
      filterSheetRef.current
        ?.querySelector('select:not([disabled]), button:not([disabled])')
        ?.focus();
      wasSheetOpen.current = true;
    } else if (wasSheetOpen.current) {
      sheetTriggerRef.current?.focus();
      wasSheetOpen.current = false;
    }
  }, [filterSheetOpen]);

  useEffect(() => {
    if (!filterSheetOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setFilterSheetOpen(false);
      if (event.key === "Tab") {
        const focusable = filterSheetRef.current?.querySelectorAll(
          'button:not([disabled]), select:not([disabled]), input:not([disabled])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [filterSheetOpen]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [location.search]);

  const normalizedCatalog = useMemo(
    () =>
      catalog
        .filter((item) => item && typeof item === "object")
        .map(normalizeMovie)
        .filter((movie) => movie.title),
    [catalog],
  );
  const normalizedSearchItems = useMemo(
    () =>
      searchItems
        .filter((item) => item && typeof item === "object")
        .map(normalizeMovie)
        .filter((movie) => movie.title),
    [searchItems],
  );
  const filterOptions = useMemo(() => {
    const years = new Set();
    const languages = new Set();
    const countries = new Set();
    normalizedCatalog.forEach((movie) => {
      const year = rawYear(movie);
      if (year) years.add(year);
      if (movie.language) languages.add(movie.language);
      movie.countries.forEach((country) => countries.add(country));
    });
    return {
      years: [...years].sort((a, b) => Number(b) - Number(a)),
      languages: [...languages].sort((a, b) => a.localeCompare(b)),
      countries: [...countries].sort((a, b) => a.localeCompare(b)),
    };
  }, [normalizedCatalog]);

  const filteredItems = useMemo(() => {
    const source = term ? normalizedSearchItems : normalizedCatalog;
    const needle = term.toLowerCase();
    const result = source.filter((movie) => {
      if (!matchesType(movie, selectedType)) return false;
      if (
        needle &&
        !`${movie.title} ${movie.description}`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      if (
        appliedFilters.genre &&
        !movie.genre.some(
          (genre) => genre.toLowerCase() === appliedFilters.genre.toLowerCase(),
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
      result.sort(
        (a, b) => Number(b.rating ?? -1) - Number(a.rating ?? -1),
      );
    } else if (selectedSort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (needle) {
      const score = (title) => {
        const normalizedTitle = title.toLowerCase();
        if (normalizedTitle === needle) return 0;
        if (normalizedTitle.startsWith(needle)) return 1;
        if (normalizedTitle.includes(needle)) return 2;
        return 3;
      };
      result.sort((a, b) => score(a.title) - score(b.title));
    }
    return result;
  }, [
    appliedFilters,
    normalizedCatalog,
    normalizedSearchItems,
    selectedSort,
    selectedType,
    term,
  ]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (
      !sentinel ||
      visibleCount >= filteredItems.length ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, filteredItems.length),
          );
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length, visibleCount]);

  const updateQuery = (updates, replace = true) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value == null) params.delete(key);
      else params.set(key, String(value));
    });
    const nextSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : "" },
      { replace },
    );
  };

  const submitSearch = (event) => {
    event.preventDefault();
    updateQuery({ term: inputValue.trim() });
    setSuggestions([]);
  };

  const chooseSuggestion = (suggestion) => {
    setInputValue(suggestion.title);
    updateQuery({ term: suggestion.title });
    setSuggestions([]);
    searchFieldRef.current?.focus();
  };

  const setDraftFilter = (name, value) => {
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const applyDraftFilters = (nextFilters = draftFilters) => {
    updateQuery(nextFilters);
    setFilterSheetOpen(false);
  };

  const resetFilters = () => {
    const cleared = {
      genre: "",
      year: "",
      language: "",
      rating: "",
      country: "",
    };
    if (filterSheetOpen) {
      setDraftFilters(cleared);
      return;
    }
    updateQuery({
      genre: "",
      year: "",
      language: "",
      rating: "",
      country: "",
      sort: "",
      type: "movie",
    });
  };

  const setSingleFilter = (name, value) => {
    updateQuery({ [name]: value });
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const visibleItems = filteredItems.slice(0, visibleCount);
  const titleBySort = {
    relevance: "Discover",
    year: "Release year",
    rating: "Top rated",
    title: "Browse A–Z",
  };
  const selectedTypeLabel =
    TYPE_OPTIONS.find((option) => option.value === selectedType)?.label ??
    "Movies";

  const removeFilter = (name) => updateQuery({ [name]: "" });
  const activeFilters = [
    appliedFilters.genre && ["genre", appliedFilters.genre],
    appliedFilters.year && ["year", appliedFilters.year],
    appliedFilters.language && ["language", appliedFilters.language],
    appliedFilters.rating && ["rating", `TMDB ${appliedFilters.rating}+`],
    appliedFilters.country && ["country", appliedFilters.country],
  ].filter(Boolean);

  const canRenderResults = term ? !searchUnavailable : !catalogUnavailable;

  return (
    <div className="discover-page">
      <section className="discover-header" aria-labelledby="discover-title">
        <div className="discover-heading-row">
          <h1 id="discover-title">
            <span>{titleBySort[selectedSort]}</span>
            <span>{selectedTypeLabel}</span>
          </h1>
          <button
            type="button"
            className="discover-reset"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </section>

      <div className="discover-search-sticky">
        <form className="discover-search" role="search" onSubmit={submitSearch}>
          <label className="visually-hidden" htmlFor="discover-search-input">
            Search movies, shows, and anime
          </label>
          <input
            id="discover-search-input"
            ref={searchFieldRef}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setSuggestionIndex(-1);
              setSuggestions([]);
              setSuggestionsError("");
              setSuggestionsLoading(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && suggestions.length) {
                event.preventDefault();
                setSuggestionIndex((index) =>
                  Math.min(index + 1, suggestions.length - 1),
                );
              } else if (event.key === "ArrowUp" && suggestions.length) {
                event.preventDefault();
                setSuggestionIndex((index) => Math.max(index - 1, 0));
              } else if (event.key === "Escape") {
                setSuggestions([]);
                setSuggestionIndex(-1);
              } else if (
                event.key === "Enter" &&
                suggestionIndex >= 0 &&
                suggestions[suggestionIndex]
              ) {
                event.preventDefault();
                chooseSuggestion(suggestions[suggestionIndex]);
              }
            }}
            placeholder="Search titles"
            autoComplete="off"
            role="combobox"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-expanded={
              inputValue.trim().length >= 2 &&
              inputValue.trim() !== term &&
              (suggestionsLoading ||
                Boolean(suggestionsError) ||
                suggestions.length > 0)
            }
            aria-controls="discover-suggestions"
            aria-activedescendant={
              suggestionIndex >= 0
                ? `discover-suggestion-${suggestionIndex}`
                : undefined
            }
          />
          <button type="submit">Search</button>
          {inputValue.trim().length >= 2 &&
            inputValue.trim() !== term &&
            (suggestionsLoading || suggestionsError || suggestions.length > 0) && (
              <div className="discover-suggestions">
                {suggestionsLoading && (
                  <p className="discover-suggestion-status" role="status">
                    Searching suggestions…
                  </p>
                )}
                {suggestionsError && (
                  <div className="discover-suggestion-error">
                    <p role="alert">{suggestionsError}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSuggestionAttempt((attempt) => attempt + 1)
                      }
                    >
                      Retry
                    </button>
                  </div>
                )}
                <div
                  id="discover-suggestions"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id ?? `${suggestion.title}-${index}`}
                      id={`discover-suggestion-${index}`}
                      type="button"
                      role="option"
                      aria-selected={suggestionIndex === index}
                      className="discover-suggestion"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseSuggestion(suggestion)}
                    >
                      {suggestion.poster && (
                        <img src={suggestion.poster} alt="" loading="lazy" />
                      )}
                      <span>
                        <strong>{suggestion.title}</strong>
                        <small>
                          {[suggestion.year, suggestion.type]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </form>
      </div>

      <section className="discover-type-controls" aria-label="Media type">
        <div
          className="discover-control-row"
          role="group"
          aria-label="Choose media type"
        >
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`discover-type-chip${selectedType === option.value ? " is-active" : ""}`}
              aria-pressed={selectedType === option.value}
              onClick={() => updateQuery({ type: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="discover-sticky-controls" aria-label="Sort and genre">
        <div
          className="discover-sort-row"
          role="group"
          aria-label="Sort results"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`discover-sort-chip${selectedSort === option.value ? " is-active" : ""}`}
              aria-pressed={selectedSort === option.value}
              onClick={() => setSingleFilter("sort", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="discover-genre-row"
          role="group"
          aria-label="Filter by genre"
        >
          <button
            type="button"
            className={`discover-genre-chip${!appliedFilters.genre ? " is-active" : ""}`}
            aria-pressed={!appliedFilters.genre}
            onClick={() => setSingleFilter("genre", "")}
          >
            All genres
          </button>
          {genres.map((genre) => (
            <button
              type="button"
              key={genre.id}
              className={`discover-genre-chip${appliedFilters.genre === genre.name ? " is-active" : ""}`}
              aria-pressed={appliedFilters.genre === genre.name}
              onClick={() =>
                setSingleFilter(
                  "genre",
                  appliedFilters.genre === genre.name ? "" : genre.name,
                )
              }
            >
              {genre.name}
            </button>
          ))}
        </div>
      </section>

      <section className="discover-filter-controls" aria-label="Additional filters">
        <div className="discover-filter-desktop">
          <FilterFields
            values={appliedFilters}
            options={filterOptions}
            onChange={setSingleFilter}
          />
        </div>
        <button
          ref={sheetTriggerRef}
          className="discover-filter-trigger"
          type="button"
          aria-expanded={filterSheetOpen}
          aria-controls="discover-filter-sheet"
          onClick={() => {
            setDraftFilters(appliedFilters);
            setFilterSheetOpen(true);
          }}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="discover-filter-count" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </section>

      {activeFilters.length > 0 && (
        <section className="discover-active-filters" aria-label="Active filters">
          <span>Filtering by</span>
          {activeFilters.map(([name, value]) => (
            <button
              type="button"
              key={name}
              className="discover-active-chip"
              onClick={() => removeFilter(name)}
              aria-label={`Remove ${name} filter: ${value}`}
            >
              {value}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            className="discover-clear-filters"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </section>
      )}

      <section className="discover-results" aria-labelledby="results-title">
        <div className="discover-results-heading">
          <h2 id="results-title">Titles</h2>
          {!catalogLoading && !searchLoading && canRenderResults && (
            <p aria-live="polite">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "title" : "titles"}
            </p>
          )}
        </div>

        {(catalogError || searchError) && (
          <div className="discover-error" role="alert">
            <p>{[catalogError, searchError].filter(Boolean).join(" ")}</p>
            <button
              type="button"
              onClick={() => {
                if (catalogError) setCatalogAttempt((attempt) => attempt + 1);
                if (searchError) setSearchAttempt((attempt) => attempt + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}

        {(catalogLoading || searchLoading) && (
          <div className="discover-grid" aria-label="Loading titles">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="discover-card discover-card-skeleton skeleton-card"
                aria-hidden="true"
              >
                <span />
                <div>
                  <i />
                  <i />
                </div>
              </div>
            ))}
          </div>
        )}

        {!catalogLoading && !searchLoading && canRenderResults ? (
          <>
            {filteredItems.length > 0 ? (
              <>
                <MediaCard movie={filteredItems[0]} featured />
                {filteredItems.length > 1 && (
                  <div className="discover-grid">
                    {visibleItems.slice(1).map((movie, index) => (
                      <MediaCard
                        key={movie.id ?? `${movie.title}-${index}`}
                        movie={movie}
                      />
                    ))}
                    {visibleCount < filteredItems.length && (
                      <div
                        ref={loadMoreRef}
                        className="discover-load-sentinel"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )}
                {visibleCount < filteredItems.length && (
                  <button
                    type="button"
                    className="discover-load-more"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + PAGE_SIZE, filteredItems.length),
                      )
                    }
                  >
                    Load more
                  </button>
                )}
              </>
            ) : (
              <div className="discover-empty">
                <h3>{term ? "No matching titles" : "No titles to show"}</h3>
                <p>
                  {term
                    ? "Try a different search or remove some filters."
                    : "The catalog has no titles matching these filters."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (term) {
                      updateQuery({ term: "" });
                      setInputValue("");
                    } else if (
                      activeFilterCount > 0 ||
                      selectedType !== "movie" ||
                      selectedSort !== "relevance"
                    ) {
                      resetFilters();
                    } else {
                      setCatalogAttempt((attempt) => attempt + 1);
                    }
                  }}
                >
                  {term
                    ? "Clear search"
                    : activeFilterCount > 0 ||
                        selectedType !== "movie" ||
                        selectedSort !== "relevance"
                      ? "Reset filters"
                      : "Retry catalog"}
                </button>
              </div>
            )}
          </>
        ) : null}
      </section>

      {filterSheetOpen && (
        <div className="discover-filter-overlay">
          <button
            className="discover-filter-backdrop"
            type="button"
            aria-label="Close filters"
            onClick={() => setFilterSheetOpen(false)}
          />
          <section
            id="discover-filter-sheet"
            ref={filterSheetRef}
            className="discover-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
          >
            <div className="discover-filter-sheet-heading">
              <h2 id="filter-sheet-title">Filters</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFilterSheetOpen(false)}
              >
                ×
              </button>
            </div>
            <FilterFields
              values={draftFilters}
              options={filterOptions}
              onChange={setDraftFilter}
            />
            <div className="discover-filter-sheet-actions">
              <button type="button" onClick={resetFilters}>
                Reset
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={() => applyDraftFilters()}
              >
                Apply filters
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
