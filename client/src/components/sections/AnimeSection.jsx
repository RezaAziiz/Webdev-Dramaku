import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildMediaDetailPath } from "../../lib/media";
import { useAnimeFeed } from "../../hooks/useAnimeFeed";
import { normalizeGenre } from "../../adapters/mediaAdapter";

const AnimeSection = ({ genres }) => {
  const navigate = useNavigate();
  const normalizedGenres = useMemo(
    () => genres.map(normalizeGenre).filter((genre) => genre !== null),
    [genres],
  );
  const animationGenreId = useMemo(() => {
    const match = normalizedGenres.find(
      (genre) => genre.name.toLowerCase() === "animation",
    );
    return match ? match.id : null;
  }, [normalizedGenres]);

  const { items: animeItems, loading: animeLoading, error: animeError, retry: retryAnime } =
    useAnimeFeed({ genreId: animationGenreId });

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) navigate(path);
  };

  if (animationGenreId == null) {
    return null;
  }

  if (animeItems.length === 0 && animeLoading) {
    return (
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
    );
  }

  if (animeItems.length === 0 && !animeLoading) {
    return (
      <p className="section-empty">
        Anime titles will appear here when the catalog identifies them.
      </p>
    );
  }

  return (
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
            onClick={retryAnime}
          >
            Retry
          </button>
        </div>
      )}

      <div className="anime-row" role="region" aria-label="Anime titles">
        {animeItems.map((movie, index) => (
          <button
            type="button"
            key={movie.id ?? `${movie.title}-${index}`}
            className="anime-card"
            onClick={() => openMedia(movie)}
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
    </section>
  );
};

export default AnimeSection;
