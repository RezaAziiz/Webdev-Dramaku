import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildMediaDetailPath } from "../../lib/media";
import { useGenreFeed } from "../../hooks/useGenreFeed";
import { normalizeGenre } from "../../adapters/mediaAdapter";
import { getMetaLine } from "../../lib/format";
import { LuFilm, LuTv, LuCompass } from "react-icons/lu";

const BrowseByGenreSection = ({ genres, representativeItems = [], onGenreViewAll }) => {
  const navigate = useNavigate();

  const [activeGenreId, setActiveGenreId] = useState(null);
  const [browseType, setBrowseType] = useState("Movie");

  const normalizedGenres = useMemo(
    () => genres.map(normalizeGenre).filter((genre) => genre !== null),
    [genres],
  );
  const activeGenre =
    normalizedGenres.find((genre) => genre.id === activeGenreId) ??
    normalizedGenres[0] ??
    null;
  const activeBrowseGenreId = useMemo(() => {
    if (!activeGenre) return null;
    const typeId = browseType === "Movie" ? activeGenre.movieId : activeGenre.tvId;
    if (typeId != null) return typeId;

    if (browseType === "TV Show" && activeGenre.name.toLowerCase() === "action") {
      return normalizedGenres.find(
        (genre) => genre.name.toLowerCase() === "action & adventure",
      )?.tvId ?? null;
    }

    if (activeGenre.movieId !== undefined || activeGenre.tvId !== undefined) {
      return null;
    }

    return activeGenre.id;
  }, [activeGenre, browseType, normalizedGenres]);

  const genreRepresentatives = useMemo(() => {
    const usedPosters = new Set();
    return new Map(
      normalizedGenres.map((genre) => {
        const representative = representativeItems.find(
          (movie) =>
            movie.poster &&
            !usedPosters.has(movie.poster) &&
            movie.genre.some(
              (name) => name.toLowerCase() === genre.name.toLowerCase(),
            ),
        );
        if (representative) usedPosters.add(representative.poster);
        return [genre.id, representative];
      }),
    );
  }, [normalizedGenres, representativeItems]);

  const { items: genreResultsItems, loading: genreResultsLoading, error: genreResultsError, retry: retryGenreResults } =
    useGenreFeed({ genreId: activeBrowseGenreId, mediaType: browseType });

  const genreTrackRef = useRef(null);
  const genreResultsTrackRef = useRef(null);

  const openMedia = (movie) => {
    const path = buildMediaDetailPath(movie);
    if (path) navigate(path);
  };

  const selectGenre = useCallback((genreId) => {
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
  }, []);

  const openGenreResults = () => {
    if (activeGenre) {
      onGenreViewAll(activeGenre, browseType);
    }
  };

  const scrollCarousel = useCallback((ref, direction) => {
    const track = ref.current;
    if (!track) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return (
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
                  <div className="browse-type-content">
                    {type === "Movie" && <LuFilm aria-hidden="true" />}
                    {type === "TV Show" && <LuTv aria-hidden="true" />}
                    <span>{type === "Movie" ? "Movies" : "TV Shows"}</span>
                  </div>
                </button>
              ))}

          </div>
          {activeGenre && (
            <button
              type="button"
              className="browse-genre-link"
              onClick={openGenreResults}
            >
              <LuCompass aria-hidden="true" />
              Browse {activeGenre.name} <span aria-hidden="true">↗</span>
            </button>

          )}
        </div>
      </div>

      {genreResultsError && (
        <div className="catalog-error" role="alert">
          <p>{genreResultsError}</p>
          <button
            type="button"
            className="retry-button"
            onClick={retryGenreResults}
          >
            Retry
          </button>
        </div>
      )}

      {genreResultsLoading ? (
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
              const representative = genreRepresentatives.get(genre.id);
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
            onClick={openGenreResults}
          >
            View all
          </button>
        )}
      </div>

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
                onClick={() => openMedia(movie)}
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
  );
};

export default BrowseByGenreSection;
