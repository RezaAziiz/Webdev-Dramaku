import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/slider";
import { useAuth } from "../contexts/AuthContext";
import {
  normalizeContinueWatching,
  normalizeGenre,
  normalizeMovie,
} from "../adapters/mediaAdapter";
import {
  mockContinueWatching,
  mockJustAdded,
  mockTrending,
} from "../mocks/streaming";
import { addToWatchlist } from "../services/watchlistService";
import { getGenres } from "../services/catalogService";
import { getAllMovies } from "../services/movieService";

const PREVIEW_MODE =
  process.env.REACT_APP_USE_PREVIEW_DATA === "true" ||
  (process.env.NODE_ENV !== "production" &&
    process.env.REACT_APP_USE_PREVIEW_DATA !== "false");

const getMetaLine = (movie) =>
  [
    movie.year,
    movie.type,
    movie.rating == null ? null : `TMDB ${Number(movie.rating).toFixed(1)}`,
  ]
    .filter(Boolean)
    .join(" · ");

const getTimeLeft = (movie) => {
  if (movie.progress == null || movie.duration == null) return null;
  return Math.max(
    0,
    Math.round((Number(movie.duration) * (100 - Number(movie.progress))) / 100),
  );
};

const responseItems = (response) => {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.items)) return response.items;
  if (response && Array.isArray(response.movies)) return response.movies;
  if (response && Array.isArray(response.genres)) return response.genres;
  return [];
};

const genreTagline = (genreName) => {
  const taglines = {
    action: "ADRENALINE",
    adventure: "QUESTS",
    "science fiction": "FUTURE COSMOS",
    "sci-fi": "FUTURE COSMOS",
    drama: "CHARACTER STUDIES",
    mystery: "HIDDEN CLUES",
    romance: "HEART & CONNECTION",
    fantasy: "OTHER WORLDS",
    thriller: "EDGE OF YOUR SEAT",
    comedy: "LIGHTER MOMENTS",
  };
  return taglines[genreName.toLowerCase()] ?? "EXPLORE THE GENRE";
};

