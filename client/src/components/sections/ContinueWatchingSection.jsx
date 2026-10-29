import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildMediaDetailPath } from "../../lib/media";
import { useContinueWatchingFeed } from "../../hooks/useContinueWatchingFeed";
import {
  getProgressPercent,
  getTimeLeft,
  getMetaLine,
} from "../../lib/format";

const ContinueWatchingSection = ({ token }) => {
  const navigate = useNavigate();
  const { items: continueWatchingItems, loading: continueWatchingLoading, error: continueWatchingError, retry: retryContinueWatching } =
    useContinueWatchingFeed(token);
  const continueWatchingRef = useRef(null);

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) navigate(path);
  };

  const scrollCarousel = (direction) => {
    const track = continueWatchingRef.current;
    if (!track) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (
    !continueWatchingItems.length &&
    !continueWatchingError &&
    !continueWatchingLoading
  ) {
    return null;
  }

  return (
    <section
      className="media-section"
      aria-labelledby="continue-title"
    >
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
        {continueWatchingItems.length > 1 && (
          <div
            className="trending-controls just-added-controls"
            aria-label="Continue watching carousel controls"
          >
            <button
              type="button"
              aria-label="Previous title"
              onClick={() => scrollCarousel(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next title"
              onClick={() => scrollCarousel(1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="continue-watching-content">
      {continueWatchingError && (
        <div className="catalog-error" role="alert">
          <p>{continueWatchingError}</p>
          <button
            type="button"
            className="retry-button"
            onClick={retryContinueWatching}
          >
            Retry
          </button>
        </div>
      )}
      {continueWatchingItems.length > 0 && (
        <div
          className="continue-row"
          ref={continueWatchingRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Continue watching titles"
        >
          {continueWatchingItems.map((movie, index) => {
            const timeLeft = getTimeLeft(movie);
            const progressPercent = getProgressPercent(movie);
            return (
              <button
                type="button"
                key={movie.id || `${movie.title}-${index}`}
                className="continue-card"
                onClick={() => openMedia(movie)}
                disabled={!movie.id}
              >
                {movie.poster && (
                  <img src={movie.poster} alt="" loading="lazy" />
                )}
                <span className="continue-card-overlay" aria-hidden="true" />
                <span className="continue-card-body">
                  <span className="continue-card-head">
                    <strong>{movie.title}</strong>
                    {movie.episode && <span>{movie.episode}</span>}
                  </span>
                  {progressPercent != null && (
                    <span
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${movie.title} progress`}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={progressPercent}
                    >
                      <span
                        style={{
                          width: `${progressPercent}%`,
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
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
