import React from "react";
import { useNavigate } from "react-router-dom";
import { buildMediaDetailPath } from "../../lib/media";
import { useContinueWatchingFeed } from "../../hooks/useContinueWatchingFeed";
import { getTimeLeft, getMetaLine } from "../../lib/format";

const ContinueWatchingSection = ({ token }) => {
  const navigate = useNavigate();
  const { items: continueWatchingItems, loading: continueWatchingLoading, error: continueWatchingError, retry: retryContinueWatching } =
    useContinueWatchingFeed(token);

  const getTimeLeftLocal = (movie) => getTimeLeft(movie);

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) navigate(path);
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
        <div className="continue-row" aria-label="Continue watching titles">
          {continueWatchingItems.map((movie, index) => {
            const timeLeft = getTimeLeftLocal(movie);
            return (
              <button
                type="button"
                key={movie.id || `${movie.title}-${index}`}
                className="continue-card"
                onClick={() => openMedia(movie)}
                disabled={!movie.id}
              >
                <div className="continue-card-media-body">
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
                </div>
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
