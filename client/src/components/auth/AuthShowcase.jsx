import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";
import useFeaturedMovies from "../../hooks/useFeaturedMovies";
import { TMDB_BACKDROP_SIZE, tmdbImageUrl } from "../../lib/media";

const SLIDE_INTERVAL_MS = 3000;

const AuthShowcase = ({ mode }) => {
  const { featuredMovies } = useFeaturedMovies();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const slides = featuredMovies.filter((movie) => movie.backdrop || movie.poster);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  const title =
    mode === "register"
      ? "Start your next watchlist."
      : "Pick up where you left off.";

  return (
    <aside className="auth-showcase" aria-label="Featured titles">
      <div className="auth-showcase-art" aria-hidden="true">
        {slides.map((movie, index) => (
          <img
            key={movie.id ?? `${movie.title}-${index}`}
            className={`auth-showcase-poster${index === activeIndex ? " is-active" : ""}`}
            src={tmdbImageUrl(movie.backdrop || movie.poster, TMDB_BACKDROP_SIZE)}
            alt=""
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="auth-showcase-shade" />
      </div>
      <Link className="auth-brand" to="/" aria-label="Lumo home">
        <img src={logo} alt="Lumo" />
      </Link>
      <div className="auth-showcase-copy">
        <h2>{title}</h2>
        <p>Movies, series, and anime — all in one place.</p>
      </div>
    </aside>
  );
};

export default AuthShowcase;
