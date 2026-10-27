import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlay } from "react-icons/lu";
import useFeaturedMovies from "../hooks/useFeaturedMovies";
import { getImageUrl } from "../lib/color";
import { mediaDetailType } from "../lib/media";
import { formatGenre, formatMetaLine } from "../lib/format";
import { useHeroPalette } from "../hooks/useHeroPalette";

const AUTO_SLIDE_INTERVAL_MS = 15000;

const renderTitle = (title) => {
  const words = (title || "Untitled").trim().split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return <>{title || "Untitled"}</>;
  }

  const accentWords = words.slice(-2).join(" ");
  const leadText = words.slice(0, -2).join(" ");

  return (
    <>
      {leadText && <span>{leadText} </span>}
      <span className="hero-title-highlight">{accentWords}</span>
    </>
  );
};

const Slider = ({ fallbackMovies = [] }) => {
  const { featuredMovies, loading } = useFeaturedMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const navigate = useNavigate();
  const heroMovies = featuredMovies.length ? featuredMovies : fallbackMovies;
  const activeMovie = heroMovies[currentSlide] || null;

  useHeroPalette(activeMovie);

  useEffect(() => {
    if (currentSlide >= heroMovies.length) setCurrentSlide(0);
  }, [currentSlide, heroMovies.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!heroMovies.length || prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroMovies.length);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [heroMovies.length, prefersReducedMotion]);

  const upNext = useMemo(() => {
    if (!heroMovies.length) return [];
    const reordered = [
      ...heroMovies.slice(currentSlide + 1),
      ...heroMovies.slice(0, currentSlide),
    ];
    return reordered.slice(0, 3);
  }, [currentSlide, heroMovies]);

  if (!activeMovie || (loading && fallbackMovies.length === 0)) {
    return null;
  }

  const openMovie = (movieId, mediaType = "movie") => {
    if (movieId == null) return;
    navigate(
      `/movies/${mediaDetailType(mediaType)}/${encodeURIComponent(movieId)}`,
    );
  };

  const backdropImage = getImageUrl(activeMovie);

  return (
    <>
      {backdropImage && (
        <img
          className="hero-palette-backdrop"
          src={backdropImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchpriority="low"
        />
      )}
      <section className="hero-shell" aria-label="Featured titles">
        <div className="hero-reel">
          {heroMovies.map((movie, index) => {
            const isActive = index === currentSlide;
            const synopsis =
              movie.synopsis || movie.description || movie.summary || "";
            const imageUrl = getImageUrl(movie);

            return (
              <article
                key={movie.id ?? `${movie.title}-${index}`}
                className={`hero-slide${isActive ? " is-active" : ""}`}
                aria-hidden={!isActive}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={movie.title || ""}
                    className="hero-slide-image"
                    fetchpriority={index === currentSlide ? "high" : "auto"}
                  />
                )}
                <div className="hero-slide-overlay" />
                <div className="hero-content">
                  <div className="hero-chip-row">
                    <span className="hero-chip">{formatGenre(movie)}</span>
                    {movie.rating ? (
                      <span className="hero-chip hero-chip--muted">
                        {movie.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <h1 className="hero-title">{renderTitle(movie.title)}</h1>
                  <div className="hero-meta">{formatMetaLine(movie)}</div>
                  {synopsis && <p className="hero-synopsis">{synopsis}</p>}
                  <div className="hero-actions">
                    <button
                      type="button"
                      className="hero-button hero-button--primary"
                      onClick={() => openMovie(movie.id, movie.type)}
                    >
                      <LuPlay aria-hidden="true" />
                      Play now
                    </button>
                    <button
                      type="button"
                      className="hero-icon-button"
                      aria-label={`Save ${movie.title}`}
                      onClick={() => openMovie(movie.id, movie.type)}
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      className="hero-icon-button"
                      aria-label={`View details for ${movie.title}`}
                      onClick={() => openMovie(movie.id, movie.type)}
                    >
                      i
                    </button>
                  </div>
                  <div className="hero-progress" aria-label="Featured item progress">
                    {heroMovies.map((item, slideIndex) => (
                      <button
                        key={`${item.id ?? item.title}-dot-${slideIndex}`}
                        type="button"
                        aria-label={`View slide ${slideIndex + 1}`}
                        className={`hero-dot${slideIndex === currentSlide ? " is-active" : ""}`}
                        onClick={() => setCurrentSlide(slideIndex)}
                      />
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hero-mobile-strip" aria-label="More featured titles">
          {upNext.map((movie) => (
            <button
              key={`mobile-${movie.id ?? movie.title}`}
              type="button"
              className="hero-strip-card"
              onClick={() => openMovie(movie.id, movie.type)}
            >
              <img src={getImageUrl(movie)} alt="" loading="lazy" />
              <span>{movie.title}</span>
            </button>
          ))}
        </div>

        <aside className="hero-up-next" aria-label="Up next">
          <header className="hero-up-next-header">
            <h2>Up next</h2>
            <button
              type="button"
              className="hero-up-next-link"
              onClick={() => navigate("/#trending")}
            >
              View all
            </button>
          </header>
          <div className="hero-up-next-list">
            {upNext.map((movie) => (
              <button
                key={`upnext-${movie.id ?? movie.title}`}
                type="button"
                className="hero-up-next-item"
                onClick={() => {
                  const index = heroMovies.findIndex(
                    (item) => item.id === movie.id,
                  );
                  setCurrentSlide(index >= 0 ? index : 0);
                }}
              >
                <img src={getImageUrl(movie)} alt="" loading="lazy" />
                <div>
                  <strong>{movie.title}</strong>
                  <small>{formatMetaLine(movie)}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
};

export default Slider;