const matchesBrowseFilter = (movie, genreName, browseType) => {
  const normalized = normalizeMovie(movie);
  if (browseType === "TV Show") {
    const type = normalized.type?.toLowerCase();
    if (type !== "tv" && type !== "series" && type !== "tv show") return false;
  } else if (
    normalized.type &&
    !["movie", "film"].includes(normalized.type.toLowerCase())
  ) {
    return false;
  }
  return normalized.genre.some(
    (genre) => genre.toLowerCase() === genreName.toLowerCase(),
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAuth();
  const [activeTrend, setActiveTrend] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("All");
  const [savedMovieIds, setSavedMovieIds] = useState(() => new Set());
  const [pendingBookmarkId, setPendingBookmarkId] = useState(null);
  const [bookmarkError, setBookmarkError] = useState("");
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [catalogItems, setCatalogItems] = useState([]);
  const [genreItems, setGenreItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [activeGenreId, setActiveGenreId] = useState(null);
  const [browseType, setBrowseType] = useState("Movie");
  const trendingRef = useRef(null);
  const genreTrackRef = useRef(null);
  const genreResultsTrackRef = useRef(null);

  const trendingItems = useMemo(
    () => (PREVIEW_MODE ? mockTrending.map(normalizeMovie) : []),
    [],
  );
  const justAddedItems = useMemo(
    () => (PREVIEW_MODE ? mockJustAdded.map(normalizeMovie) : []),
    [],
  );
  const continueWatchingItems = useMemo(
    () =>
      isAuthenticated && PREVIEW_MODE
        ? mockContinueWatching.map(normalizeContinueWatching)
        : [],
    [isAuthenticated],
  );
  const normalizedCatalog = useMemo(
    () => catalogItems.map(normalizeMovie),
    [catalogItems],
  );
  const normalizedGenres = useMemo(
    () =>
      genreItems
        .map(normalizeGenre)
        .filter((genre) => genre !== null),
    [genreItems],
  );
  const activeGenre =
    normalizedGenres.find((genre) => genre.id === activeGenreId) ??
    normalizedGenres[0] ??
    null;
  const animeItems = normalizedCatalog.filter(
    (movie) =>
      movie.type?.toLowerCase() === "anime" ||
      movie.genre.some((genre) => genre.toLowerCase() === "anime"),
  );
  const genreResults = normalizedCatalog.filter((movie) => {
    if (!activeGenre) return false;
    return matchesBrowseFilter(movie, activeGenre.name, browseType);
  });
  const repeatedTrendingItems = useMemo(
    () => [...trendingItems, ...trendingItems, ...trendingItems],
    [trendingItems],
  );
  const centerSlot = trendingItems.length;
  const currentIndex = trendingItems.length
    ? activeTrend % trendingItems.length
    : 0;

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;
    setCatalogLoading(true);
    setCatalogError("");

    const loadCatalog = async () => {
      const [moviesResult, genresResult] = await Promise.allSettled([
        getAllMovies({ signal: controller.signal }),
        getGenres({ signal: controller.signal }),
      ]);
      if (!isCurrent) return;

      const messages = [];
      if (moviesResult.status === "fulfilled") {
        setCatalogItems(responseItems(moviesResult.value));
      } else if (!controller.signal.aborted) {
        messages.push(
          `Catalog could not be loaded: ${moviesResult.reason instanceof Error ? moviesResult.reason.message : "request failed"}`,
        );
      }

      if (genresResult.status === "fulfilled") {
        const genres = responseItems(genresResult.value);
        setGenreItems(genres);
        const normalized = genres
          .map(normalizeGenre)
          .filter((genre) => genre !== null);
        setActiveGenreId((currentId) =>
          normalized.some((genre) => genre.id === currentId)
            ? currentId
            : normalized[0]?.id ?? null,
        );
      } else if (!controller.signal.aborted) {
        messages.push(
          `Genres could not be loaded: ${genresResult.reason instanceof Error ? genresResult.reason.message : "request failed"}`,
        );
      }

      setCatalogError(messages.join(" "));
      setCatalogLoading(false);
    };

    loadCatalog().catch((error) => {
      if (!isCurrent || controller.signal.aborted) return;
      setCatalogError(
        error instanceof Error ? error.message : "Could not load browse data.",
      );
      setCatalogLoading(false);
    });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [catalogAttempt]);

  const selectGenre = (genreId) => {
    setActiveGenreId(genreId);
    const card = Array.from(
      genreTrackRef.current?.querySelectorAll("[data-genre-id]") ?? [],
    ).find((item) => item.dataset.genreId === String(genreId));
    card?.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const openGenreResults = (genreName) => {
    const filteredMovies = catalogItems.filter((movie) =>
      matchesBrowseFilter(movie, genreName, browseType),
    );
    navigate("/filtered-movies", { state: { filteredMovies } });
  };

  const scrollCarousel = (ref, direction) => {
    const track = ref.current;
    if (!track) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const scrollToSlot = useCallback((slotIndex, behavior = "smooth") => {
    const track = trendingRef.current;
    const card = track?.querySelectorAll(".trending-card")[slotIndex];
    if (!track || !card) return;

    const cardRect = card.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const left =
      track.scrollLeft +
      cardRect.left +
      cardRect.width / 2 -
      (trackRect.left + trackRect.width / 2);
    if (behavior === "instant") {
      track.scrollLeft = left;
    } else {
      const reduceMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      track.scrollTo({
        left,
        behavior: reduceMotion ? "auto" : behavior,
      });
    }
    setActiveTrend(slotIndex);
  }, []);

  useEffect(() => {
    if (!trendingItems.length) return;
    setActiveTrend(centerSlot);
    scrollToSlot(centerSlot, "instant");
  }, [centerSlot, scrollToSlot, trendingItems.length]);

  const updateActiveFromScroll = () => {
    const track = trendingRef.current;
    const cards = track?.querySelectorAll(".trending-card");
    if (!track || !cards?.length || !trendingItems.length) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const total = trendingItems.length;
    if (closestIndex < total || closestIndex >= total * 2) {
      const loopedIndex = total + (closestIndex % total);
      const target = cards[loopedIndex];
      if (target) {
        const sourceRect = cards[closestIndex].getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        track.scrollLeft += targetRect.left - sourceRect.left;
        closestIndex = loopedIndex;
      }
    }

    setActiveTrend((previous) =>
      previous === closestIndex ? previous : closestIndex,
    );
  };

  const moveTrend = (direction) => {
    if (!trendingItems.length) return;
    const nextIndex =
      (currentIndex + direction + trendingItems.length) % trendingItems.length;
    scrollToSlot(centerSlot + nextIndex);
  };

  const selectTrend = (slotIndex) => {
    const selectedMovie = repeatedTrendingItems[slotIndex];
    if (!selectedMovie) return;
    if (slotIndex === activeTrend) {
      navigate(`/movies/${selectedMovie.id}`);
      return;
    }
    scrollToSlot(centerSlot + (slotIndex % trendingItems.length));
  };

  const saveToLibrary = async (movie) => {
    if (!movie.id) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!username) {
      setBookmarkError("Your account information is unavailable. Please sign in again.");
      return;
    }

    setBookmarkError("");
    setPendingBookmarkId(movie.id);
    try {
      await addToWatchlist(username, movie.id);
      setSavedMovieIds((saved) => new Set(saved).add(movie.id));
    } catch (error) {
      setBookmarkError(
        error instanceof Error
          ? error.message
          : "Could not add this title to your library.",
      );
    } finally {
      setPendingBookmarkId(null);
    }
  };

  const filteredJustAdded = justAddedItems.filter((movie) => {
    if (mediaFilter === "All") return true;
    return movie.type?.toLowerCase() === mediaFilter.toLowerCase();
  });

  return (
    <div className="media-page-shell">
      <Slider />

      <section className="media-section" aria-labelledby="trending-title">
        <div className="section-header section-header--inline">
          <div>
            <span className="section-eyebrow">Trending</span>
            <h2 id="trending-title">Trending Today</h2>
            <span className="section-subtitle">
              {PREVIEW_MODE ? "Preview content · Not live trending data" : "Feed not connected"}
            </span>
          </div>
          {trendingItems.length > 0 && (
            <div className="trending-controls" aria-label="Trending carousel controls">
              <button
                type="button"
                aria-label="Previous title"
                onClick={() => moveTrend(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next title"
                onClick={() => moveTrend(1)}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {trendingItems.length ? (
          <>
            <div
              className="trending-track"
              ref={trendingRef}
              onScroll={updateActiveFromScroll}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTrend(-1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTrend(1);
                }
              }}
              role="region"
              aria-roledescription="carousel"
              aria-label="Trending titles"
            >
              {repeatedTrendingItems.map((movie, index) => {
                const distance = Math.abs(index - activeTrend);
                const distanceClass =
                  distance === 0
                    ? "is-active"
                    : distance === 1
                      ? "is-neighbor"
                      : "is-outer";
                return (
                  <article
                    key={`${movie.id}-${index}`}
                    className={`trending-card ${distanceClass}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${movie.title}, item ${
                      (index % trendingItems.length) + 1
                    } of ${trendingItems.length}${
                      distance === 0 ? ", selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="trending-card-select"
                      onClick={() => selectTrend(index)}
                      disabled={!movie.id}
                      aria-label={
                        distance === 0
                          ? `View details for ${movie.title}`
                          : `Show ${movie.title}`
                      }
                      aria-current={distance === 0 ? "true" : undefined}
                    >
                      {movie.poster && (
                        <img src={movie.poster} alt="" loading="lazy" />
                      )}
                      <span className="trending-card-overlay" aria-hidden="true" />
                      <span className="trending-card-body">
                        {distance === 0 && movie.type && (
                          <span className="trend-type-pill">{movie.type}</span>
                        )}
                        <span className="trending-card-title">{movie.title}</span>
                        {distance === 0 && getMetaLine(movie) && (
                          <span className="trend-meta-row">{getMetaLine(movie)}</span>
                        )}
                      </span>
                    </button>
                    {distance === 0 && (
                      <span className="trend-actions">
                        <button
                          type="button"
                          className="primary-action"
                          onClick={() => navigate(`/movies/${movie.id}`)}
                          disabled={!movie.id}
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          className="secondary-action"
                          onClick={() => saveToLibrary(movie)}
                          disabled={
                            !movie.id ||
                            pendingBookmarkId === movie.id ||
                            savedMovieIds.has(movie.id)
                          }
                        >
                          {savedMovieIds.has(movie.id)
                            ? "Saved"
                            : pendingBookmarkId === movie.id
                              ? "Saving"
                              : "Save"}
                        </button>
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="trending-pagination" aria-label="Choose trending title">
              {trendingItems.slice(0, 5).map((movie, index) => (
                <button
                  type="button"
                  key={`page-${movie.id}`}
                  aria-label={`Go to ${movie.title}`}
                  aria-current={index === currentIndex ? "true" : undefined}
                  className={`trending-page-dot${
                    index === currentIndex ? " is-active" : ""
                  }`}
                  onClick={() => scrollToSlot(centerSlot + index)}
                />
              ))}
            </div>
            {bookmarkError && (
              <p className="section-error" role="alert">
                {bookmarkError}
              </p>
            )}
          </>
        ) : (
          <p className="section-empty">
            Trending titles will appear when the trending feed is connected.
          </p>
        )}
      </section>

      {isAuthenticated && continueWatchingItems.length > 0 && (
        <section className="media-section" aria-labelledby="continue-title">
          <div className="section-header section-header--inline">
            <div>
              <span className="section-eyebrow">Continue</span>
              <h2 id="continue-title">Continue Watching</h2>
              {continueWatchingItems.length > 0 && (
                <span className="section-subtitle">
                  {continueWatchingItems.length} in progress
                </span>
              )}
            </div>
            <span className="section-subtitle">Preview data</span>
          </div>

          <div className="continue-row" aria-label="Continue watching titles">
            {continueWatchingItems.map((movie, index) => {
              const timeLeft = getTimeLeft(movie);
              return (
                <button
                  type="button"
                  key={movie.id || `${movie.title}-${index}`}
                  className="continue-card"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                  disabled={!movie.id}
                >
                  {movie.poster && (
                    <img src={movie.poster} alt={movie.title} loading="lazy" />
                  )}
                  <span className="continue-card-body">
                    <span className="continue-card-head">
                      <strong>{movie.title}</strong>
                      {movie.episode && <span>{movie.episode}</span>}
                    </span>
                    {movie.progress != null && (
                      <span
                        className="progress-track"
                        role="progressbar"
                        aria-label={`${movie.title} progress`}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={Math.min(
                          100,
                          Math.max(0, Number(movie.progress)),
                        )}
                      >
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, Number(movie.progress)),
                            )}%`,
                          }}
                        />
                      </span>
                    )}
                    <span className="continue-meta-row">
                      <span>
                        {timeLeft == null
                          ? "Progress unavailable"
                          : `${timeLeft} min left`}
                      </span>
                      <span>{getMetaLine(movie)}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="media-section" aria-labelledby="added-title">
        <div className="section-header section-header--inline">
          <div>
            <span className="section-eyebrow">Fresh picks</span>
            <h2 id="added-title">Just Added</h2>
            {PREVIEW_MODE && (
              <span className="section-subtitle">Preview data</span>
            )}
          </div>
          <div className="filter-row" role="group" aria-label="Filter new titles">
            {["All", "Movie", "Series"].map((filter) => (
              <button
                type="button"
                key={filter}
                className={`filter-pill${
                  mediaFilter === filter ? " is-active" : ""
                }`}
                aria-pressed={mediaFilter === filter}
                onClick={() => setMediaFilter(filter)}
              >
                {filter === "Movie" ? "Movies" : filter === "Series" ? "Series" : "All"}
              </button>
            ))}
          </div>
        </div>

        {filteredJustAdded.length ? (
          <div className="just-added-grid">
            {filteredJustAdded.map((movie, index) => (
              <button
                type="button"
                key={movie.id || `${movie.title}-${index}`}
                className="just-added-card"
                onClick={() => navigate(`/movies/${movie.id}`)}
                disabled={!movie.id}
              >
                <span className="just-added-image-wrap">
                  {movie.poster && (
                    <img src={movie.poster} alt="" loading="lazy" />
                  )}
                  {movie.type && (
                    <span className="status-badge">{movie.type}</span>
                  )}
                </span>
                <span className="just-added-content">
                  <span className="just-added-topline">
                    <span className="mini-label">{movie.genre?.[0] || ""}</span>
                    {movie.rating != null && (
                      <span className="mini-rating">
                        TMDB {Number(movie.rating).toFixed(1)}
                      </span>
                    )}
                  </span>
                  <span className="just-added-title">{movie.title}</span>
                  {movie.description && (
                    <span className="just-added-description">
                      {movie.description}
                    </span>
                  )}
                  <span className="just-added-footer">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.type && <span>{movie.type}</span>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="section-empty">
            {PREVIEW_MODE
              ? "No preview titles match this filter."
              : "New releases will appear when the latest titles feed is connected."}
          </p>
        )}
      </section>

      <section className="media-section" aria-labelledby="anime-title">
        <div className="section-header section-header--inline">
          <div>
            <span className="section-eyebrow">アニメ · Anime</span>
            <h2 id="anime-title">Anime</h2>
          </div>
          <button
            type="button"
            className="section-link"
            onClick={() => navigate("/search?type=anime")}
          >
            Explore Anime Hub
          </button>
        </div>

        {catalogLoading ? (
          <div className="anime-row" aria-label="Loading anime titles">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="anime-card anime-card--skeleton skeleton-card"
                aria-hidden="true"
              >
                <div className="skeleton-media" />
              </div>
            ))}
          </div>
        ) : animeItems.length ? (
          <div className="anime-row" role="region" aria-label="Anime titles">
            {animeItems.map((movie, index) => (
              <button
                type="button"
                key={movie.id ?? `${movie.title}-${index}`}
                className="anime-card"
                onClick={() => movie.id && navigate(`/movies/${movie.id}`)}
                disabled={!movie.id}
              >
                {movie.poster && (
                  <img src={movie.poster} alt="" loading="lazy" />
                )}
                <span className="anime-card-overlay" aria-hidden="true" />
                <span className="anime-card-badges">
                  {movie.type && <span className="status-badge">{movie.type}</span>}
                </span>
                <span className="anime-card-copy">
                  {movie.genre[0] && (
                    <span className="mini-label">{movie.genre[0]}</span>
                  )}
                  <strong>{movie.title}</strong>
                  <span className="anime-card-meta">
                    {movie.rating == null
                      ? ""
                      : `TMDB ${Number(movie.rating).toFixed(1)}`}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="section-empty">
            Anime titles will appear here when the catalog identifies them.
          </p>
        )}
      </section>

      <section className="media-section browse-section" aria-labelledby="browse-title">
        <div className="browse-heading">
          <div>
            <span className="section-eyebrow">Find your mood</span>
            <h2 id="browse-title">Browse by genre</h2>
          </div>
          <div className="browse-controls">
            <div className="browse-type-toggle" role="group" aria-label="Choose media type">
              {["Movie", "TV Show"].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={browseType === type ? "is-active" : ""}
                  aria-pressed={browseType === type}
                  onClick={() => setBrowseType(type)}
                >
                  {type === "Movie" ? "Movies" : "TV Shows"}
                </button>
              ))}
            </div>
            {activeGenre && (
              <button
                type="button"
                className="browse-genre-link"
                onClick={() => openGenreResults(activeGenre.name)}
              >
                Browse {activeGenre.name} <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </div>

        {catalogError && (
          <div className="catalog-error" role="alert">
            <p>{catalogError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setCatalogAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {catalogLoading ? (
          <div className="genre-track" aria-label="Loading genres">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="genre-card genre-card--skeleton skeleton-card"
                aria-hidden="true"
              >
                <div className="skeleton-media" />
              </div>
            ))}
          </div>
        ) : normalizedGenres.length ? (
          <div className="browse-carousel">
            <button
              type="button"
              className="browse-carousel-arrow browse-carousel-arrow--previous"
              aria-label="Scroll genres left"
              onClick={() => scrollCarousel(genreTrackRef, -1)}
            >
              ‹
            </button>
            <div
              className="genre-track"
              ref={genreTrackRef}
              role="region"
              aria-label="Genres"
            >
              {normalizedGenres.map((genre) => {
                const isActive = genre.id === (activeGenre?.id ?? activeGenreId);
                const representative = normalizedCatalog.find(
                  (movie) =>
                    movie.poster &&
                    movie.genre.some(
                      (name) => name.toLowerCase() === genre.name.toLowerCase(),
                    ),
                );
                return (
                  <button
                    type="button"
                    key={genre.id}
                    data-genre-id={genre.id}
                    className={`genre-card${isActive ? " is-active" : ""}`}
                    onClick={() => selectGenre(genre.id)}
                    aria-pressed={isActive}
                  >
                    {representative?.poster && (
                      <img src={representative.poster} alt="" loading="lazy" />
                    )}
                    <span className="genre-card-overlay" aria-hidden="true" />
                    <span className="genre-card-copy">
                      <span className="genre-card-tagline">
                        {genreTagline(genre.name)}
                      </span>
                      <strong>{genre.name}</strong>
                    </span>
                    {isActive && (
                      <span className="genre-showing">Showing</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="browse-carousel-arrow browse-carousel-arrow--next"
              aria-label="Scroll genres right"
              onClick={() => scrollCarousel(genreTrackRef, 1)}
            >
              ›
            </button>
          </div>
        ) : (
          <p className="section-empty">
            Genres will appear when the catalog is available.
          </p>
        )}

        <div className="genre-results-heading">
          <span className="genre-results-dot" aria-hidden="true" />
          <h3>
            {activeGenre
              ? `${activeGenre.name} · ${browseType === "Movie" ? "Movies" : "TV Shows"}`
              : "Titles"}
          </h3>
          {activeGenre && (
            <button
              type="button"
              className="section-link"
              onClick={() => openGenreResults(activeGenre.name)}
            >
              View all
            </button>
          )}
        </div>

        {catalogLoading ? (
          <div className="genre-results-track" aria-label="Loading titles">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="genre-result-card genre-result-card--skeleton skeleton-card"
                aria-hidden="true"
              >
                <div className="skeleton-media" />
              </div>
            ))}
          </div>
        ) : genreResults.length ? (
          <div className="browse-carousel">
            <button
              type="button"
              className="browse-carousel-arrow browse-carousel-arrow--previous"
              aria-label="Scroll titles left"
              onClick={() => scrollCarousel(genreResultsTrackRef, -1)}
            >
              ‹
            </button>
            <div
              className="genre-results-track"
              ref={genreResultsTrackRef}
              role="region"
              aria-label="Titles in the selected genre"
            >
              {genreResults.map((movie, index) => (
                <button
                  type="button"
                  key={movie.id ?? `${movie.title}-${index}`}
                  className="genre-result-card"
                  onClick={() => movie.id && navigate(`/movies/${movie.id}`)}
                  disabled={!movie.id}
                >
                  {movie.poster && (
                    <img src={movie.poster} alt="" loading="lazy" />
                  )}
                  <span className="genre-result-overlay" aria-hidden="true" />
                  <span className="genre-result-copy">
                    <strong>{movie.title}</strong>
                    <span>{getMetaLine(movie)}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="genre-view-all-card"
                onClick={() => activeGenre && openGenreResults(activeGenre.name)}
              >
                <span>View all</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <button
              type="button"
              className="browse-carousel-arrow browse-carousel-arrow--next"
              aria-label="Scroll titles right"
              onClick={() => scrollCarousel(genreResultsTrackRef, 1)}
            >
              ›
            </button>
          </div>
        ) : (
          <p className="section-empty">
            {catalogLoading
              ? "Loading titles…"
              : activeGenre
                ? `No ${browseType.toLowerCase()} titles are listed for ${activeGenre.name}.`
                : "Choose a genre to browse its titles."}
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
