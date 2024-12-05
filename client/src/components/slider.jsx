import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Divergent from '../assets/divergent.png';
import Mazerunner from '../assets/mazerunner.png';
import Harrypotter from '../assets/harrychamber.jpg';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { src: Divergent, title: 'Divergent', id: 233 },
    { src: Mazerunner, title: 'The Maze Runner', id: 230 },
    { src: Harrypotter, title: 'Harry Potter and The Chamber of Secrets', id: 270 },
  ];

  const totalSlides = slides.length;

  useEffect(() => {
    const slider = document.getElementById('slider');
    if (slider) {
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  // Auto-slide effect every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleSlideClick = (movieId) => {
    navigate(`movies/${movieId}`);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative flex justify-center items-center mb-6">
      {/* Slider Container */}
      <div className="overflow-hidden w-[560px] h-[315px] flex justify-center relative">
        <div id="slider" className="flex transition-transform ease-out duration-500">
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 flex justify-center relative">
              <img
                src={slide.src}
                alt={slide.title}
                className="w-full h-full object-cover rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 cursor-pointer"
                onClick={() => handleSlideClick(slide.id)}
              />
              {/* Gradient Layer at the Top */}
              <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black to-transparent transition-opacity duration-300 pointer-events-none" />
              {/* Title on Top */}
              <div className="absolute top-2 left-4 text-gray-300 text-lg font-bold transition-opacity duration-300 pointer-events-none">
                {slide.title}
              </div>
              {/* Gradient Layer at the Bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Dots Navigation */}
        <div className="absolute bottom-3 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? 'bg-white' : 'bg-gray-600'
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
