import React, { useEffect, useState } from 'react';
import CardMovie from '../components/cardMovie';
import { useNavigate } from 'react-router-dom';
import Slider from '../components/slider';


const Home = () => {
  const [movies, setMovies] = useState([]); // All movies from server
  const [visibleMovies, setVisibleMovies] = useState([]); // Movies to display
  const [offset, setOffset] = useState(12); // Start with 12 movies
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();


  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3005/movies`);
      const data = await response.json();

      if (data.length > 0) {
        setMovies(data); // Store all movies
        setVisibleMovies(data.slice(0, 12)); // Show the first 12 movies
      } else {
        setHasMore(false); // No data available
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMoreMovies = () => {
    const nextOffset = offset + 12;
    const moreMovies = movies.slice(offset, nextOffset);

    if (moreMovies.length > 0) {
      setVisibleMovies(prevMovies => [...prevMovies, ...moreMovies]);
      setOffset(nextOffset);
    } else {
      setHasMore(false); // No more data to load
    }
  };

  useEffect(() => {
    fetchMovies(); // Run on component mount
  }, []);

  return (
    <div>
      {/* Main content */}
      <div className="relative flex justify-center items-center">
        {/* Slider Section */}
        <Slider />
      </div>
      <div className="px-12"> {/* Menambahkan padding kiri dan kanan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Render MovieCard components */}
          {visibleMovies.map((movie) => (
            <CardMovie
              key={movie.id}
              poster={movie.images || 'https://via.placeholder.com/200x250?text=No+Image'}
              title={movie.title}
              year={movie.year}
              genre={movie.genre}
              rating={movie.rating ? Number(movie.rating).toFixed(1) || '0.0' : 'N/A'}
              onClick={() => navigate(`movies/${movie.id}`)}
            />
          ))}
        </div>  
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={showMoreMovies}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
