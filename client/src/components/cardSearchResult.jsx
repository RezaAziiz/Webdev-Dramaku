import React from 'react';

const CardResult = ({ movie, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-start bg-gray-900 rounded-lg p-4 shadow-md hover:bg-gray-800 hover:shadow-lg transition duration-300 ease-in-out cursor-pointer relative">
      <img
        src={movie.images || 'https://via.placeholder.com/200x300?text=No+Image+Available'}
        alt={`${movie.title} Poster`}
        className="w-48 h-72 object-cover rounded-xl mr-4"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div className="mb-2 space-y-1">
          <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
          <p className="text-gray-400">{movie.year}</p>
          <p className="text-gray-400">{movie.genre}</p>
          <p className="text-gray-400">
            {movie.actors && movie.actors.length > 0
              ? movie.actors || movie.actors : 'No actor available'}
          </p>
          <p id="synopsis" className="text-gray-400">
            {movie.synopsis.length > 150
              ? movie.synopsis.substring(0, 250) + '...'
              : movie.synopsis}
          </p>
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-4">
          <p className="text-yellow-400">⭐ {movie.rating ? Number(movie.rating).toFixed(1) || '0.0' : 'N/A'}</p>
          {/* <p className="text-gray-400">Views: {movie.views || 'N/A'}</p> */}
        </div>
      </div>
    </div>
  );
};

export default CardResult;
