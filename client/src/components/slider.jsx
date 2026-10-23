import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFeaturedMovies from "../hooks/useFeaturedMovies";

const AUTO_SLIDE_INTERVAL_MS = 15000;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const readDefaultPalette = () => {
  if (typeof window === "undefined") {
    return { tint: "", accent: "", bg: "" };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const readToken = (token) => styles.getPropertyValue(token).trim();

  return {
    tint: readToken("--tint"),
    accent: readToken("--accent"),
    bg: readToken("--bg-base"),
    contrastText: readToken("--text-primary"),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

const hexToRgb = (hex) => {
  const parsed = hex.replace("#", "");
  const safeHex = parsed.length === 3 ? parsed.split("").map((char) => char + char).join("") : parsed;

  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  };
};

const mixHex = (baseHex, mixHexValue, amount) => {
  const first = hexToRgb(baseHex);
  const second = hexToRgb(mixHexValue);

  const blend = {
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount,
  };

  return rgbToHex(blend);
};

const relativeLuminance = (hex) => {
  const channels = Object.values(hexToRgb(hex)).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (firstHex, secondHex) => {
  const first = relativeLuminance(firstHex);
  const second = relativeLuminance(secondHex);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const darkenToLuminanceCap = (hex) => {
  let darkened = hexToRgb(hex);

  while (relativeLuminance(rgbToHex(darkened)) > 0.025) {
    darkened = {
      r: darkened.r * 0.8,
      g: darkened.g * 0.8,
      b: darkened.b * 0.8,
    };
  }

  return rgbToHex(darkened);
};

const ensureAccentContrast = (accent, background, lightText) => {
  let adjusted = accent;

  for (let step = 0; step <= 10; step += 1) {
    if (contrastRatio(adjusted, background) >= 4.5) return adjusted;
    adjusted = mixHex(adjusted, lightText, 0.1);
  }

  return adjusted;
};

const toRgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computePaletteFromImage = (imageUrl) =>
  new Promise((resolve) => {
    if (!imageUrl || typeof window === "undefined") {
      resolve(readDefaultPalette());
      return;
    }

    const defaultPalette = readDefaultPalette();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(defaultPalette);
        return;
      }

      const sampleSize = 48;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      let data;
      try {
        context.drawImage(image, 0, 0, sampleSize, sampleSize);
        data = context.getImageData(0, 0, sampleSize, sampleSize).data;
      } catch {
        resolve(defaultPalette);
        return;
      }
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      let pixelCount = 0;

      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;

        totalRed += data[index];
        totalGreen += data[index + 1];
        totalBlue += data[index + 2];
        pixelCount += 1;
      }

      if (!pixelCount) {
        resolve(defaultPalette);
        return;
      }

      const average = {
        r: totalRed / pixelCount,
        g: totalGreen / pixelCount,
        b: totalBlue / pixelCount,
      };

      const tint = darkenToLuminanceCap(rgbToHex({
        r: average.r * 0.45,
        g: average.g * 0.45,
        b: average.b * 0.45,
      }));

      const bg = mixHex(defaultPalette.bg, tint, 0.7);
      const accent = ensureAccentContrast(rgbToHex({
        r: clamp(average.r * 1.2, 0, 255),
        g: clamp(average.g * 1.2, 0, 255),
        b: clamp(average.b * 1.2, 0, 255),
      }), bg, defaultPalette.contrastText);

      resolve({
        tint,
        accent,
        bg,
      });
    };

    image.onerror = () => resolve(defaultPalette);

    image.src = imageUrl;
  });

const formatGenre = (movie) => {
  if (!movie) return "Featured";
  if (Array.isArray(movie.genre)) return movie.genre.join(" • ");
  if (movie.genre) return movie.genre;
  if (movie.category) return movie.category;
  return "Featured";
};

const formatRuntime = (movie) => {
  if (!movie) return "N/A";
  if (movie.runtime) return `${movie.runtime} min`;
  if (movie.duration) return `${movie.duration} min`;
  return "N/A";
};

const formatMetaLine = (movie) => {
  const year = movie?.year || movie?.releaseYear || "—";
  const runtime = formatRuntime(movie);
  const rating = movie?.rating ? `${movie.rating.toFixed(1)} / 10` : "";

  return [year, runtime, rating].filter(Boolean).join(" • ");
};

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

const Slider = () => {
  const { featuredMovies, loading, error } = useFeaturedMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!featuredMovies.length || prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featuredMovies.length);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [featuredMovies.length, prefersReducedMotion]);

  useEffect(() => {
    const activeMovie = featuredMovies[currentSlide];
    if (!activeMovie?.images) {
      return undefined;
    }

    let cancelled = false;

    const applyPalette = async () => {
      const palette = await computePaletteFromImage(activeMovie.images);
      if (cancelled) return;

      const appRoot = document.querySelector(".app-shell");
      if (!appRoot) return;

      appRoot.style.setProperty("--tint", palette.tint);
      appRoot.style.setProperty("--bg-base", palette.bg);
      appRoot.style.setProperty("--accent", palette.accent);
      appRoot.style.setProperty("--accent-soft", toRgba(palette.accent, 0.18));
    };

    applyPalette();

    return () => {
      cancelled = true;
    };
  }, [currentSlide, featuredMovies]);

  const activeMovie = featuredMovies[currentSlide] || null;
  const upNext = useMemo(() => {
    if (!featuredMovies.length) return [];
    const reordered = [...featuredMovies.slice(currentSlide + 1), ...featuredMovies.slice(0, currentSlide)];
    return reordered.slice(0, 3);
  }, [currentSlide, featuredMovies]);

  if (loading || error || !activeMovie) {
    return null;
  }

  const openMovie = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <section className="hero-shell" aria-label="Featured titles">
      <div className="hero-reel">
        {featuredMovies.map((movie, index) => {
          const isActive = index === currentSlide;
          const synopsis = movie.synopsis || movie.description || movie.summary || "A cinematic pick for tonight.";

          return (
            <article
              key={movie.id ?? `${movie.title}-${index}`}
              className={`hero-slide${isActive ? " is-active" : ""}`}
              aria-hidden={!isActive}
            >
              <img
                src={movie.images}
                alt={movie.title || "Featured title"}
                className="hero-slide-image"
              />
              <div className="hero-slide-overlay" />
              <div className="hero-content">
                <div className="hero-chip-row">
                  <span className="hero-chip">{formatGenre(movie)}</span>
                  {movie.rating ? <span className="hero-chip hero-chip--muted">{movie.rating.toFixed(1)}</span> : null}
                </div>
                <h1 className="hero-title">{renderTitle(movie.title)}</h1>
                <div className="hero-meta">{formatMetaLine(movie)}</div>
                <p className="hero-synopsis">{synopsis}</p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-button hero-button--primary"
                    onClick={() => openMovie(movie.id)}
                  >
                    Play now
                  </button>
                  <button
                    type="button"
                    className="hero-icon-button"
                    aria-label={`Save ${movie.title}`}
                    onClick={() => openMovie(movie.id)}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    className="hero-icon-button"
                    aria-label={`View details for ${movie.title}`}
                    onClick={() => openMovie(movie.id)}
                  >
                    i
                  </button>
                </div>
                <div className="hero-progress" aria-label="Featured item progress">
                  {featuredMovies.map((item, slideIndex) => (
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
            onClick={() => openMovie(movie.id)}
          >
            <img src={movie.images} alt={movie.title || "Featured title"} />
            <span>{movie.title}</span>
          </button>
        ))}
      </div>

      <aside className="hero-up-next" aria-label="Up next">
        <div className="hero-up-next-header">
          <span>Up next</span>
          <button type="button" className="hero-up-next-link" onClick={() => openMovie(activeMovie.id)}>
            View all
          </button>
        </div>
        <div className="hero-up-next-list">
          {upNext.map((movie) => (
            <button
              key={`upnext-${movie.id ?? movie.title}`}
              type="button"
              className="hero-up-next-item"
              onClick={() => setCurrentSlide(featuredMovies.findIndex((item) => item.id === movie.id) || 0)}
            >
              <img src={movie.images} alt={movie.title || "Upcoming title"} />
              <div>
                <span className="hero-up-next-label">Spotlight</span>
                <strong>{movie.title}</strong>
                <small>{formatMetaLine(movie)}</small>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
};

export default Slider;
