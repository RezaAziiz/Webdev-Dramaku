import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFeaturedMovies from "../hooks/useFeaturedMovies";
import ResponsiveImage from "./common/ResponsiveImage";

const AUTO_SLIDE_INTERVAL_MS = 5000;
const DEFAULT_TINT = "#0d9488";
const DEFAULT_BG = "#0a1428";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

const toRgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computePaletteFromImage = (imageUrl) =>
  new Promise((resolve) => {
    if (!imageUrl || typeof window === "undefined") {
      resolve({ tint: DEFAULT_TINT, accent: DEFAULT_TINT, bg: DEFAULT_BG });
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve({ tint: DEFAULT_TINT, accent: DEFAULT_TINT, bg: DEFAULT_BG });
        return;
      }

      const sampleSize = 48;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      context.drawImage(image, 0, 0, sampleSize, sampleSize);

      const { data } = context.getImageData(0, 0, sampleSize, sampleSize);
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
        resolve({ tint: DEFAULT_TINT, accent: DEFAULT_TINT, bg: DEFAULT_BG });
        return;
      }

      const average = {
        r: totalRed / pixelCount,
        g: totalGreen / pixelCount,
        b: totalBlue / pixelCount,
      };

      const tint = rgbToHex({
        r: average.r * 0.4,
        g: average.g * 0.4,
        b: average.b * 0.4,
      });

      const accent = rgbToHex({
        r: clamp(average.r * 1.15, 0, 255),
        g: clamp(average.g * 1.15, 0, 255),
        b: clamp(average.b * 1.15, 0, 255),
      });

      resolve({
        tint,
        accent,
        bg: mixHex(DEFAULT_BG, tint, 0.7),
      });
    };

    image.onerror = () => {
      resolve({ tint: DEFAULT_TINT, accent: DEFAULT_TINT, bg: DEFAULT_BG });
    };

    image.src = imageUrl;
  });

const Slider = () => {
  const { featuredMovies, loading, error } = useFeaturedMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const totalSlides = featuredMovies.length;

  useEffect(() => {
    if (totalSlides === 0) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [totalSlides]);

  useEffect(() => {
    if (!featuredMovies[currentSlide]?.images) {
      return undefined;
    }

    let isCurrent = true;

    const applyPalette = async () => {
      const palette = await computePaletteFromImage(featuredMovies[currentSlide].images);
      if (!isCurrent) return;

      const root = document.documentElement;
      root.style.setProperty("--tint", palette.tint);
      root.style.setProperty("--bg-base", palette.bg);
      root.style.setProperty("--accent", palette.accent);
      root.style.setProperty("--accent-soft", toRgba(palette.accent, 0.18));
    };

    applyPalette();

    return () => {
      isCurrent = false;
    };
  }, [currentSlide, featuredMovies]);

  const handleSlideClick = (movieId) => {
    navigate(`movies/${movieId}`);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  if (loading || error || totalSlides === 0) {
    return null;
  }

  return (
    <div className="relative flex justify-center items-center w-full mb-6 px-4 sm:px-6">
      <div className="overflow-hidden w-full max-w-[560px] relative">
        <div
          className="flex transition-transform ease-out duration-500"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {featuredMovies.map((movie) => (
            <div
              key={movie.id}
              className="w-full flex-shrink-0 flex justify-center relative"
            >
              <ResponsiveImage
                src={movie.images}
                alt={movie.title}
                aspectRatioClassName="aspect-video"
                className="rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 cursor-pointer"
                onClick={() => handleSlideClick(movie.id)}
              />
              <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black to-transparent transition-opacity duration-300 pointer-events-none" />
              <div className="absolute top-2 left-4 text-gray-300 text-base sm:text-lg font-bold transition-opacity duration-300 pointer-events-none">
                {movie.title}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
          {featuredMovies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-white" : "bg-gray-600"
              } focus:outline-none`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
