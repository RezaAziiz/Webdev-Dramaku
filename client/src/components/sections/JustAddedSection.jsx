import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildMediaDetailPath } from "../../lib/media";
import { useJustAddedFeed } from "../../hooks/useJustAddedFeed";
import { LuGrid, LuFilm, LuTv } from "react-icons/lu";

const JustAddedSection = ({ mediaFilter, setMediaFilter }) => {
  const navigate = useNavigate();

  const { items: justAddedItems, loading: justAddedLoading, error: justAddedError, retry: retryJustAdded } =
    useJustAddedFeed();
  const justAddedRef = useRef(null);

  const filteredJustAdded = useMemo(() => {
    if (mediaFilter === "All") return justAddedItems;
    // Filter pills use display labels ("Movie"/"Series"), while the data
    // carries TMDB media types ("movie"/"tv").
    const mediaType =
      mediaFilter === "Series" ? "tv" : mediaFilter === "Movie" ? "movie" : null;
    if (!mediaType) return justAddedItems;
    return justAddedItems.filter(
      (movie) => movie.type?.toLowerCase() === mediaType,
    );
  }, [justAddedItems, mediaFilter]);

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) navigate(path);
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

  if (justAddedItems.length === 0 && justAddedLoading) {
    return (
      <p className="section-empty">Loading new releases…</p>
    );
  }

  if (justAddedItems.length === 0 && !justAddedLoading) {
    return (
      <p className="section-empty">
        New releases will appear when the latest titles feed is connected.
      </p>
    );
  }

  return (
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
                  <div className="filter-pill-content">
                    {filter === "All" && <LuGrid aria-hidden="true" />}
                    {filter === "Movie" && <LuFilm aria-hidden="true" />}
                    {filter === "Series" && <LuTv aria-hidden="true" />}
                    <span>
                      {filter === "Movie" ? "Movies" : filter === "Series" ? "Series" : "All"}
                    </span>
                  </div>
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
            onClick={retryJustAdded}
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
              onClick={() => openMedia(movie)}
              disabled={!movie.id}
            >
              {movie.poster && (
                <img src={movie.poster} alt="" loading="lazy" />
              )}
              <span className="trending-card-overlay" aria-hidden="true" />
              <span className="just-added-content">
                {movie.type && (
                  <span className="trend-type-pill">
                    {movie.type?.toLowerCase() === "tv" ? "Series" : "Movie"}
                  </span>
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
      ) : null}
    </section>
  );
};

export default JustAddedSection;
