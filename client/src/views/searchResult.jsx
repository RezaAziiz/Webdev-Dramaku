import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeGenre, normalizeMovie } from "../adapters/mediaAdapter";
import { getGenres } from "../services/catalogService";
import { discover, getTrending, searchMovies } from "../services/movieService";
import { buildMediaDetailPath, tmdbImageUrl, unwrapList } from "../lib/media";
import {
  buildActiveFilters,
  buildGenreIds,
  errorMessage,
  filterAndSortMedia,
  getFilterOptions,
} from "../lib/discover";
import { SORT_OPTIONS, TITLE_BY_SORT, TYPE_OPTIONS } from "../constants/discover";
import DiscoverSearchBar from "../components/discover/DiscoverSearchBar";
import DiscoverControls from "../components/discover/DiscoverControls";
import DiscoverResults from "../components/discover/DiscoverResults";
import FilterSheet from "../components/discover/FilterSheet";

const SearchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchFieldRef = useRef(null);
  const searchFormRef = useRef(null);
  const suggestionsDismissedRef = useRef(false);
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
  const selectedGenres = useMemo(
    () => (query.get("genre") ?? "").split(",").filter(Boolean),
    [query],
  );
  const appliedFilters = useMemo(
    () => ({
      genre: selectedGenres,
      year: query.get("year") ?? "",
      language: query.get("language") ?? "",
      rating: query.get("rating") ?? "",
      country: query.get("country") ?? "",
    }),
    [query, selectedGenres],
  );

  const [catalog, setCatalog] = useState([]);
  const [trendingCatalog, setTrendingCatalog] = useState([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [genreAttempt, setGenreAttempt] = useState(0);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [genresError, setGenresError] = useState("");
  const [catalogUnavailable, setCatalogUnavailable] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [searchItems, setSearchItems] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [paginationError, setPaginationError] = useState("");
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
  const loadMoreRef = useRef(null);
  const pageRequestRef = useRef(null);

  useEffect(() => {
    setInputValue(term);
    setSuggestions([]);
    setSuggestionIndex(-1);
    suggestionsDismissedRef.current = true;
  }, [term]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target)
      ) {
        suggestionsDismissedRef.current = true;
        setSuggestions([]);
        setSuggestionIndex(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    let current = true;
    setGenresError("");

    getGenres()
      .then((response) => {
        if (!current) return;
        setGenres(
          unwrapList(response)
            .filter((genre) => genre && typeof genre === "object")
            .map(normalizeGenre)
            .filter((genre) => genre !== null),
        );
      })
      .catch((error) => {
        if (current) {
          setGenresError(`Genres unavailable: ${errorMessage(error)}`);
        }
      });

    return () => {
      current = false;
    };
  }, [genreAttempt]);

  useEffect(() => {
    if (term) {
      setCatalogLoading(false);
      return undefined;
    }
    if (selectedSort === "trending") return undefined;

    let current = true;
    setCatalogLoading(true);
    setCatalogError("");
    setCatalogUnavailable(false);
    setCatalog([]);
    setCatalogPage(1);
    setCatalogTotalPages(1);

    const mediaType = selectedType === "movie" ? "movie" : "tv";
    const genreIds = buildGenreIds(selectedGenres, genres);

    discover(mediaType, {
      genre: genreIds,
      year: appliedFilters.year,
      language: appliedFilters.language,
      country: appliedFilters.country,
      minRating: appliedFilters.rating,
      page: 1,
    })
      .then((response) => {
        if (!current) return;
        setCatalog(unwrapList(response));
        setCatalogTotalPages(Number(response?.total_pages) || 1);
      })
      .catch((error) => {
        if (!current || suggestionsDismissedRef.current) return;
        setCatalogUnavailable(true);
        setCatalogError(`Catalog unavailable: ${errorMessage(error)}`);
      })
      .finally(() => {
        if (current) setCatalogLoading(false);
      });

    return () => {
      current = false;
    };
  }, [
    term,
    selectedType,
    selectedSort,
    selectedGenres,
    appliedFilters,
    catalogAttempt,
    genres,
  ]);

  useEffect(() => {
    if (term || selectedSort !== "trending") {
      setTrendingCatalog([]);
      if (term) setCatalogLoading(false);
      return undefined;
    }

    suggestionsDismissedRef.current = false;
    let current = true;
    setCatalogLoading(true);
    setCatalogError("");
    setCatalogUnavailable(false);
    setTrendingCatalog([]);

    getTrending()
      .then((response) => {
        if (current) setTrendingCatalog(unwrapList(response));
      })
      .catch((error) => {
        if (!current) return;
        setCatalogUnavailable(true);
        setCatalogError(`Trending titles unavailable: ${errorMessage(error)}`);
      })
      .finally(() => {
        if (current) setCatalogLoading(false);
      });

    return () => {
      current = false;
    };
  }, [term, selectedSort, catalogAttempt]);

  useEffect(() => {
    if (!term) {
      setSearchItems([]);
      setSearchError("");
      setSearchLoading(false);
      setSearchPage(1);
      setSearchTotalPages(1);
      return undefined;
    }

    let current = true;
    setSearchLoading(true);
    setSearchError("");
    setSearchUnavailable(false);
    setSearchItems([]);
    setSearchPage(1);
    setSearchTotalPages(1);

    searchMovies(term, { page: 1 })
      .then((response) => {
        if (!current) return;
        setSearchItems(unwrapList(response));
        setSearchTotalPages(Number(response?.total_pages) || 1);
      })
      .catch((error) => {
        if (!current) return;
        setSearchUnavailable(true);
        setSearchError(`Search failed: ${errorMessage(error)}`);
      })
      .finally(() => {
        if (current) setSearchLoading(false);
      });

    return () => {
      current = false;
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

    suggestionsDismissedRef.current = false;
    let current = true;
    const timeoutId = window.setTimeout(() => {
      setSuggestionsLoading(true);
      setSuggestionsError("");
      searchMovies(value, { page: 1 })
        .then((response) => {
          if (!current || suggestionsDismissedRef.current) return;
          setSuggestions(
            unwrapList(response)
              .filter((item) => item && typeof item === "object")
              .map(normalizeMovie)
              .filter((item) => item.title)
              .slice(0, 6),
          );
        })
        .catch((error) => {
          if (!current || suggestionsDismissedRef.current) return;
          setSuggestionsError(
            `Suggestions unavailable: ${errorMessage(error)}`,
          );
        })
        .finally(() => {
          if (current) setSuggestionsLoading(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      current = false;
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
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [filterSheetOpen]);

  const normalizedCatalog = useMemo(
    () =>
      catalog
        .filter((item) => item && typeof item === "object")
        .map(normalizeMovie)
        .filter((movie) => movie.title),
    [catalog],
  );
  const normalizedTrendingCatalog = useMemo(
    () =>
      trendingCatalog
        .filter((item) => item && typeof item === "object")
        .map(normalizeMovie)
        .filter((movie) => movie.title),
    [trendingCatalog],
  );
  const normalizedSearchItems = useMemo(
    () =>
      searchItems
        .filter((item) => item && typeof item === "object")
        .map(normalizeMovie)
        .filter((movie) => movie.title),
    [searchItems],
  );
  const filterOptions = useMemo(
    () => getFilterOptions(normalizedCatalog),
    [normalizedCatalog],
  );

  const filteredItems = useMemo(() => {
    const source = term
      ? normalizedSearchItems
      : selectedSort === "trending"
        ? normalizedTrendingCatalog
        : normalizedCatalog;

    return filterAndSortMedia({
      source,
      selectedType,
      selectedGenres,
      appliedFilters,
      selectedSort,
      term,
    });
  }, [
    selectedGenres,
    appliedFilters,
    normalizedCatalog,
    normalizedTrendingCatalog,
    normalizedSearchItems,
    selectedSort,
    selectedType,
    term,
  ]);

  const hasMore =
    selectedSort === "trending"
      ? false
      : term
        ? searchPage < searchTotalPages
        : catalogPage < catalogTotalPages;
  const loadingMore = term ? searchLoadingMore : catalogLoadingMore;

  useEffect(() => {
    pageRequestRef.current = null;
    setCatalogLoadingMore(false);
    setSearchLoadingMore(false);
    setPaginationError("");
    return () => {
      pageRequestRef.current = null;
    };
  }, [location.search]);

  const loadMoreResults = async () => {
    if (
      (term && (searchLoadingMore || searchPage >= searchTotalPages)) ||
      (!term && (catalogLoadingMore || catalogPage >= catalogTotalPages))
    ) {
      return;
    }
    const requestId = {};
    pageRequestRef.current = requestId;
    setPaginationError("");

    if (term) {
      const nextPage = searchPage + 1;
      setSearchLoadingMore(true);
      try {
        const response = await searchMovies(term, { page: nextPage });
        if (pageRequestRef.current !== requestId) return;
        setSearchItems((current) => [...current, ...unwrapList(response)]);
        setSearchPage(nextPage);
        setSearchTotalPages(Number(response?.total_pages) || nextPage);
      } catch (error) {
        if (pageRequestRef.current === requestId) {
          setPaginationError(
            `Could not load more search results: ${errorMessage(error)}`,
          );
        }
      } finally {
        if (pageRequestRef.current === requestId) setSearchLoadingMore(false);
      }
      return;
    }

    const nextPage = catalogPage + 1;
    setCatalogLoadingMore(true);
    const mediaType = selectedType === "movie" ? "movie" : "tv";
    const genreIds = buildGenreIds(selectedGenres, genres);
    try {
      const response = await discover(mediaType, {
        genre: genreIds,
        year: appliedFilters.year,
        language: appliedFilters.language,
        country: appliedFilters.country,
        minRating: appliedFilters.rating,
        page: nextPage,
      });
      if (pageRequestRef.current !== requestId) return;
      setCatalog((current) => [...current, ...unwrapList(response)]);
      setCatalogPage(nextPage);
      setCatalogTotalPages(Number(response?.total_pages) || nextPage);
    } catch (error) {
      if (pageRequestRef.current === requestId) {
        setPaginationError(`Could not load more titles: ${errorMessage(error)}`);
      }
    } finally {
      if (pageRequestRef.current === requestId) setCatalogLoadingMore(false);
    }
  };

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreResults();
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore]);

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
    const href = buildMediaDetailPath(suggestion);
    suggestionsDismissedRef.current = true;
    setSuggestions([]);
    if (href) {
      navigate(href);
    } else {
      updateQuery({ term: suggestion.title });
      searchFieldRef.current?.focus();
    }
  };

  const handleInputChange = (value) => {
    suggestionsDismissedRef.current = false;
    setInputValue(value);
    setSuggestionIndex(-1);
    setSuggestions([]);
    setSuggestionsError("");
    setSuggestionsLoading(false);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setSuggestionIndex((index) =>
        Math.min(index + 1, suggestions.length - 1),
      );
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setSuggestionIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      suggestionsDismissedRef.current = true;
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

  const toggleGenre = (name) => {
    const nextGenres = selectedGenres.includes(name)
      ? selectedGenres.filter((genreName) => genreName !== name)
      : [...selectedGenres, name];
    updateQuery({ genre: nextGenres.join(",") });
  };

  const openFilterSheet = () => {
    setDraftFilters(appliedFilters);
    setFilterSheetOpen(true);
  };

  const activeFilterCount =
    selectedGenres.length +
    [
      appliedFilters.year,
      appliedFilters.language,
      appliedFilters.rating,
      appliedFilters.country,
    ].filter(Boolean).length;
  const selectedTypeLabel =
    TYPE_OPTIONS.find((option) => option.value === selectedType)?.label ??
    "Movies";

  const removeFilter = (name, value) => {
    if (name === "genre") {
      updateQuery({
        genre: selectedGenres.filter((genre) => genre !== value).join(","),
      });
      return;
    }
    updateQuery({ [name]: "" });
  };
  const activeFilters = buildActiveFilters(selectedGenres, appliedFilters);

  const canRenderResults = term ? !searchUnavailable : !catalogUnavailable;

  const retryResults = () => {
    if (catalogError) setCatalogAttempt((attempt) => attempt + 1);
    if (searchError) setSearchAttempt((attempt) => attempt + 1);
    if (genresError) setGenreAttempt((attempt) => attempt + 1);
  };

  const handleEmptyAction = () => {
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
  };

  return (
    <div className="discover-page">
      {(filteredItems[0]?.backdrop || filteredItems[0]?.poster) && (
        <img
          className="discover-ambient"
          src={tmdbImageUrl(
            filteredItems[0].backdrop || filteredItems[0].poster,
            "original",
          )}
          alt=""
          aria-hidden="true"
        />
      )}
      <section className="discover-header" aria-labelledby="discover-title">
        <div className="discover-heading-row">
          <h1 id="discover-title">
            <span>{TITLE_BY_SORT[selectedSort]}</span>
            <span>{selectedTypeLabel}</span>
          </h1>
        </div>
      </section>

      <div className="discover-search-tools">
        <DiscoverSearchBar
          term={term}
          inputValue={inputValue}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          suggestionsError={suggestionsError}
          suggestionIndex={suggestionIndex}
          searchFormRef={searchFormRef}
          searchFieldRef={searchFieldRef}
          onInputChange={handleInputChange}
          onInputKeyDown={handleInputKeyDown}
          onSubmit={submitSearch}
          onChooseSuggestion={chooseSuggestion}
          onRetrySuggestions={() =>
            setSuggestionAttempt((attempt) => attempt + 1)
          }
        />
        <button
          type="button"
          className="discover-reset"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      <DiscoverControls
        selectedType={selectedType}
        selectedSort={selectedSort}
        selectedGenres={selectedGenres}
        genres={genres}
        appliedFilters={appliedFilters}
        filterOptions={filterOptions}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilters}
        filterSheetOpen={filterSheetOpen}
        sheetTriggerRef={sheetTriggerRef}
        onSelectType={(value) => updateQuery({ type: value })}
        onSelectSort={(value) => setSingleFilter("sort", value)}
        onToggleGenre={toggleGenre}
        onClearGenres={() => setSingleFilter("genre", "")}
        onOpenFilters={openFilterSheet}
        onFilterChange={setSingleFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={resetFilters}
      />

      <DiscoverResults
        term={term}
        filteredItems={filteredItems}
        visibleItems={filteredItems}
        hasMore={hasMore}
        loadingMore={loadingMore}
        catalogLoading={catalogLoading}
        searchLoading={searchLoading}
        canRenderResults={canRenderResults}
        catalogError={catalogError}
        searchError={searchError}
        genresError={genresError}
        paginationError={paginationError}
        activeFilterCount={activeFilterCount}
        selectedType={selectedType}
        selectedSort={selectedSort}
        loadMoreRef={loadMoreRef}
        onRetry={retryResults}
        onLoadMore={loadMoreResults}
        onEmptyAction={handleEmptyAction}
      />

      {filterSheetOpen && (
        <FilterSheet
          draftFilters={draftFilters}
          filterOptions={filterOptions}
          sheetRef={filterSheetRef}
          onClose={() => setFilterSheetOpen(false)}
          onChange={setDraftFilter}
          onReset={resetFilters}
          onApply={() => applyDraftFilters()}
        />
      )}
    </div>
  );
};

export default SearchResult;
