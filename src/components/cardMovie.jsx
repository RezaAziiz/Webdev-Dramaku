import React from 'react';

const CardMovie = ({ poster, title, year, genre, rating, views, onClick }) => {
  return (
    <div
      onClick={onClick} // Event onClick untuk navigasi
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:bg-gray-700 cursor-pointer flex flex-col justify-between h-full"
    >
      <img src={poster} alt={title} className="w-full h-72 object-cover" />
      <div className="p-4 flex flex-col justify-between flex-grow"> {/* Updated */}
        <div className="mb-2"> {/* New wrapper for title and genre */}
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-400">Year: {year}</p>
          <p className="text-gray-400">Genre: {genre}</p>
        </div>
        <div className="flex items-center justify-between"> {/* Stays at the bottom */}
          <p className="text-yellow-400">⭐ {rating}</p>
          <p className="text-gray-400">Views: {views}M</p>
        </div>
      </div>
    </div>
  );
};

export default CardMovie;