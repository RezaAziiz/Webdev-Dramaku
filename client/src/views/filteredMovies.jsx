import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import CardMovie from '../components/cardMovie';

const FilteredMovies = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (!Array.isArray(location.state?.filteredMovies)) {
    return <Navigate to="/search?type=movie" replace />;
  }
  const filteredMovies = location.state.filteredMovies;
  const getMediaType = (type) =>
    ['tv', 'series', 'tv show', 'show'].includes(
      String(type || '').trim().toLowerCase(),
    )
      ? 'tv'
      : 'movie';

  return (
    <div>
      <div className="px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {filteredMovies && filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <CardMovie
                key={movie.id}
                poster={movie.images || 'https://via.placeholder.com/200x250?text=No+Image'}
                title={movie.title}
                year={movie.year}
                genre={movie.genre}
                rating={movie.rating ? Number(movie.rating).toFixed(1) : 'N/A'}
                onClick={() => navigate(`/movies/${getMediaType(movie.type)}/${movie.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full text-center">
              <p>No movies found matching your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredMovies;
