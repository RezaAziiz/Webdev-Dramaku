import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFeaturedMovies from "../hooks/useFeaturedMovies";
import ResponsiveImage from "./common/ResponsiveImage";

const AUTO_SLIDE_INTERVAL_MS = 5000;

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
