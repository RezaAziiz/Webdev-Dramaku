import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildMediaDetailPath } from "../../lib/media";
import { getMetaLine } from "../../lib/format";
import { useTrendingFeed } from "../../hooks/useTrendingFeed";

const TrendingSection = ({ token, isAuthenticated, onOpen, onSave }) => {
  const { items: trendingItems, loading: trendingLoading, error: trendingError, retry: retryTrending } =
    useTrendingFeed();

  const [activeTrend, setActiveTrend] = useState(0);
  const [savedMovieIds, setSavedMovieIds] = useState(() => new Set());
  const [pendingBookmarkId, setPendingBookmarkId] = useState(null);
  const [bookmarkError, setBookmarkError] = useState("");

  const trendingRef = useRef(null);

  const repeatedTrendingItems = useMemo(
    () => [...trendingItems, ...trendingItems, ...trendingItems],
    [trendingItems],
  );
  const centerSlot = trendingItems.length;
  const currentIndex = trendingItems.length
    ? activeTrend % trendingItems.length
    : 0;

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) onOpen(path);
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
  }, [centerSlot, trendingItems.length, scrollToSlot]);

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
      openMedia(selectedMovie);
      return;
    }
    scrollToSlot(centerSlot + (slotIndex % trendingItems.length));
  };

  const saveToLibrary = (movie) => {
    if (!movie.id) return;
    if (!isAuthenticated) {
      onOpen("/login");
      return;
    }
    if (!token) {
      setBookmarkError("Your account information is unavailable. Please sign in again.");
      return;
    }

    setBookmarkError("");
    setPendingBookmarkId(movie.id);
    onSave(movie.id, movie.type || "movie", token)
      .then(() => {
        setSavedMovieIds((saved) => new Set(saved).add(movie.id));
      })
      .catch((error) => {
        setBookmarkError(
          error instanceof Error
            ? error.message
            : "Could not add this title to your library.",
        );
      })
      .finally(() => {
        setPendingBookmarkId(null);
      });
  };

  if (trendingItems.length === 0 && trendingLoading) {
    return (
      <p className="section-empty">
        Loading trending titles…
      </p>
    );
  }

  if (trendingItems.length === 0 && !trendingLoading) {
    return (
      <p className="section-empty">
        Trending titles will appear when the trending feed is connected.
      </p>
    );
  }

  return (
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
            onClick={retryTrending}
          >
            Retry
          </button>
        </div>
      )}

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
                      onClick={() => openMedia(movie)}
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
    </section>
  );
};

export default TrendingSection;
