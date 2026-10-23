import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/slider";
import { useAuth } from "../contexts/AuthContext";
import {
  normalizeContinueWatching,
  normalizeMovie,
} from "../adapters/mediaAdapter";
import {
  mockContinueWatching,
  mockJustAdded,
  mockTrending,
} from "../mocks/streaming";
import { addToWatchlist } from "../services/watchlistService";

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

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAuth();
  const [activeTrend, setActiveTrend] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("All");
  const [savedMovieIds, setSavedMovieIds] = useState(() => new Set());
  const [pendingBookmarkId, setPendingBookmarkId] = useState(null);
  const [bookmarkError, setBookmarkError] = useState("");
  const trendingRef = useRef(null);

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
  const repeatedTrendingItems = useMemo(
    () => [...trendingItems, ...trendingItems, ...trendingItems],
    [trendingItems],
  );
  const centerSlot = trendingItems.length;
  const currentIndex = trendingItems.length
    ? activeTrend % trendingItems.length
    : 0;

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
    </div>
  );
};

export default Home;
