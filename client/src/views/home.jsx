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
import { addToWatchlist } from "../services/watchlistService";
import { getGenres } from "../services/catalogService";
import { discover, getJustAdded, getTrending } from "../services/movieService";
import { getContinueWatching } from "../services/watchHistoryService";

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
  if (response && Array.isArray(response.results)) return response.results;
  if (response && Array.isArray(response.items)) return response.items;
  if (response && Array.isArray(response.movies)) return response.movies;
  if (response && Array.isArray(response.genres)) return response.genres;
  return [];
};

const movieDetailPath = (movie) => {
  const type = ["tv", "series", "tv show", "show"].includes(
    String(movie.type || "").trim().toLowerCase(),
  )
    ? "tv"
    : "movie";
  return `/movies/${type}/${encodeURIComponent(movie.id)}`;
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [activeTrend, setActiveTrend] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("All");
  const [savedMovieIds, setSavedMovieIds] = useState(() => new Set());
  const [pendingBookmarkId, setPendingBookmarkId] = useState(null);
  const [bookmarkError, setBookmarkError] = useState("");

  const [trendingAttempt, setTrendingAttempt] = useState(0);
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState("");

  const [justAddedAttempt, setJustAddedAttempt] = useState(0);
  const [justAddedItems, setJustAddedItems] = useState([]);
  const [justAddedLoading, setJustAddedLoading] = useState(true);
  const [justAddedError, setJustAddedError] = useState("");

  const [continueWatchingAttempt, setContinueWatchingAttempt] = useState(0);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
  const [continueWatchingError, setContinueWatchingError] = useState("");

  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [genreItems, setGenreItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [activeGenreId, setActiveGenreId] = useState(null);
  const [browseType, setBrowseType] = useState("Movie");

  const [genreResultsAttempt, setGenreResultsAttempt] = useState(0);
  const [genreResultsItems, setGenreResultsItems] = useState([]);
  const [genreResultsRaw, setGenreResultsRaw] = useState([]);
  const [genreResultsLoading, setGenreResultsLoading] = useState(true);
  const [genreResultsError, setGenreResultsError] = useState("");

  const [animeAttempt, setAnimeAttempt] = useState(0);
  const [animeItems, setAnimeItems] = useState([]);
  const [animeLoading, setAnimeLoading] = useState(true);
  const [animeError, setAnimeError] = useState("");

  const trendingRef = useRef(null);
  const justAddedRef = useRef(null);
  const genreTrackRef = useRef(null);
  const genreResultsTrackRef = useRef(null);

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
  const animationGenreId = useMemo(() => {
    const match = normalizedGenres.find(
      (genre) => genre.name.toLowerCase() === "animation",
    );
    return match ? match.id : null;
  }, [normalizedGenres]);
  const representativePool = useMemo(
    () => [
      ...trendingItems,
      ...justAddedItems,
      ...genreResultsItems,
      ...animeItems,
    ],
    [trendingItems, justAddedItems, genreResultsItems, animeItems],
  );
  const repeatedTrendingItems = useMemo(
    () => [...trendingItems, ...trendingItems, ...trendingItems],
    [trendingItems],
  );
  const centerSlot = trendingItems.length;
  const currentIndex = trendingItems.length
    ? activeTrend % trendingItems.length
    : 0;

  useEffect(() => {
    let isCurrent = true;
    setTrendingLoading(true);
    setTrendingError("");

    getTrending()
      .then((response) => {
        if (!isCurrent) return;
        setTrendingItems(responseItems(response).map(normalizeMovie));
      })
      .catch((error) => {
        if (!isCurrent) return;
        setTrendingError(
          error instanceof Error
            ? error.message
            : "Could not load trending titles.",
        );
      })
      .finally(() => {
        if (isCurrent) setTrendingLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [trendingAttempt]);

  useEffect(() => {
    let isCurrent = true;
    setJustAddedLoading(true);
    setJustAddedError("");

    Promise.allSettled([
      getJustAdded("movie"),
      getJustAdded("tv"),
    ]).then((results) => {
      if (!isCurrent) return;

      const items = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => responseItems(result.value));
      setJustAddedItems(items.map(normalizeMovie));

      const failed = results.find(
        (result) => result.status === "rejected",
      );
      if (failed) {
        setJustAddedError(
          failed.reason instanceof Error
            ? failed.reason.message
            : "Could not load the latest titles.",
        );
      }
      setJustAddedLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [justAddedAttempt]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setContinueWatchingItems([]);
      setContinueWatchingError("");
      return undefined;
    }

    let isCurrent = true;
    setContinueWatchingError("");

    getContinueWatching(token)
      .then((response) => {
        if (!isCurrent) return;
        setContinueWatchingItems(
          responseItems(response).map(normalizeContinueWatching),
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        setContinueWatchingError(
          error instanceof Error
            ? error.message
            : "Could not load your continue watching list.",
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, token, continueWatchingAttempt]);

  useEffect(() => {
    let isCurrent = true;
    setCatalogLoading(true);
    setCatalogError("");

    getGenres()
      .then((response) => {
        if (!isCurrent) return;
        const genres = responseItems(response);
        setGenreItems(genres);
        const normalized = genres
          .map(normalizeGenre)
          .filter((genre) => genre !== null);
        setActiveGenreId((currentId) =>
          normalized.some((genre) => genre.id === currentId)
            ? currentId
            : normalized[0]?.id ?? null,
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        setCatalogError(
          error instanceof Error ? error.message : "Genres could not be loaded.",
        );
      })
      .finally(() => {
        if (isCurrent) setCatalogLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [catalogAttempt]);

  useEffect(() => {
    if (activeGenreId == null) {
      setGenreResultsItems([]);
      setGenreResultsRaw([]);
      setGenreResultsLoading(false);
      setGenreResultsError("");
      return undefined;
    }

    let isCurrent = true;
    const mediaType = browseType === "TV Show" ? "tv" : "movie";
    setGenreResultsLoading(true);
    setGenreResultsError("");

    discover(mediaType, { genre: activeGenreId })
      .then((response) => {
        if (!isCurrent) return;
        const items = responseItems(response);
        setGenreResultsRaw(items);
        setGenreResultsItems(items.map(normalizeMovie));
      })
      .catch((error) => {
        if (!isCurrent) return;
        setGenreResultsError(
          error instanceof Error
            ? error.message
            : "Could not load titles for this genre.",
        );
      })
      .finally(() => {
        if (isCurrent) setGenreResultsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeGenreId, browseType, genreResultsAttempt]);

  useEffect(() => {
    if (animationGenreId == null) {
      setAnimeItems([]);
      setAnimeLoading(false);
      setAnimeError("");
      return undefined;
    }

    let isCurrent = true;
    setAnimeLoading(true);
    setAnimeError("");

    Promise.allSettled([
      discover(
        "movie",
        { genre: animationGenreId },
      ),
      discover(
        "tv",
        { genre: animationGenreId },
      ),
    ]).then((results) => {
      if (!isCurrent) return;

      const items = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => responseItems(result.value));
      setAnimeItems(items.map(normalizeMovie));

      const failed = results.find(
        (result) => result.status === "rejected",
      );
      if (failed) {
        setAnimeError(
          failed.reason instanceof Error
            ? failed.reason.message
            : "Could not load anime titles.",
        );
      }
      setAnimeLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [animationGenreId, animeAttempt]);

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

  const openGenreResults = () => {
    navigate("/filtered-movies", { state: { filteredMovies: genreResultsRaw } });
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
      navigate(movieDetailPath(selectedMovie));
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
    if (!token) {
      setBookmarkError("Your account information is unavailable. Please sign in again.");
      return;
    }

    setBookmarkError("");
    setPendingBookmarkId(movie.id);
    try {
      await addToWatchlist(movie.id, movie.type || "movie", token);
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
    if (mediaFilter === "Series") return movie.type?.toLowerCase() === "tv";
    return movie.type?.toLowerCase() === mediaFilter.toLowerCase();
  });

  return (
    <div className="media-page-shell">
      <Slider fallbackMovies={trendingItems} />

      <section
        id="trending"
        className="media-section"
        aria-labelledby="trending-title"
      >
        <div className="section-header section-header--inline">
          <div>
            <span className="section-eyebrow">Trending</span>
            <h2 id="trending-title">Trending Today</h2>
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

        {trendingError && (
          <div className="catalog-error" role="alert">
            <p>{trendingError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setTrendingAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        )}

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
                          onClick={() => navigate(movieDetailPath(movie))}
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
            {trendingLoading
              ? "Loading trending titles…"
              : "Trending titles will appear when the trending feed is connected."}
          </p>
        )}
      </section>

      {isAuthenticated &&
        (continueWatchingItems.length > 0 || continueWatchingError) && (
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
            </div>

            {continueWatchingError && (
              <div className="catalog-error" role="alert">
                <p>{continueWatchingError}</p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={() =>
                    setContinueWatchingAttempt((attempt) => attempt + 1)
                  }
                >
                  Retry
                </button>
              </div>
            )}

            {continueWatchingItems.length > 0 && (
              <div className="continue-row" aria-label="Continue watching titles">
                {continueWatchingItems.map((movie, index) => {
                  const timeLeft = getTimeLeft(movie);
                  return (
                    <button
                      type="button"
                      key={movie.id || `${movie.title}-${index}`}
                      className="continue-card"
                      onClick={() => navigate(movieDetailPath(movie))}
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
            )}
          </section>
        )}

      <section className="media-section" aria-labelledby="added-title">
        <div className="section-header section-header--inline">
          <div>
            <span className="section-eyebrow">Fresh picks</span>
            <h2 id="added-title">Just Added</h2>
          </div>
          <div className="just-added-header-actions">
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
            {filteredJustAdded.length > 1 && (
              <div className="trending-controls just-added-controls" aria-label="Just Added carousel controls">
                <button
                  type="button"
                  aria-label="Previous new title"
                  onClick={() => scrollCarousel(justAddedRef, -1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next new title"
                  onClick={() => scrollCarousel(justAddedRef, 1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {justAddedError && (
          <div className="catalog-error" role="alert">
            <p>{justAddedError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setJustAddedAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {filteredJustAdded.length ? (
          <div
            className="just-added-track"
            ref={justAddedRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Just Added titles"
          >
            {filteredJustAdded.map((movie, index) => (
              <button
                type="button"
                key={movie.id || `${movie.title}-${index}`}
                className="just-added-card"
                onClick={() => navigate(movieDetailPath(movie))}
                disabled={!movie.id}
              >
                {movie.poster && (
                  <img src={movie.poster} alt="" loading="lazy" />
                )}
                <span className="trending-card-overlay" aria-hidden="true" />
                <span className="just-added-content">
                  {movie.type && (
                    <span className="trend-type-pill">{movie.type}</span>
                  )}
                  <span className="just-added-title">{movie.title}</span>
                  {(movie.year || movie.rating != null) && (
                    <span className="trend-meta-row">
                      {[movie.year, movie.rating == null ? null : `TMDB ${Number(movie.rating).toFixed(1)}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="section-empty">
            {justAddedLoading
              ? "Loading new releases…"
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

        {animeError && (
          <div className="catalog-error" role="alert">
            <p>{animeError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setAnimeAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {animeLoading ? (
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
                onClick={() => movie.id && navigate(movieDetailPath(movie))}
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
                onClick={() => openGenreResults()}
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
                const representative = representativePool.find(
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
                      <strong>{genre.name}</strong>
                    </span>
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
              onClick={() => openGenreResults()}
            >
              View all
            </button>
          )}
        </div>

        {genreResultsError && (
          <div className="catalog-error" role="alert">
            <p>{genreResultsError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setGenreResultsAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {genreResultsLoading ? (
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
        ) : genreResultsItems.length ? (
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
              {genreResultsItems.map((movie, index) => (
                <button
                  type="button"
                  key={movie.id ?? `${movie.title}-${index}`}
                  className="genre-result-card"
                  onClick={() => movie.id && navigate(movieDetailPath(movie))}
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
                onClick={() => activeGenre && openGenreResults()}
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
            {activeGenre
              ? `No ${browseType.toLowerCase()} titles are listed for ${activeGenre.name}.`
              : "Choose a genre to browse its titles."}
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
